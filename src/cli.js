import { Command } from "commander";
import AxeScanner from "./scanner/axe-scanner.js";
import db from "./database/db.js";

const program = new Command();

program.name("accessibility-monitor").description("CLI for Accessibility Monitor").version("1.0.0");

program
  .command("scan")
  .description("Scan a URL for accessibility issues")
  .option("-u, --url <url>", "URL to scan")
  .option("-s, --site <siteId>", "Site ID to scan")
  .action(async (options) => {
    try {
      if (!options.url && !options.site) {
        console.error("Error: Either --url or --site is required");
        process.exit(1);
      }

      const scanner = new AxeScanner();
      await scanner.initialize();

      if (options.url) {
        console.log(`Scanning: ${options.url}\n`);
        const result = await scanner.scanUrl(options.url);

        console.log("\n📊 Results:");
        console.log(`   Total violations: ${result.summary.total}`);
        console.log(`   Critical: ${result.summary.critical}`);
        console.log(`   Serious: ${result.summary.serious}`);
        console.log(`   Moderate: ${result.summary.moderate}`);
        console.log(`   Minor: ${result.summary.minor}`);
        console.log(`\n✅ Scan ID: ${result.scanId}`);
      } else if (options.site) {
        const getSite = db.prepare("SELECT * FROM sites WHERE id = ? OR name = ?");
        const site = getSite.get(options.site, options.site);

        if (!site) {
          console.error(`Error: Site not found: ${options.site}`);
          process.exit(1);
        }

        const getPages = db.prepare("SELECT path FROM pages WHERE site_id = ?");
        const pages = getPages.all(site.id);
        const pagePaths = pages.length > 0 ? pages.map((p) => p.path) : ["/"];

        console.log(`Scanning site: ${site.name}`);
        console.log(`Pages: ${pagePaths.length}\n`);

        const results = await scanner.scanSite(site.id, pagePaths);

        const totalViolations = results.reduce((sum, r) => sum + (r.summary?.total || 0), 0);

        console.log("\n📊 Summary:");
        console.log(`   Total violations: ${totalViolations}`);
        console.log(`   Pages scanned: ${results.length}`);
      }

      await scanner.close();
      process.exit(0);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program
  .command("scan-all")
  .description("Scan all enabled sites")
  .action(async () => {
    try {
      const getSites = db.prepare("SELECT * FROM sites WHERE enabled = 1");
      const sites = getSites.all();

      if (sites.length === 0) {
        console.log("No enabled sites found");
        process.exit(0);
      }

      console.log(`Found ${sites.length} enabled sites\n`);

      const scanner = new AxeScanner();
      await scanner.initialize();

      for (const site of sites) {
        const getPages = db.prepare("SELECT path FROM pages WHERE site_id = ?");
        const pages = getPages.all(site.id);
        const pagePaths = pages.length > 0 ? pages.map((p) => p.path) : ["/"];

        console.log(`\nScanning: ${site.name} (${pagePaths.length} pages)`);

        try {
          const results = await scanner.scanSite(site.id, pagePaths);
          const totalViolations = results.reduce((sum, r) => sum + (r.summary?.total || 0), 0);
          console.log(`✅ ${site.name}: ${totalViolations} violations`);
        } catch (error) {
          console.error(`❌ ${site.name}: ${error.message}`);
        }
      }

      await scanner.close();
      console.log("\n✅ All scans completed");
      process.exit(0);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program.parse();
