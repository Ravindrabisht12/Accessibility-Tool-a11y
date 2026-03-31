import { chromium } from "playwright";

interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
}

interface CrawlResult {
  pages: string[];
  discovered: number;
}

export class SiteCrawler {
  async discover(baseUrl: string, options: CrawlOptions = {}): Promise<CrawlResult> {
    const maxPages = options.maxPages ?? 100;
    const maxDepth = options.maxDepth ?? 4;

    const base = new URL(baseUrl);
    const visited = new Set<string>();
    const toVisit: Array<{ url: string; depth: number }> = [{ url: baseUrl, depth: 0 }];
    const found: string[] = [];

    const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

    try {
      const context = await browser.newContext({
        userAgent: "AccessibilityMonitor/2.0 (Crawler)",
      });
      const page = await context.newPage();

      while (toVisit.length > 0 && found.length < maxPages) {
        const item = toVisit.shift();
        if (!item) break;
        const { url, depth } = item;

        const normalized = this.normalize(url);
        if (visited.has(normalized)) continue;
        visited.add(normalized);

        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

          const path = new URL(url).pathname;
          if (!found.includes(path)) found.push(path);

          if (depth < maxDepth) {
            const hrefs = await page.$$eval("a[href]", (anchors) =>
              anchors.map((a) => (a as HTMLAnchorElement).href),
            );

            for (const href of hrefs) {
              try {
                const link = new URL(href);
                if (link.hostname !== base.hostname) continue;
                if (link.pathname.match(/\.(pdf|zip|png|jpg|jpeg|gif|svg|ico|css|js|woff)$/i))
                  continue;
                const full = `${link.origin}${link.pathname}`;
                if (!visited.has(this.normalize(full))) {
                  toVisit.push({ url: full, depth: depth + 1 });
                }
              } catch {
                // invalid URL, skip
              }
            }
          }
        } catch {
          // page failed to load, skip
        }
      }

      await context.close();
    } finally {
      await browser.close();
    }

    return { pages: found, discovered: found.length };
  }

  private normalize(url: string): string {
    try {
      const u = new URL(url);
      return `${u.hostname}${u.pathname}`.replace(/\/$/, "");
    } catch {
      return url;
    }
  }
}
