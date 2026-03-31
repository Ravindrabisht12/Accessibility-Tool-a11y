const API_BASE = "/api";

// Navigation
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const viewName = btn.dataset.view;
    switchView(viewName);
  });
});

function switchView(viewName) {
  // Update nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  // Update views
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });

  // Load data for the view
  if (viewName === "dashboard") loadDashboard();
  else if (viewName === "sites") loadSites();
  else if (viewName === "scans") loadScans();
  else if (viewName === "manual-scan") loadManualScan();
}

// Dashboard
async function loadDashboard() {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`);
    const stats = await response.json();

    document.getElementById("stat-total-sites").textContent = stats.totalSites;
    document.getElementById("stat-total-scans").textContent = stats.totalScans;
    document.getElementById("stat-recent-scans").textContent = stats.recentScans;

    const totalViolations = (stats.violations.critical || 0) + (stats.violations.serious || 0) + (stats.violations.moderate || 0) + (stats.violations.minor || 0);

    document.getElementById("stat-total-violations").textContent = totalViolations;

    document.getElementById("violations-critical").textContent = stats.violations.critical || 0;
    document.getElementById("violations-serious").textContent = stats.violations.serious || 0;
    document.getElementById("violations-moderate").textContent = stats.violations.moderate || 0;
    document.getElementById("violations-minor").textContent = stats.violations.minor || 0;

    // Latest scan
    const latestScanDiv = document.getElementById("latest-scan-info");
    if (stats.latestScan) {
      const scan = stats.latestScan;
      latestScanDiv.innerHTML = `
        <p><strong>${scan.site_name || "Manual Scan"}</strong></p>
        <p>${scan.full_url}</p>
        <p>Scanned: ${new Date(scan.started_at).toLocaleString()}</p>
        <p>Violations: ${scan.total_violations}</p>
        <button class="btn btn-primary btn-small" onclick="viewScanDetails('${scan.id}')">View Details</button>
      `;
    } else {
      latestScanDiv.innerHTML = "<p>No scans yet</p>";
    }
  } catch (error) {
    console.error("Failed to load dashboard:", error);
  }
}

// Sites
async function loadSites() {
  try {
    const response = await fetch(`${API_BASE}/sites`);
    const sites = await response.json();

    const container = document.getElementById("sites-list");

    if (sites.length === 0) {
      container.innerHTML = '<p>No sites configured. Click "Add Site" to get started.</p>';
      return;
    }

    container.innerHTML = sites
      .map(
        (site) => `
      <div class="site-card">
        <h4>${site.name}</h4>
        <div class="site-url">${site.url}</div>
        <div class="site-meta">
          <span>📄 ${site.pageCount} pages</span>
          <span>${site.enabled ? "✅ Enabled" : "⏸️ Disabled"}</span>
        </div>
        <div class="site-actions">
          <button class="btn btn-primary btn-small" onclick="scanSite('${site.id}')">Scan Now</button>
          <button class="btn btn-small" style="background:#8e44ad;color:white;" onclick="discoverPages('${site.id}', '${site.name}')">🕷️ Discover Pages</button>
          <button class="btn btn-small" onclick="viewSiteScans('${site.id}')">History</button>
          <button class="btn btn-danger btn-small" onclick="deleteSite('${site.id}')">Delete</button>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Failed to load sites:", error);
  }
}

