import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import apiRoutes, { initializeScannerQueue } from "./api/routes.js";
import CronScheduler from "./scheduler/cron-scheduler.js";
import { initDb } from "./database/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

// API routes
app.use("/api", apiRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Initialize and start server
async function start() {
  try {
    console.log("🚀 Starting Accessibility Monitor...\n");

    // Initialize database
    console.log("Initializing database...");
    await initDb();
    console.log("✅ Database ready\n");

    // Initialize scanner queue
    console.log("Initializing scanner queue...");
    await initializeScannerQueue();
    console.log("✅ Scanner queue ready\n");

    // Start cron scheduler
    const schedule = process.env.SCAN_SCHEDULE || "0 2 * * 1";
    const scheduler = new CronScheduler(schedule);
    scheduler.start();
    console.log("");

    // Start Express server
    app.listen(PORT, HOST, () => {
      console.log("╔════════════════════════════════════════════╗");
      console.log("║   Accessibility Monitor is running! 🎉    ║");
      console.log("╚════════════════════════════════════════════╝");
      console.log("");
      console.log(`🌐 Dashboard:  http://${HOST}:${PORT}`);
      console.log(`🔌 API:        http://${HOST}:${PORT}/api`);
      console.log("");
      console.log("📚 Quick Commands:");
      console.log("   - npm run scan -- --url <url>");
      console.log("   - npm run scan:all");
      console.log("");
      console.log("📅 Automated scans scheduled: " + schedule);
      console.log("");
      console.log("Press Ctrl+C to stop");
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n\n🛑 Shutting down gracefully...");
      scheduler.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
}

start();
