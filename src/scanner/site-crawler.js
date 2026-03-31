import { chromium } from "playwright";

/**
 * SiteCrawler — auto-discovers all pages on a site by following internal links.
 *
 * How it works (same as Level Access / Axe Monitor):
 *  1. Start at the root URL (e.g. https://example.com/)
 *  2. Load the page with a real browser (Playwright)
 *  3. Extract every <a href> that points to the same domain
 *  4. Add new URLs to the queue (deduplicated)
 *  5. Repeat until maxPages or maxDepth is reached
 */
class SiteCrawler {
  constructor(options = {}) {
    this.maxPages = options.maxPages || 100;
    this.maxDepth = options.maxDepth || 4;
    this.timeout = options.timeout || 15000;
    this.concurrency = options.concurrency || 3;
    this.browser = null;
    this.onProgress = options.onProgress || null; // callback(discovered, queued)
  }

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage"],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Crawl the site starting from baseUrl and return an array of unique paths.
   * @param {string} baseUrl - e.g. "https://www.brillmark.com/"
   * @returns {Promise<string[]>} - Array of paths like ["/", "/about", "/contact", ...]
   */
  async discoverPages(baseUrl) {
    const base = new URL(baseUrl);
    const baseOrigin = base.origin; // e.g. "https://www.brillmark.com"

    const visited = new Set(); // normalized full URLs already crawled
    const queued = new Set(); // normalized full URLs in queue
    const discovered = new Set(); // paths found so far

    // Queue entries: { url, depth }
    const queue = [{ url: this.normalizeUrl(baseUrl), depth: 0 }];
    const startNorm = this.normalizeUrl(baseUrl);
    queued.add(startNorm);

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: "AccessibilityMonitor/1.0 Crawler (Playwright)",
      ignoreHTTPSErrors: true,
    });

    try {
      while (queue.length > 0 && discovered.size < this.maxPages) {
        const { url, depth } = queue.shift();

        if (visited.has(url)) continue;
        visited.add(url);

        let page = null;
        try {
          page = await context.newPage();

          // Block images, fonts, and media to speed up crawling
          await page.route("**/*", (route) => {
            const type = route.request().resourceType();
            if (["image", "media", "font", "stylesheet"].includes(type)) {
              route.abort();
            } else {
              route.continue();
            }
          });

          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: this.timeout,
          });

          // Record this page's path
          const urlObj = new URL(url);
          const path = urlObj.pathname || "/";
          discovered.add(path === "" ? "/" : path);

          if (this.onProgress) {
            this.onProgress(discovered.size, queue.length);
          }

          // Don't crawl deeper if at max depth
          if (depth < this.maxDepth) {
            // Extract all internal links
            const links = await page.evaluate((origin) => {
              return Array.from(document.querySelectorAll("a[href]"))
                .map((a) => {
                  try {
                    return new URL(a.getAttribute("href"), window.location.href).href;
                  } catch {
                    return null;
                  }
                })
                .filter((href) => href && href.startsWith(origin) && !href.includes("#") && !href.match(/\.(pdf|zip|jpg|jpeg|png|gif|svg|mp4|mp3|ico|xml|txt|css|js)(\?|$)/i));
            }, baseOrigin);

            for (const link of links) {
              const norm = this.normalizeUrl(link);
              if (!visited.has(norm) && !queued.has(norm)) {
                queued.add(norm);
                queue.push({ url: norm, depth: depth + 1 });
              }
            }
          }
        } catch (err) {
          console.warn(`  ⚠️  Crawler skipped ${url}: ${err.message.split("\n")[0]}`);
        } finally {
          if (page) await page.close().catch(() => {});
        }
      }
    } finally {
      await context.close().catch(() => {});
    }

    return Array.from(discovered).sort();
  }

  /**
   * Normalize a URL: remove trailing slash (except root), hash, and common tracking params.
   */
  normalizeUrl(url) {
    try {
      const u = new URL(url);
      u.hash = "";
      // Remove common tracking query params
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "fbclid", "gclid"].forEach((p) => u.searchParams.delete(p));
      // Normalize path: remove trailing slash unless it's root
      let path = u.pathname;
      if (path !== "/" && path.endsWith("/")) {
        path = path.slice(0, -1);
      }
      return `${u.protocol}//${u.hostname}${path}${u.search}`;
    } catch {
      return url;
    }
  }
}

export default SiteCrawler;
