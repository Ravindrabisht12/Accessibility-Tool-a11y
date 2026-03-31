# 🎉 Accessibility Monitor - Complete & Ready!

## What You Just Built

A **production-ready accessibility monitoring platform** that replaces expensive commercial tools like:
- ❌ Level Access Platform ($80,000/year)
- ❌ Axe Monitor ($20,000+/year)
- ❌ UserWay ($10,990/year for 1,500 pages)

With a **FREE, self-hosted solution** using industry-standard tools:
- ✅ Playwright + @axe-core/playwright (same engine as Axe DevTools)
- ✅ WCAG 2.2 Level AA/AAA compliance checking
- ✅ Automated weekly scans
- ✅ Beautiful web dashboard
- ✅ Comprehensive HTML/JSON/CSV reports

---

## 🚀 Getting Started (3 Steps)

### Step 1: Install & Setup

```bash
# Run the automated setup script
./setup.sh

# Or manually:
npm install
npx playwright install chromium
npm run init-db
```

### Step 2: Add Your 25 Sites

**Option A - JSON Import (Fastest)**:
1. Edit `config/sites.json` with your sites (see [ADD-SITES-GUIDE.md](ADD-SITES-GUIDE.md))
2. Run: `npm run import-sites config/sites.json`

**Option B - Web Dashboard**:
1. Run: `npm start`
2. Open: http://localhost:3000
3. Click "Sites" → "+ Add Site"
4. Add each site manually

### Step 3: Start Scanning

```bash
# Scan all sites immediately
npm run scan:all

# Or start the web dashboard
npm start
# Then visit http://localhost:3000
```

---

## 📁 Project Structure

```
accessibility-monitor/
├── src/
│   ├── index.js              # Main application server
│   ├── cli.js                # Command-line interface
│   ├── api/
│   │   └── routes.js         # REST API endpoints
│   ├── scanner/
│   │   ├── axe-scanner.js    # Playwright + Axe integration
│   │   └── scanner-queue.js  # Concurrent scan management
│   ├── scheduler/
│   │   └── cron-scheduler.js # Automated weekly scans
│   ├── reports/
│   │   └── report-generator.js # HTML/JSON/CSV reports
│   ├── database/
│   │   ├── db.js             # SQLite database connection
│   │   └── init.js           # Database initialization
│   ├── utils/
│   │   ├── email.js          # Email notifications
│   │   └── import-sites.js   # Bulk site import
│   └── public/               # Web dashboard
│       ├── index.html
│       ├── styles.css
│       └── app.js
├── config/
│   └── sites.json.example    # Site configuration template
├── data/                     # SQLite database (auto-created)
├── reports/                  # Generated reports (auto-created)
├── .env                      # Configuration
├── package.json             # Dependencies
├── README.md                # Full documentation
├── QUICKSTART.md            # Quick start guide
├── SETUP.md                 # Detailed setup guide
├── ADD-SITES-GUIDE.md       # How to add your 25 sites
└── setup.sh                 # Automated setup script
```

---

## 🎯 Key Features

### ✅ Automated Scanning
- **Scheduled scans**: Every Monday at 2 AM (configurable)
- **Scan all 25 sites** automatically
- **Email notifications** on completion

### ✅ Manual Scanning
- **Web Dashboard**: Scan any URL or entire site on-demand
- **CLI Tool**: `npm run scan -- --url https://example.com`
- **API Access**: RESTful API for integrations

### ✅ WCAG 2.2 Compliance
- **Level A, AA, AAA** support
- **Latest WCAG 2.2** rules included
- **Configurable**: Set compliance level in `.env`

### ✅ Comprehensive Reports
- **HTML Reports**: Beautiful, shareable reports
- **JSON Export**: Machine-readable for automation
- **CSV Export**: Spreadsheet-ready for analysis
- **Violation Details**: Element HTML, WCAG criteria, remediation links

### ✅ Multi-Site Management
- **Monitor 25+ websites**
- **Multiple pages per site**
- **Enable/disable sites** individually
- **Historical tracking** of all scans

### ✅ User-Friendly Dashboard
- **Statistics Overview**: Total sites, scans, violations
- **Violation Breakdown**: By severity (Critical/Serious/Moderate/Minor)
- **Scan History**: Filter by site, date, status
- **Trend Analysis**: Track progress over time

---

## 🔧 Configuration

### Environment Variables (`.env`)

```env
# Server
PORT=3000

# Scan Schedule (cron format)
SCAN_SCHEDULE=0 2 * * 1  # Every Monday at 2 AM

# WCAG Compliance Level
WCAG_LEVEL=AA            # Options: A, AA, AAA
INCLUDE_WCAG_22=true

# Performance
SCAN_TIMEOUT=30000       # 30 seconds per page
MAX_CONCURRENT_SCANS=3   # Scan 3 sites at once

# Email Notifications (Optional)
ENABLE_EMAIL=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_TO=admin@yourcompany.com
```

### Scan Schedule Examples

```env
# Every Monday at 2 AM
SCAN_SCHEDULE=0 2 * * 1

# Every day at midnight
SCAN_SCHEDULE=0 0 * * *

# Every 6 hours
SCAN_SCHEDULE=0 */6 * * *

# Every Sunday at 3 PM
SCAN_SCHEDULE=0 15 * * 0

# First day of every month at midnight
SCAN_SCHEDULE=0 0 1 * *
```

---

## 📊 Usage Examples

### Command Line

