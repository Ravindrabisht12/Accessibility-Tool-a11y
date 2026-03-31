import cron from "node-cron";
import AxeScanner from "../scanner/axe-scanner.js";
import db from "../database/db.js";
import { sendEmailNotification } from "../utils/email.js";

class CronScheduler {
  constructor(schedule = "0 2 * * 1") {
    // Default: Every Monday at 2 AM
    this.schedule = schedule;
    this.task = null;
    this.isRunning = false;
  }

  start() {
    console.log(`📅 Scheduler started with cron: ${this.schedule}`);

    this.task = cron.schedule(this.schedule, async () => {
      console.log("🚀 Starting scheduled accessibility scan...");
      await this.runAutomatedScan();
    });

    console.log("✅ Automated scans are scheduled");
  }

  stop() {
    if (this.task) {
      this.task.stop();
      console.log("🛑 Scheduler stopped");
    }
  }

  async runAutomatedScan() {
    if (this.isRunning) {
      console.log("⚠️  A scan is already running, skipping...");
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      // Get all enabled sites
      const getSites = db.prepare("SELECT * FROM sites WHERE enabled = 1");
      const sites = getSites.all();

      if (sites.length === 0) {
        console.log("No enabled sites found");
        return;
      }

      console.log(`Found ${sites.length} enabled sites to scan`);

      const scanner = new AxeScanner();
      await scanner.initialize();

      const results = {
        totalSites: sites.length,
        successful: 0,
        failed: 0,
        totalViolations: 0,
      };

      // Scan each site
      for (const site of sites) {
        try {
          // Get pages for this site
          const getPages = db.prepare("SELECT path FROM pages WHERE site_id = ?");
          const pages = getPages.all(site.id);

          const pagePaths = pages.length > 0 ? pages.map((p) => p.path) : ["/"];

          console.log(`Scanning ${site.name} (${pagePaths.length} pages)...`);

          const siteResults = await scanner.scanSite(site.id, pagePaths);

          const violations = siteResults.reduce((sum, r) => sum + (r.summary?.total || 0), 0);

          results.successful++;
          results.totalViolations += violations;

          console.log(`✅ ${site.name}: ${violations} total violations`);
        } catch (error) {
          console.error(`❌ Failed to scan ${site.name}:`, error.message);
          results.failed++;
        }
      }

      await scanner.close();

      // Update last scan time
      const updateSetting = db.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
      updateSetting.run("last_auto_scan", new Date().toISOString());

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log("\n📊 Scan Summary:");
      console.log(`   Sites scanned: ${results.successful}/${results.totalSites}`);
      console.log(`   Failed: ${results.failed}`);
      console.log(`   Total violations: ${results.totalViolations}`);
      console.log(`   Duration: ${duration}s`);

      // Send email notification if enabled
      const emailSetting = db.prepare("SELECT value FROM settings WHERE key = ?");
      const emailEnabled = emailSetting.get("email_notifications")?.value === "true";

      if (emailEnabled) {
        await sendEmailNotification({
          subject: "Accessibility Scan Completed",
          results,
        });
      }
    } catch (error) {
      console.error("❌ Automated scan failed:", error);
    } finally {
      this.isRunning = false;
    }
  }

  async runNow() {
    console.log("🚀 Running manual automated scan...");
    await this.runAutomatedScan();
  }
}

export default CronScheduler;
