# Accessibility Monitor

> **Save $80,000+/year** with this FREE, self-hosted alternative to Level Access Platform, Axe Monitor, and other commercial accessibility testing tools.

A comprehensive, production-ready accessibility monitoring platform built with Playwright and Axe-core. Monitor **25+ websites** with automated weekly scans, manual testing, and WCAG 2.2 compliance checking.

## ⚡ Quick Start

```bash
# 1. Install & Setup
./setup.sh

# 2. Add your sites
npm run import-sites config/sites.json

# 3. Start scanning
npm start
# Open http://localhost:3000
```

**That's it!** See [NEXT-STEPS.txt](NEXT-STEPS.txt) for detailed instructions.

## Features

- ✅ **Automated Scanning**: Schedule weekly scans for all configured sites
- 🔍 **Manual Scans**: On-demand accessibility testing via web interface
- 📊 **Detailed Reports**: HTML, JSON, and CSV export formats
- 🎯 **WCAG 2.2 Support**: Full compliance checking for Level A, AA, and AAA
- 📈 **Historical Tracking**: Compare results over time
- 🌐 **Multi-Site Support**: Monitor up to 25+ websites
- 🚀 **Fast & Efficient**: Powered by Playwright and @axe-core/playwright
- 💰 **Cost-Effective**: Open-source alternative to expensive platforms

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Copy environment configuration
cp .env.example .env

# Initialize database
npm run init-db
```

### Configuration

1. Edit `.env` file with your settings
2. Add your websites in `config/sites.json`

### Running the Application

```bash
# Start the web dashboard
npm start

# Access the dashboard at http://localhost:3000
```

### Command Line Usage

```bash
# Scan a specific site
npm run scan -- --site "Site Name"

# Scan all sites
npm run scan:all

# Run specific URL
npm run scan -- --url https://example.com
```

## Usage

### Adding Sites

Edit `config/sites.json`:

```json
[
  {
    "id": "site-1",
    "name": "Main Website",
    "url": "https://www.example.com",
    "enabled": true,
    "pages": [
      "/",
      "/about",
      "/contact"
    ]
  }
]
```

### Automated Scheduling

The application automatically scans all enabled sites based on the `SCAN_SCHEDULE` in `.env` file (default: Every Monday at 2 AM).

### Viewing Reports

- **Web Dashboard**: http://localhost:3000
- **Reports Directory**: `./reports/` (HTML, JSON, CSV formats)

## Architecture

```
accessibility-monitor/
├── src/
│   ├── index.js              # Main application server
│   ├── scanner/
│   │   ├── axe-scanner.js    # Playwright + Axe integration
│   │   └── scanner-queue.js  # Scan queue management
│   ├── scheduler/
│   │   └── cron-scheduler.js # Automated scan scheduling
│   ├── database/
│   │   ├── init.js           # Database initialization
│   │   └── db.js             # Database operations
│   ├── reports/
│   │   └── report-generator.js # Report generation
│   ├── api/
│   │   └── routes.js         # Express API routes
│   └── public/               # Web dashboard frontend
├── config/
│   └── sites.json            # Site configurations
└── data/                     # SQLite database
```

## API Endpoints

- `GET /api/sites` - List all configured sites
- `POST /api/scan` - Trigger manual scan
- `GET /api/scans` - Get scan history
- `GET /api/scan/:id` - Get specific scan results
- `GET /api/reports/:id` - Download report
- `GET /api/dashboard/stats` - Get dashboard statistics

## Technologies Used

- **Playwright**: Browser automation
- **@axe-core/playwright**: Accessibility testing
- **Express**: Web server
- **SQLite**: Database storage
- **node-cron**: Scheduled tasks
- **Chart.js**: Data visualization

## Comparison with Commercial Tools

| Feature | This Tool | Level Access | Axe Monitor |
|---------|-----------|--------------|-------------|
| Automated Scanning | ✅ | ✅ | ✅ |
| Manual Testing | ✅ | ✅ | ✅ |
| WCAG 2.2 Support | ✅ | ✅ | ✅ |
| CI/CD Integration | ✅ | ✅ | ✅ |
| Cost (annual) | **FREE** | ~$80,000 | Contact Sales |
| Self-Hosted | ✅ | ❌ | ❌ |
| Customizable | ✅ | Limited | Limited |

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