```bash
# Scan a specific URL
npm run scan -- --url https://www.example.com

# Scan all enabled sites
npm run scan:all

# Import sites from JSON
npm run import-sites config/sites.json

# Start web dashboard
npm start
```

### Web Dashboard

1. **Dashboard Tab**: View statistics and latest scans
2. **Sites Tab**: Manage your 25 sites
3. **Scan History Tab**: View all past scans, download reports
4. **Manual Scan Tab**: Run on-demand scans

### API Endpoints

```bash
# List all sites
curl http://localhost:3000/api/sites

# Add a site
curl -X POST http://localhost:3000/api/sites \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Site","url":"https://example.com","pages":["/"]}'

# Scan a URL
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Get scan history
curl http://localhost:3000/api/scans

# Get scan details
curl http://localhost:3000/api/scan/{scanId}

# Download HTML report
curl http://localhost:3000/api/reports/{scanId}/html -o report.html
```

---

## 💰 Cost Savings Breakdown

For **25 sites** with ~5 pages each (125 total pages):

| Solution | Annual Cost | Your Cost |
|----------|-------------|-----------|
| **Level Access Platform** | ~$80,000+ | **$0** |
| **Axe Monitor** | Contact Sales (~$20k+) | **$0** |
| **AccessibilityChecker.org** | $89,700 | **$0** |
| **UserWay** | $131,880 | **$0** |
| **BrowserStack** | $15,000+ | **$0** |
| **This Tool** | **FREE** | **$0** |

**Total Potential Savings: $80,000 - $131,880 per year!**

Plus:
- ✅ No per-page limits
- ✅ Unlimited scans
- ✅ Full data ownership
- ✅ No vendor lock-in
- ✅ Customize as needed

---

## 🎓 How It Works

### 1. Scanner Engine
- Uses **Playwright** to load pages in real browser (Chromium)
- Injects **@axe-core** (same engine as Axe DevTools)
- Runs accessibility rules against WCAG 2.2 standards
- Captures violations with element details
- Stores results in SQLite database

### 2. Automated Scheduling
- **node-cron** runs scans on schedule
- Processes all enabled sites
- Sends email notifications
- Stores historical data

### 3. Report Generation
- Queries violation data from database
- Generates HTML reports with styling
- Creates JSON for machine processing
- Exports CSV for spreadsheet analysis

### 4. Web Dashboard
- Express server serves dashboard
- REST API for all operations
- Real-time scan triggering
- Historical data visualization

---

## 🚨 Common Tasks

### View Latest Scan Results

```bash
# Start server
npm start

# Open browser
open http://localhost:3000

# Click "Scan History" → Click on any scan
```

### Download All Reports

```bash
# Reports are saved in ./reports/ directory
ls -la reports/

# Download via API
curl http://localhost:3000/api/reports/{scanId}/html -o report.html
```

### Add More Pages to a Site

**Option 1 - Web Dashboard**:
1. Go to Sites tab
2. Click on site
3. Edit pages list

**Option 2 - Direct Database**:
Edit `config/sites.json` and re-import:
```bash
npm run import-sites config/sites.json
```

### Change Scan Schedule

Edit `.env`:
```env
SCAN_SCHEDULE=0 0 * * *  # Change to daily at midnight
```

Restart server:
```bash
npm start
```

---

## 🔥 Advanced Features

### Email Notifications

Setup Gmail SMTP:
1. Enable 2-factor authentication on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
```env
ENABLE_EMAIL=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_TO=team@yourcompany.com
```

### CI/CD Integration

Add to GitHub Actions:
```yaml
name: Accessibility Scan
on:
  schedule:
    - cron: '0 2 * * 1'
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npx playwright install chromium
      - run: npm run scan:all
```

### Docker Deployment

```bash
docker build -t accessibility-monitor .
docker run -p 3000:3000 -v $(pwd)/data:/app/data accessibility-monitor
```

### Production with PM2

```bash
npm install -g pm2
pm2 start src/index.js --name accessibility-monitor
pm2 save
pm2 startup
```

---

## 📚 Documentation

- **[README.md](README.md)** - Full documentation
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[ADD-SITES-GUIDE.md](ADD-SITES-GUIDE.md)** - How to add your 25 sites

---

## ✅ Checklist

Before going live, verify:

- [ ] All dependencies installed (`npm install`)
- [ ] Playwright browser installed (`npx playwright install chromium`)
- [ ] Database initialized (`npm run init-db`)
- [ ] Environment configured (`.env`)
- [ ] All 25 sites added
- [ ] Test scan completed successfully
- [ ] Email notifications working (if enabled)
- [ ] Automated schedule configured
- [ ] Dashboard accessible at http://localhost:3000

---

## 🎉 You're Ready!

Start monitoring your 25 sites for accessibility:

```bash
npm start
```

Open **http://localhost:3000** and begin your accessibility journey!

---

## 🆘 Support

Need help?
1. Check the documentation files
2. Review error messages carefully
3. Verify all setup steps completed
4. Check GitHub issues for similar problems

---

## 📈 What's Next?

1. **Run initial scans** for all 25 sites
2. **Review reports** and prioritize violations
3. **Fix critical issues** first
4. **Track progress** over time with weekly scans
5. **Share reports** with your team
6. **Expand** to more pages as needed

---

**Enjoy your cost-effective, enterprise-grade accessibility monitoring platform!** 🚀

Built with ❤️ using Playwright + Axe-core
