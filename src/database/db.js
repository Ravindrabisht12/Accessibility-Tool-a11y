import initSqlJs from "sql.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbDir = join(__dirname, "../../data");
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, "accessibility.db");

// Initialize SQL.js
let SQL;
let db;
let initPromise;

async function initDb() {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    SQL = await initSqlJs();

    if (existsSync(dbPath)) {
      const buffer = readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    return db;
  })();

  return initPromise;
}

// Save database to file
function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

// Helper to ensure DB is initialized
async function ensureDb() {
  if (!db) {
    await initDb();
  }
  return db;
}

// Wrapper for prepare that uses synchronous sql.js API
// (initDb() must be awaited once at startup before any db calls)
const dbWrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        stmt.step();
        stmt.free();
        saveDb();
        return { changes: db.getRowsModified() };
      },
      get: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const result = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        return result;
      },
      all: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
    };
  },
  exec: (sql) => {
    db.exec(sql);
    saveDb();
  },
  pragma: (_pragma) => {
    // sql.js doesn't need pragma for WAL mode
    return;
  },
};

// Export both the init function and wrapper
export { initDb, saveDb };
export default dbWrapper;
