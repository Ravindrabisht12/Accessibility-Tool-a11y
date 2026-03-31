import express from "express";
import db from "../database/db.js";
import ScannerQueue from "../scanner/scanner-queue.js";
import SiteCrawler from "../scanner/site-crawler.js";
import ReportGenerator from "../reports/report-generator.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const reportGenerator = new ReportGenerator();

// Initialize scanner queue
let scannerQueue = null;

export async function initializeScannerQueue() {
  scannerQueue = new ScannerQueue({ maxConcurrent: 3 });
  await scannerQueue.initialize();
}

// GET /api/sites - List all sites
router.get("/sites", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM sites ORDER BY name");
    const sites = stmt.all();

    // Get page count for each site
    const getPages = db.prepare("SELECT COUNT(*) as count FROM pages WHERE site_id = ?");

    sites.forEach((site) => {
      const result = getPages.get(site.id);
      site.pageCount = result.count;
    });

    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sites/:id - Get site details
router.get("/sites/:id", (req, res) => {
  try {
    const getSite = db.prepare("SELECT * FROM sites WHERE id = ?");
    const site = getSite.get(req.params.id);

    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }

    const getPages = db.prepare("SELECT * FROM pages WHERE site_id = ?");
    site.pages = getPages.all(site.id);

    res.json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sites - Create new site
router.post("/sites", (req, res) => {
  try {
    const { name, url, pages = ["/"] } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: "Name and URL are required" });
    }

    const siteId = uuidv4();

    const insertSite = db.prepare(`
      INSERT INTO sites (id, name, url, enabled) 
      VALUES (?, ?, ?, 1)
    `);

    insertSite.run(siteId, name, url);

    // Insert pages
    const insertPage = db.prepare(`
      INSERT INTO pages (site_id, path) VALUES (?, ?)
    `);

    pages.forEach((path) => {
      insertPage.run(siteId, path);
    });

    res.status(201).json({ id: siteId, name, url, pages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sites/:id - Update site
router.put("/sites/:id", (req, res) => {
  try {
    const { name, url, enabled, pages } = req.body;

    const updateSite = db.prepare(`
      UPDATE sites 
      SET name = ?, url = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    const result = updateSite.run(name, url, enabled ? 1 : 0, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Site not found" });
    }

    // Update pages if provided
    if (pages) {
      const deletePages = db.prepare("DELETE FROM pages WHERE site_id = ?");
      deletePages.run(req.params.id);

      const insertPage = db.prepare("INSERT INTO pages (site_id, path) VALUES (?, ?)");
      pages.forEach((path) => {
        insertPage.run(req.params.id, path);
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sites/:id - Delete site
router.delete("/sites/:id", (req, res) => {
  try {
    const deleteSite = db.prepare("DELETE FROM sites WHERE id = ?");
    const result = deleteSite.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Site not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scan - Trigger manual scan
router.post("/scan", async (req, res) => {
  try {
    const { url, siteId } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const result = await scannerQueue.addScan(url, {
      siteId: siteId || "manual",
      scanType: "manual",
    });

    res.json({
      scanId: result.scanId,
      url: result.url,
      duration: result.duration,
      summary: result.summary,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scan/site/:id - Scan entire site
router.post("/scan/site/:id", async (req, res) => {
  try {
    const getSite = db.prepare("SELECT * FROM sites WHERE id = ?");
    const site = getSite.get(req.params.id);

    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }

    const getPages = db.prepare("SELECT path FROM pages WHERE site_id = ?");
    const pages = getPages.all(site.id);

    const scanPromises = pages.map((page) => {
      const fullUrl = new URL(page.path, site.url).href;
      return scannerQueue.addScan(fullUrl, {
        siteId: site.id,
        pagePath: page.path,
        scanType: "manual",
      });
    });

    const results = await Promise.allSettled(scanPromises);

    res.json({
      siteId: site.id,
      siteName: site.name,
      totalPages: pages.length,
      results: results.map((r) => (r.status === "fulfilled" ? r.value : { error: r.reason.message })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scans - Get scan history
router.get("/scans", (req, res) => {
  try {
    const { siteId, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT s.*, si.name as site_name 
      FROM scans s
      LEFT JOIN sites si ON s.site_id = si.id
    `;

    const params = [];

    if (siteId) {
      query += " WHERE s.site_id = ?";
      params.push(siteId);
    }

    query += " ORDER BY s.started_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const stmt = db.prepare(query);
    const scans = stmt.all(...params);

    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scan/:id - Get specific scan results
router.get("/scan/:id", (req, res) => {
  try {
    const getScan = db.prepare(`
      SELECT s.*, si.name as site_name 
      FROM scans s
      LEFT JOIN sites si ON s.site_id = si.id
      WHERE s.id = ?
    `);

    const scan = getScan.get(req.params.id);

    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }

    const getViolations = db.prepare(`
      SELECT * FROM violations 
      WHERE scan_id = ? 
      ORDER BY 
        CASE impact 
          WHEN 'critical' THEN 1 
          WHEN 'serious' THEN 2 
          WHEN 'moderate' THEN 3 
          WHEN 'minor' THEN 4 
        END
    `);

    scan.violations = getViolations.all(req.params.id);

    res.json(scan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/:id/:format - Generate and download report
router.get("/reports/:id/:format", (req, res) => {
  try {
    const { id, format } = req.params;

    let filepath;
    let contentType;
    let filename;

    switch (format) {
      case "html":
        filepath = reportGenerator.generateHTMLReport(id);
        contentType = "text/html";
        filename = `accessibility-report-${id}.html`;
        break;
      case "json":
        filepath = reportGenerator.generateJSONReport(id);
        contentType = "application/json";
        filename = `accessibility-report-${id}.json`;
        break;
      case "csv":
        filepath = reportGenerator.generateCSVReport(id);
        contentType = "text/csv";
        filename = `accessibility-report-${id}.csv`;
        break;
      default:
        return res.status(400).json({ error: "Invalid format" });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.sendFile(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/stats - Get dashboard statistics
router.get("/dashboard/stats", (req, res) => {
  try {
    const stats = {};

    // Total sites
    const siteCount = db.prepare("SELECT COUNT(*) as count FROM sites").get();
    stats.totalSites = siteCount.count;

    // Total scans
    const scanCount = db.prepare("SELECT COUNT(*) as count FROM scans").get();
    stats.totalScans = scanCount.count;

    // Recent scans (last 7 days)
    const recentScans = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM scans 
      WHERE started_at >= datetime('now', '-7 days')
    `,
      )
      .get();
    stats.recentScans = recentScans.count;

    // Total violations
    const violations = db
      .prepare(
        `
      SELECT 
        SUM(critical_count) as critical,
        SUM(serious_count) as serious,
        SUM(moderate_count) as moderate,
        SUM(minor_count) as minor
      FROM scans 
      WHERE status = 'completed'
    `,
      )
      .get();
    stats.violations = violations;

    // Latest scan
    const latestScan = db
      .prepare(
        `
      SELECT s.*, si.name as site_name 
      FROM scans s
      LEFT JOIN sites si ON s.site_id = si.id
      ORDER BY s.started_at DESC 
      LIMIT 1
    `,
      )
      .get();
    stats.latestScan = latestScan;

    // Scanner queue status
    stats.queueStatus = scannerQueue.getStatus();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sites/:id/discover - Auto-discover pages by crawling the site
// (same technique used by Level Access, Axe Monitor, Deque etc.)
router.post("/sites/:id/discover", async (req, res) => {
  const getSite = db.prepare("SELECT * FROM sites WHERE id = ?");
  const site = getSite.get(req.params.id);

  if (!site) {
    return res.status(404).json({ error: "Site not found" });
  }

  const { maxPages = 100, maxDepth = 4 } = req.body;

  console.log(`\n🕷️  Starting crawler for ${site.name} (${site.url})`);
  console.log(`   Max pages: ${maxPages}  |  Max depth: ${maxDepth}\n`);

  const crawler = new SiteCrawler({
    maxPages: Math.min(parseInt(maxPages) || 100, 500), // cap at 500
    maxDepth: Math.min(parseInt(maxDepth) || 4, 8),
    onProgress: (found, queued) => {
      process.stdout.write(`\r   Found: ${found} pages  |  Queue: ${queued}   `);
    },
  });

  try {
    await crawler.initialize();
    const paths = await crawler.discoverPages(site.url);
    await crawler.close();

    console.log(`\n✅ Crawl complete: ${paths.length} pages discovered`);

    // Replace existing pages with newly discovered ones
    const deletePages = db.prepare("DELETE FROM pages WHERE site_id = ?");
    const insertPage = db.prepare("INSERT OR IGNORE INTO pages (site_id, path) VALUES (?, ?)");

    deletePages.run(req.params.id);
    for (const path of paths) {
      insertPage.run(req.params.id, path);
    }

    res.json({
      siteId: req.params.id,
      siteName: site.name,
      discovered: paths.length,
      pages: paths,
    });
  } catch (error) {
    await crawler.close().catch(() => {});
    console.error(`❌ Crawler failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/trends - Get violation trends
router.get("/trends", (req, res) => {
  try {
    const { siteId, days = 30 } = req.query;

    let query = `
      SELECT 
        DATE(started_at) as date,
        SUM(critical_count) as critical,
        SUM(serious_count) as serious,
        SUM(moderate_count) as moderate,
        SUM(minor_count) as minor,
        COUNT(*) as scan_count
      FROM scans 
      WHERE status = 'completed' 
        AND started_at >= datetime('now', '-' || ? || ' days')
    `;

    const params = [parseInt(days)];

    if (siteId) {
      query += " AND site_id = ?";
      params.push(siteId);
    }

    query += " GROUP BY DATE(started_at) ORDER BY date";

    const stmt = db.prepare(query);
    const trends = stmt.all(...params);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