async function scanSite(siteId) {
  if (!confirm("Start scanning this site?")) return;

  const btn = event.target;
  btn.disabled = true;
  btn.textContent = "Scanning...";

  try {
    const response = await fetch(`${API_BASE}/scan/site/${siteId}`, {
      method: "POST",
    });

    const result = await response.json();

    alert(`Scan completed!\nSite: ${result.siteName}\nPages scanned: ${result.totalPages}`);
    loadScans();
  } catch (error) {
    alert("Scan failed: " + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Scan Now";
  }
}

async function discoverPages(siteId, siteName) {
  const maxPages = prompt(`Auto-discover all pages on "${siteName}" by crawling the site.\n\nEnter max pages to discover (default: 100):`, "100");
  if (maxPages === null) return; // user cancelled

  const confirmed = confirm(`This will crawl "${siteName}" and automatically find all its pages.\n\nThis may take 1-3 minutes depending on site size.\n\nProceed?`);
  if (!confirmed) return;

  // Show fixed progress notification
  const notification = document.createElement("div");
  notification.id = "crawl-notification";
  notification.style.cssText = [
    "position:fixed",
    "top:20px",
    "right:20px",
    "z-index:9999",
    "background:#2c3e50",
    "color:white",
    "padding:16px 24px",
    "border-radius:8px",
    "box-shadow:0 4px 20px rgba(0,0,0,0.3)",
    "font-size:14px",
    "max-width:320px",
  ].join(";");
  notification.innerHTML =
    "<strong>🕷️ Crawling " +
    siteName +
    "...</strong>" +
    "<p style='margin:8px 0 0;opacity:0.8;'>Discovering pages automatically. This may take a minute...</p>" +
    "<div style='margin-top:10px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;overflow:hidden;'>" +
    "<div id='crawl-bar' style='height:100%;background:#3498db;width:0%;transition:width 0.5s;'></div></div>";
  document.body.appendChild(notification);

  let progress = 0;
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 7, 88);
    const bar = document.getElementById("crawl-bar");
    if (bar) bar.style.width = progress + "%";
  }, 800);

  try {
    const response = await fetch(`${API_BASE}/sites/${siteId}/discover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxPages: parseInt(maxPages) || 100, maxDepth: 4 }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Crawl failed");

    clearInterval(progressInterval);
    document.body.removeChild(notification);

    const preview = result.pages.slice(0, 15).join("\n");
    const more = result.pages.length > 15 ? "\n... and " + (result.pages.length - 15) + " more" : "";
    alert("✅ Discovery Complete!\n\nSite: " + result.siteName + "\nPages found: " + result.discovered + "\n\nPage paths:\n" + preview + more);
    loadSites();
  } catch (error) {
    clearInterval(progressInterval);
    const existing = document.getElementById("crawl-notification");
    if (existing) document.body.removeChild(existing);
    alert("❌ Crawl failed: " + error.message);
  }
}

async function deleteSite(siteId) {
  if (!confirm("Are you sure you want to delete this site?")) return;

  try {
    await fetch(`${API_BASE}/sites/${siteId}`, { method: "DELETE" });
    loadSites();
  } catch (error) {
    alert("Failed to delete site: " + error.message);
  }
}

function viewSiteScans(siteId) {
  switchView("scans");
  document.getElementById("filter-site").value = siteId;
  loadScans(siteId);
}

// Add Site Modal
document.getElementById("add-site-btn").addEventListener("click", () => {
  document.getElementById("add-site-modal").classList.add("active");
});

document.querySelectorAll(".close-modal, .cancel-modal").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active");
    });
  });
});

document.getElementById("add-site-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("site-name").value;
  const url = document.getElementById("site-url").value;
  const pagesText = document.getElementById("site-pages").value;
  const pages = pagesText
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p);

  try {
    await fetch(`${API_BASE}/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, pages }),
    });

    document.getElementById("add-site-modal").classList.remove("active");
    document.getElementById("add-site-form").reset();
    loadSites();
  } catch (error) {
    alert("Failed to add site: " + error.message);
  }
});

// Scans
async function loadScans(siteId = null) {
  try {
    const url = siteId ? `${API_BASE}/scans?siteId=${siteId}` : `${API_BASE}/scans`;

    const response = await fetch(url);
    const scans = await response.json();

    const container = document.getElementById("scans-list");

    if (scans.length === 0) {
      container.innerHTML = '<div class="card"><p>No scans found.</p></div>';
      return;
    }

    container.innerHTML = `
      <div class="scans-table">
        <table>
          <thead>
            <tr>
              <th>Site</th>
              <th>URL</th>
              <th>Date</th>
              <th>Status</th>
              <th>Violations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${scans
              .map(
                (scan) => `
              <tr onclick="viewScanDetails('${scan.id}')">
                <td>${scan.site_name || "Manual"}</td>
                <td>${scan.full_url}</td>
                <td>${new Date(scan.started_at).toLocaleString()}</td>
                <td><span class="status-badge status-${scan.status}">${scan.status}</span></td>
                <td>
                  ${
                    scan.status === "completed"
                      ? `
                    <span style="color: var(--critical)">❗${scan.critical_count}</span>
                    <span style="color: var(--serious)">⚠️ ${scan.serious_count}</span>
                    <span style="color: var(--moderate)">⚡${scan.moderate_count}</span>
                    <span style="color: var(--minor)">ℹ️ ${scan.minor_count}</span>
                  `
                      : "-"
                  }
                </td>
                <td onclick="event.stopPropagation()">
                  <button class="btn btn-small" onclick="downloadReport('${scan.id}', 'html')">HTML</button>
                  <button class="btn btn-small" onclick="downloadReport('${scan.id}', 'json')">JSON</button>
                  <button class="btn btn-small" onclick="downloadReport('${scan.id}', 'csv')">CSV</button>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    // Load sites for filter
    const sitesResponse = await fetch(`${API_BASE}/sites`);
    const sites = await sitesResponse.json();

    const filterSelect = document.getElementById("filter-site");
    filterSelect.innerHTML = '<option value="">All Sites</option>' + sites.map((site) => `<option value="${site.id}">${site.name}</option>`).join("");

    if (siteId) filterSelect.value = siteId;
  } catch (error) {
    console.error("Failed to load scans:", error);
  }
}

