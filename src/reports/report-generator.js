import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync, existsSync, writeFileSync } from "fs";
import { Parser } from "json2csv";
import db from "../database/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ReportGenerator {
  constructor() {
    this.reportsDir = join(__dirname, "../../reports");
    if (!existsSync(this.reportsDir)) {
      mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  generateHTMLReport(scanId) {
    const scan = this.getScanData(scanId);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - ${scan.site_name || scan.full_url}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #2c3e50; margin-bottom: 10px; }
    .meta { color: #7f8c8d; font-size: 14px; margin-bottom: 30px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card h3 { font-size: 14px; color: #7f8c8d; margin-bottom: 10px; }
    .summary-card .number { font-size: 32px; font-weight: bold; }
    .critical { background: #fee; color: #c0392b; }
    .serious { background: #fef3e7; color: #e67e22; }
    .moderate { background: #fef9e7; color: #f39c12; }
    .minor { background: #eef; color: #3498db; }
    .passed { background: #eef; color: #27ae60; }
    .violation {
      border-left: 4px solid;
      padding: 20px;
      margin-bottom: 20px;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .violation.critical { border-left-color: #c0392b; }
    .violation.serious { border-left-color: #e67e22; }
    .violation.moderate { border-left-color: #f39c12; }
    .violation.minor { border-left-color: #3498db; }
    .violation h3 { margin-bottom: 10px; color: #2c3e50; }
    .violation .impact {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin-right: 10px;
    }
    .violation .wcag {
      display: inline-block;
      padding: 4px 8px;
      background: #ecf0f1;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 5px;
      margin-bottom: 5px;
    }
    .violation .help { margin: 15px 0; color: #555; }
    .violation .nodes {
      margin-top: 15px;
      padding: 15px;
      background: white;
      border-radius: 4px;
    }
    .violation .node {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    .violation .node:last-child { border-bottom: none; }
    .violation code {
      display: block;
      background: #2c3e50;
      color: #ecf0f1;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      margin: 10px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #7f8c8d;
      font-size: 14px;
    }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Accessibility Report</h1>
    <div class="meta">
      <strong>URL:</strong> ${scan.full_url}<br>
      <strong>Scan Date:</strong> ${new Date(scan.started_at).toLocaleString()}<br>
      <strong>Duration:</strong> ${(scan.duration_ms / 1000).toFixed(2)}s<br>
      <strong>WCAG Level:</strong> ${scan.wcag_level}<br>
      <strong>Total Violations:</strong> ${scan.total_violations}
    </div>

    <div class="summary">
      <div class="summary-card critical">
        <h3>Critical</h3>
        <div class="number">${scan.critical_count}</div>
      </div>
      <div class="summary-card serious">
        <h3>Serious</h3>
        <div class="number">${scan.serious_count}</div>
      </div>
      <div class="summary-card moderate">
        <h3>Moderate</h3>
        <div class="number">${scan.moderate_count}</div>
      </div>
      <div class="summary-card minor">
        <h3>Minor</h3>
        <div class="number">${scan.minor_count}</div>
      </div>
    </div>

    ${scan.violations.length === 0 ? '<div class="summary-card passed"><h3>No violations found!</h3><div class="number">✓</div></div>' : scan.violations.map((v) => this.renderViolation(v)).join("")}

    <div class="footer">
      Generated by Accessibility Monitor<br>
      Powered by Playwright + Axe-core
    </div>
  </div>
</body>
</html>`;

    const filename = `report-${scanId}.html`;
    const filepath = join(this.reportsDir, filename);
    writeFileSync(filepath, html);

    return filepath;
  }

  renderViolation(violation) {
    const nodes = JSON.parse(violation.nodes_data || "[]");

    return `
    <div class="violation ${violation.impact}">
      <h3>
        <span class="impact" style="background: ${this.getImpactColor(violation.impact)}; color: white;">
          ${violation.impact}
        </span>
        ${violation.help}
      </h3>
      
      <div class="wcag">
        ${violation.wcag_criteria
          .split(",")
          .map((tag) => `<span class="wcag">${tag.trim()}</span>`)
          .join("")}
      </div>

      <p class="help">
        ${violation.description}
        <br><a href="${violation.help_url}" target="_blank">Learn more →</a>
      </p>

      <div class="nodes">
        <strong>Affected elements: ${violation.nodes_count}</strong>
        ${nodes
          .slice(0, 5)
          .map(
            (node) => `
          <div class="node">
            <strong>Target:</strong> ${Array.isArray(node.target) ? node.target.join(" > ") : node.target}
            <code>${this.escapeHtml(node.html)}</code>
            ${node.failureSummary ? `<p><strong>Issue:</strong> ${node.failureSummary}</p>` : ""}
          </div>
        `,
          )
          .join("")}
        ${nodes.length > 5 ? `<p><em>... and ${nodes.length - 5} more elements</em></p>` : ""}
      </div>
    </div>`;
  }

  generateJSONReport(scanId) {
    const scan = this.getScanData(scanId);
    const filename = `report-${scanId}.json`;
    const filepath = join(this.reportsDir, filename);

    writeFileSync(filepath, JSON.stringify(scan, null, 2));
    return filepath;
  }

  generateCSVReport(scanId) {
    const scan = this.getScanData(scanId);

    const fields = ["violation_id", "impact", "help", "wcag_criteria", "nodes_count", "help_url"];

    const parser = new Parser({ fields });
    const csv = parser.parse(scan.violations);

    const filename = `report-${scanId}.csv`;
    const filepath = join(this.reportsDir, filename);

    writeFileSync(filepath, csv);
    return filepath;
  }

  getScanData(scanId) {
    const getScan = db.prepare(`
      SELECT s.*, si.name as site_name, si.url as site_url
      FROM scans s
      LEFT JOIN sites si ON s.site_id = si.id
      WHERE s.id = ?
    `);

    const scan = getScan.get(scanId);

    if (!scan) {
      throw new Error(`Scan not found: ${scanId}`);
    }

    const getViolations = db.prepare(`
      SELECT * FROM violations WHERE scan_id = ? ORDER BY 
        CASE impact 
          WHEN 'critical' THEN 1 
          WHEN 'serious' THEN 2 
          WHEN 'moderate' THEN 3 
          WHEN 'minor' THEN 4 
        END
    `);

    scan.violations = getViolations.all(scanId);

    return scan;
  }

  getImpactColor(impact) {
    const colors = {
      critical: "#c0392b",
      serious: "#e67e22",
      moderate: "#f39c12",
      minor: "#3498db",
    };
    return colors[impact] || "#95a5a6";
  }

  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

export default ReportGenerator;
