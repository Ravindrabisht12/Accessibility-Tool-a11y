import { readFileSync } from "fs";
import db from "../database/db.js";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: node import-sites.js <path-to-sites.json>");
  console.log("Example: node import-sites.js ../config/sites.json");
  process.exit(1);
}

const filePath = args[0];

try {
  const data = readFileSync(filePath, "utf8");
  const sites = JSON.parse(data);

  console.log(`📥 Importing ${sites.length} sites...\n`);

  const insertSite = db.prepare(`
    INSERT OR REPLACE INTO sites (id, name, url, enabled, created_at, updated_at) 
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  const insertPage = db.prepare(`
    INSERT OR IGNORE INTO pages (site_id, path) VALUES (?, ?)
  `);

  const deletePagesStmt = db.prepare("DELETE FROM pages WHERE site_id = ?");

  for (const site of sites) {
    // Insert site
    insertSite.run(site.id, site.name, site.url, site.enabled ? 1 : 0);

    // Delete existing pages
    deletePagesStmt.run(site.id);

    // Insert pages
    const pages = site.pages || ["/"];
    for (const page of pages) {
      insertPage.run(site.id, page);
    }

    console.log(`✅ ${site.name} (${pages.length} pages)`);
  }

  console.log(`\n✅ Successfully imported ${sites.length} sites!`);
  console.log('\nRun "npm start" to begin scanning.');
} catch (error) {
  console.error("❌ Import failed:", error.message);
  process.exit(1);
}
