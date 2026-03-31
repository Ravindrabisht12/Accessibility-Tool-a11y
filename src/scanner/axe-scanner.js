import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { v4 as uuidv4 } from "uuid";
import db from "../database/db.js";

class AxeScanner {
  constructor(options = {}) {
    this.timeout = options.timeout || 30000;
    this.wcagLevel = options.wcagLevel || "AA";
    this.includeWCAG22 = options.includeWCAG22 !== false;
    this.browser = null;
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
    }
  }

  async scanUrl(url, options = {}) {
    const scanId = uuidv4();
    const startTime = Date.now();

    const insertScan = db.prepare(`
      INSERT INTO scans (id, site_id, page_path, full_url, status, scan_type, wcag_level)
      VALUES (?, ?, ?, ?, 'running', ?, ?)
    `);

    insertScan.run(scanId, options.siteId || "manual", options.pagePath || "/", url, options.scanType || "manual", this.wcagLevel);

    let context = null;
    let page = null;

    try {
      // Create browser context
      context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: "AccessibilityMonitor/1.0 (Playwright)",
      });

      page = await context.newPage();

      // Navigate to URL
      console.log(`Scanning: ${url}`);
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: this.timeout,
      });

      // Run accessibility scan with AxeBuilder
      const axeBuilder = new AxeBuilder({ page }).withTags(this.getWCAGTags());

      const axeResults = await axeBuilder.analyze();
      const violations = axeResults.violations;

      // Process results
      const summary = this.processViolations(violations, scanId);

      const duration = Date.now() - startTime;

      // Update scan record
      const updateScan = db.prepare(`
        UPDATE scans 
        SET status = 'completed',
            completed_at = CURRENT_TIMESTAMP,
            duration_ms = ?,
            total_violations = ?,
            critical_count = ?,
            serious_count = ?,
            moderate_count = ?,
            minor_count = ?
        WHERE id = ?
      `);

      updateScan.run(duration, summary.total, summary.critical, summary.serious, summary.moderate, summary.minor, scanId);

      console.log(`✅ Scan completed: ${summary.total} violations found`);

      return {
        scanId,
        url,
        duration,
        summary: summary,
        violations: violations,
      };
    } catch (error) {
      console.error(`❌ Scan failed for ${url}:`, error.message);

      const updateScan = db.prepare(`
        UPDATE scans 
        SET status = 'failed',
            completed_at = CURRENT_TIMESTAMP,
            duration_ms = ?,
            error_message = ?
        WHERE id = ?
      `);

      updateScan.run(Date.now() - startTime, error.message, scanId);

      throw error;
    } finally {
      if (page) await page.close();
      if (context) await context.close();
    }
  }

  processViolations(violations, scanId) {
    const counts = {
      total: violations.length,
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    };

    const insertViolation = db.prepare(`
      INSERT INTO violations (
        scan_id, violation_id, impact, description, help, help_url,
        tags, nodes_count, nodes_data, wcag_criteria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const violation of violations) {
      const impact = violation.impact || "minor";
      counts[impact]++;

      // Extract WCAG criteria from tags
      const wcagCriteria = violation.tags.filter((tag) => tag.startsWith("wcag")).join(", ");

      // Prepare nodes data (limit to essential info to save space)
      const nodesData = violation.nodes.map((node) => ({
        html: node.html.substring(0, 500), // Limit HTML length
        target: node.target,
        failureSummary: node.failureSummary,
      }));

      insertViolation.run(
        scanId,
        violation.id,
        impact,
        violation.description,
        violation.help,
        violation.helpUrl,
        violation.tags.join(","),
        violation.nodes.length,
        JSON.stringify(nodesData),
        wcagCriteria,
      );
    }

    return counts;
  }

  getWCAGTags() {
    const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

    if (this.wcagLevel === "AAA") {
      tags.push("wcag2aaa", "wcag21aaa");
    }

    if (this.includeWCAG22) {
      tags.push("wcag22a", "wcag22aa");
      if (this.wcagLevel === "AAA") {
        tags.push("wcag22aaa");
      }
    }

    return tags;
  }

  async scanSite(siteId, pages = ["/"]) {
    const getSite = db.prepare("SELECT * FROM sites WHERE id = ?");
    const site = getSite.get(siteId);

    if (!site) {
      throw new Error(`Site not found: ${siteId}`);
    }

    const results = [];

    for (const pagePath of pages) {
      const fullUrl = new URL(pagePath, site.url).href;

      try {
        const result = await this.scanUrl(fullUrl, {
          siteId: site.id,
          pagePath,
          scanType: "automated",
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to scan ${fullUrl}:`, error.message);
        results.push({
          url: fullUrl,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default AxeScanner;