document.getElementById("filter-site").addEventListener("change", (e) => {
  loadScans(e.target.value || null);
});

document.getElementById("refresh-scans-btn").addEventListener("click", () => {
  loadScans();
});

async function viewScanDetails(scanId) {
  try {
    const response = await fetch(`${API_BASE}/scan/${scanId}`);
    const scan = await response.json();

    const modal = document.getElementById("scan-details-modal");
    const content = document.getElementById("scan-details-content");

    content.innerHTML = `
      <div style="padding: 25px;">
        <div style="margin-bottom: 20px;">
          <h4>${scan.site_name || "Manual Scan"}</h4>
          <p><strong>URL:</strong> ${scan.full_url}</p>
          <p><strong>Date:</strong> ${new Date(scan.started_at).toLocaleString()}</p>
          <p><strong>Duration:</strong> ${(scan.duration_ms / 1000).toFixed(2)}s</p>
          <p><strong>WCAG Level:</strong> ${scan.wcag_level}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
          <div class="violation-bar critical">
            <div class="bar-label">Critical</div>
            <div class="bar-value">${scan.critical_count}</div>
          </div>
          <div class="violation-bar serious">
            <div class="bar-label">Serious</div>
            <div class="bar-value">${scan.serious_count}</div>
          </div>
          <div class="violation-bar moderate">
            <div class="bar-label">Moderate</div>
            <div class="bar-value">${scan.moderate_count}</div>
          </div>
          <div class="violation-bar minor">
            <div class="bar-label">Minor</div>
            <div class="bar-value">${scan.minor_count}</div>
          </div>
        </div>

        ${
          scan.violations.length === 0
            ? '<p style="text-align: center; color: var(--success); font-weight: bold;">✅ No violations found!</p>'
            : `<h4>Violations (${scan.violations.length})</h4>
          <div style="max-height: 500px; overflow-y: auto;">
            ${scan.violations
              .slice(0, 20)
              .map(
                (v) => `
              <div class="violation-bar ${v.impact}" style="margin-bottom: 15px; align-items: flex-start;">
                <div>
                  <strong>${v.help}</strong>
                  <p style="margin: 5px 0; font-size: 13px; opacity: 0.8;">${v.description}</p>
                  <span style="font-size: 12px; background: rgba(0,0,0,0.1); padding: 2px 8px; border-radius: 3px; margin-right: 5px;">${v.impact}</span>
                  <span style="font-size: 12px; background: rgba(0,0,0,0.1); padding: 2px 8px; border-radius: 3px;">${v.nodes_count} elements</span>
                  ${v.wcag_criteria ? `<p style="margin-top: 5px; font-size: 12px; opacity: 0.7;">WCAG: ${v.wcag_criteria}</p>` : ""}
                  <a href="${v.help_url}" target="_blank" style="font-size: 12px; margin-top: 5px; display: inline-block;">Learn more →</a>
                </div>
              </div>
            `,
              )
              .join("")}
            ${scan.violations.length > 20 ? `<p style="text-align: center; margin-top: 15px;"><em>Showing 20 of ${scan.violations.length} violations. Download full report for complete details.</em></p>` : ""}
          </div>`
        }

        <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: center;">
          <button class="btn btn-primary" onclick="downloadReport('${scanId}', 'html')">Download HTML Report</button>
          <button class="btn" onclick="downloadReport('${scanId}', 'json')">Download JSON</button>
          <button class="btn" onclick="downloadReport('${scanId}', 'csv')">Download CSV</button>
        </div>
      </div>
    `;

    modal.classList.add("active");
  } catch (error) {
    alert("Failed to load scan details: " + error.message);
  }
}

