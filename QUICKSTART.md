# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Automated Setup (Recommended)

```bash
./setup.sh
```

This will:
- Install all dependencies
- Install Playwright Chromium browser
- Create configuration files
- Initialize the database

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browser
npx playwright install chromium

# 3. Initialize database
npm run init-db

# 4. Start the application
npm start
```

### Option 3: Quick Test Run

```bash
# Install everything
npm install && npx playwright install chromium

# Initialize database
npm run init-db

# Scan a URL directly
npm run scan -- --url https://www.example.com

# Start the web dashboard
npm start
```

## 📋 Next Steps

1. **Open the dashboard**: http://localhost:3000

2. **Add your 25 sites**:
   - Click "Sites" tab
   - Click "+ Add Site"
   - Enter site details and pages to scan
   - Repeat for all sites

3. **Run your first scan**:
   - Go to "Manual Scan" tab
   - Select a site from dropdown
   - Click "Scan All Pages"

4. **View results**:
   - Go to "Scan History"
   - Click on any scan to see detailed violation report
   - Download HTML/JSON/CSV reports

## 📊 What You Get

### Automated Weekly Scans
Set up once, scans run automatically every Monday at 2 AM (configurable in `.env`)

### Comprehensive Reports
- **HTML**: Beautiful, shareable reports with full details
- **JSON**: Machine-readable for integration
- **CSV**: Spreadsheet-friendly for analysis

### WCAG 2.2 Compliance
- Level A, AA, or AAA compliance checking
- Violation severity: Critical, Serious, Moderate, Minor
- Direct links to remediation guidance

### Historical Tracking
- Track violations over time
- Compare scans to measure progress
- Filter by site, date, severity

## 💰 Cost Savings

You're replacing:
- ❌ Level Access Platform: **$80,000/year**
- ❌ Axe Monitor: **$20,000+/year**
- ❌ UserWay: **$10,990/year**

With:
- ✅ This tool: **$0/year** (FREE, open-source)

## 🔧 Configuration

### Scan Schedule

Edit `.env` to change scan schedule:

```env
# Every Monday at 2 AM
SCAN_SCHEDULE=0 2 * * 1

# Every day at midnight
SCAN_SCHEDULE=0 0 * * *

# Every 6 hours
SCAN_SCHEDULE=0 */6 * * *
```

### WCAG Level

```env
# Level AA (recommended)
WCAG_LEVEL=AA

# Level AAA (strictest)
WCAG_LEVEL=AAA

# Include WCAG 2.2 rules
INCLUDE_WCAG_22=true
```

### Email Notifications

```env
ENABLE_EMAIL=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_TO=admin@yourcompany.com
```

## 📝 Example Workflow

### Adding Your 25 Sites

```bash
# Start the application
npm start
```

Then in the dashboard:

1. Click "Sites" → "+ Add Site"
2. Enter:
   - **Name**: "Main Marketing Site"
   - **URL**: https://www.yoursite.com
   - **Pages**: One per line
     ```
     /
     /about
     /products
     /contact
     /pricing
     ```
3. Click "Add Site"
4. Repeat for all 25 sites

### Running First Scan

Option A - Through Dashboard:
1. Go to "Manual Scan"
2. Select site from dropdown
3. Click "Scan All Pages"
4. Wait for completion
5. Click "View All Results"

Option B - Command Line:
```bash
# Scan all enabled sites
npm run scan:all
```

### Viewing Reports

1. Go to "Scan History"
2. Click on any scan row
3. View violations organized by severity
4. Download full report:
   - HTML for sharing with team
   - JSON for automation
   - CSV for spreadsheet analysis

## 🎯 Key Features

✅ Scan all 25 sites regularly  
✅ Automated weekly scans with email alerts  
✅ Beautiful web dashboard  
✅ Manual on-demand scans  
✅ Multiple export formats  
✅ WCAG 2.2 Level AA/AAA support  
✅ Historical violation tracking  
✅ No external dependencies  
✅ Self-hosted (your data stays private)  
✅ 100% free and open-source  

## 📚 Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [README.md](README.md) - Full documentation
- [config/sites.json.example](config/sites.json.example) - Site configuration template

## 🆘 Troubleshooting

**"Cannot find module"** → Run `npm install`  
**"Browser not found"** → Run `npx playwright install chromium`  
**"Database error"** → Run `npm run init-db`  
**Port already in use** → Change PORT in `.env`  

## 🚀 You're Ready!

```bash
npm start
```

Open http://localhost:3000 and start monitoring accessibility! 🎉
