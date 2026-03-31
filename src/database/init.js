import db, { initDb, saveDb } from "./db.js";

console.log("Initializing database...");

// Initialize database first
await initDb();
console.log("Database connection established");

// Create sites table
db.exec(`
  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log("✓ Sites table created");

// Create pages table
db.exec(`
  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id TEXT NOT NULL,
    path TEXT NOT NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE(site_id, path)
  )
`);
console.log("✓ Pages table created");

// Create scans table
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    page_path TEXT,
    full_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    duration_ms INTEGER,
    total_violations INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    serious_count INTEGER DEFAULT 0,
    moderate_count INTEGER DEFAULT 0,
    minor_count INTEGER DEFAULT 0,
    scan_type TEXT DEFAULT 'automated',
    wcag_level TEXT DEFAULT 'AA',
    error_message TEXT,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
  )
`);
console.log("✓ Scans table created");

// Create violations table
db.exec(`
  CREATE TABLE IF NOT EXISTS violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id TEXT NOT NULL,
    violation_id TEXT NOT NULL,
    impact TEXT NOT NULL,
    description TEXT,
    help TEXT,
    help_url TEXT,
    tags TEXT,
    nodes_count INTEGER,
    nodes_data TEXT,
    wcag_criteria TEXT,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
  )
`);
console.log("✓ Violations table created");

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_scans_site_id ON scans(site_id);
  CREATE INDEX IF NOT EXISTS idx_scans_started_at ON scans(started_at);
  CREATE INDEX IF NOT EXISTS idx_violations_scan_id ON violations(scan_id);
  CREATE INDEX IF NOT EXISTS idx_violations_impact ON violations(impact);
`);
console.log("✓ Indexes created");

// Create settings table
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log("✓ Settings table created");

// Insert default settings
const insertSetting = db.prepare(`
  INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
`);

insertSetting.run("last_auto_scan", "");
insertSetting.run("email_notifications", "false");
insertSetting.run("wcag_level", "AA");
insertSetting.run("include_wcag_22", "true");
console.log("✓ Default settings inserted");

console.log("\n✅ Database initialized successfully!");
console.log("Tables created: sites, pages, scans, violations, settings");

process.exit(0);