function downloadReport(scanId, format) {
  window.open(`${API_BASE}/reports/${scanId}/${format}`, "_blank");
}

// Manual Scan
async function loadManualScan() {
  // Load sites for site scan dropdown
  try {
    const response = await fetch(`${API_BASE}/sites`);
    const sites = await response.json();

    const select = document.getElementById("scan-site-select");
    select.innerHTML = '<option value="">Choose a site...</option>' + sites.map((site) => `<option value="${site.id}">${site.name}</option>`).join("");
  } catch (error) {
    console.error("Failed to load sites:", error);
  }
}

document.getElementById("scan-url-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("scan-url").value;
  const progressDiv = document.getElementById("scan-progress");
  const resultsDiv = document.getElementById("scan-results");
  const resultsContent = document.getElementById("scan-results-content");

  progressDiv.style.display = "block";
  resultsDiv.style.display = "none";

  try {
    const response = await fetch(`${API_BASE}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const result = await response.json();

    progressDiv.style.display = "none";
    resultsDiv.style.display = "block";

    resultsContent.innerHTML = `
      <p><strong>URL:</strong> ${result.url}</p>
      <p><strong>Duration:</strong> ${(result.duration / 1000).toFixed(2)}s</p>
      <p><strong>Total Violations:</strong> ${result.summary.total}</p>
      
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0;">
        <div class="violation-bar critical">
          <div class="bar-label">Critical</div>
          <div class="bar-value">${result.summary.critical}</div>
        </div>
        <div class="violation-bar serious">
          <div class="bar-label">Serious</div>
          <div class="bar-value">${result.summary.serious}</div>
        </div>
        <div class="violation-bar moderate">
          <div class="bar-label">Moderate</div>
          <div class="bar-value">${result.summary.moderate}</div>
        </div>
        <div class="violation-bar minor">
          <div class="bar-label">Minor</div>
          <div class="bar-value">${result.summary.minor}</div>
        </div>
      </div>

      <button class="btn btn-primary" onclick="viewScanDetails('${result.scanId}')">View Full Report</button>
    `;
  } catch (error) {
    progressDiv.style.display = "none";
    resultsDiv.style.display = "block";
    resultsContent.innerHTML = `<p style="color: var(--danger);">❌ Scan failed: ${error.message}</p>`;
  }
});

document.getElementById("scan-site-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const siteId = document.getElementById("scan-site-select").value;
  if (!siteId) return;

  const progressDiv = document.getElementById("scan-progress");
  const resultsDiv = document.getElementById("scan-results");
  const resultsContent = document.getElementById("scan-results-content");
  const statusText = document.getElementById("scan-status");

  progressDiv.style.display = "block";
  resultsDiv.style.display = "none";
  statusText.textContent = "Scanning site...";

  try {
    const response = await fetch(`${API_BASE}/scan/site/${siteId}`, {
      method: "POST",
    });

    const result = await response.json();

    progressDiv.style.display = "none";
    resultsDiv.style.display = "block";

    const totalViolations = result.results.reduce((sum, r) => {
      return sum + (r.summary?.total || 0);
    }, 0);

    resultsContent.innerHTML = `
      <p><strong>Site:</strong> ${result.siteName}</p>
      <p><strong>Pages Scanned:</strong> ${result.totalPages}</p>
      <p><strong>Total Violations:</strong> ${totalViolations}</p>
      
      <button class="btn btn-primary" onclick="viewSiteScans('${siteId}')">View All Results</button>
    `;
  } catch (error) {
    progressDiv.style.display = "none";
    resultsDiv.style.display = "block";
    resultsContent.innerHTML = `<p style="color: var(--danger);">❌ Scan failed: ${error.message}</p>`;
  }
});

// Initialize
loadDashboard();
