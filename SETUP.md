# Accessibility Monitor - Setup Guide

## Overview

This is a comprehensive accessibility monitoring platform that scans your websites for WCAG 2.2 compliance using Playwright and Axe-core. It's a cost-effective, self-hosted alternative to commercial platforms like Level Access Platform ($80,000/year) and Axe Monitor.

## Features

✅ **Automated Weekly Scans** - Schedule scans for all your sites  
✅ **Manual On-Demand Scans** - Quick accessibility checks via web dashboard  
✅ **WCAG 2.2 Support** - Full compliance checking for Level A, AA, and AAA  
✅ **Multiple Export Formats** - HTML, JSON, and CSV reports  
✅ **Multi-Site Support** - Monitor 25+ websites  
✅ **Historical Tracking** - Track violations over time  
✅ **Web Dashboard** - User-friendly interface for managing scans  
✅ **API Access** - RESTful API for integration  
✅ **Email Notifications** - Get alerts on scan completion  

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Install Playwright Browsers

```bash
npx playwright install chromium
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=3000
SCAN_SCHEDULE="0 2 * * 1"  # Every Monday at 2 AM
WCAG_LEVEL=AA
INCLUDE_WCAG_22=true
```

### Step 4: Initialize Database

```bash
npm run init-db
```

### Step 5: Configure Your Sites

You can add sites via the web dashboard, or import from a JSON file:

1. Copy the example configuration:
   ```bash
   cp config/sites.json.example config/sites.json
   ```

2. Edit `config/sites.json` with your 25 sites:
   ```json
   [
     {
       "id": "site-1",
       "name": "Main Website",
       "url": "https://www.yoursite.com",
       "enabled": true,
       "pages": [
         "/",
         "/about",
         "/contact",
         "/products"
       ]
     }
   ]
   ```

3. Import sites via API:
   ```bash
   # Start the server in another terminal
   npm start
   
   # Import sites (from another terminal)
   curl -X POST http://localhost:3000/api/sites/import \
     -H "Content-Type: application/json" \
     -d @config/sites.json
   ```

   Or add them manually through the web dashboard.

## Usage

### Starting the Application

```bash
npm start
```

Access the dashboard at: **http://localhost:3000**

### Command Line Interface

Scan a specific URL:
```bash
npm run scan -- --url https://example.com
```

Scan all enabled sites:
```bash
npm run scan:all
```

### Web Dashboard

The web dashboard provides:

1. **Dashboard** - Overview statistics and latest scans
2. **Sites** - Manage your 25 sites
3. **Scan History** - View all past scans with filtering
4. **Manual Scan** - Run on-demand scans for any URL or site

### Automated Scans

Scans run automatically based on the `SCAN_SCHEDULE` in `.env`:

- Default: Every Monday at 2 AM
- Modify the cron expression for different schedules
- Examples:
  - `0 2 * * 1`: Every Monday at 2 AM
  - `0 */6 * * *`: Every 6 hours
  - `0 0 * * 0`: Every Sunday at midnight

## API Endpoints

### Sites Management

- `GET /api/sites` - List all sites
- `POST /api/sites` - Create new site
- `PUT /api/sites/:id` - Update site
- `DELETE /api/sites/:id` - Delete site

### Scanning

- `POST /api/scan` - Scan a URL
- `POST /api/scan/site/:id` - Scan entire site
- `GET /api/scans` - Get scan history
- `GET /api/scan/:id` - Get scan details

### Reports

- `GET /api/reports/:id/html` - Download HTML report
- `GET /api/reports/:id/json` - Download JSON report
- `GET /api/reports/:id/csv` - Download CSV report

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/trends` - Get violation trends

## Example: Scanning Your 25 Sites

1. **Add all 25 sites through the dashboard:**
   - Click "Add Site"
   - Enter site name, URL, and pages to scan
   - Repeat for all sites

2. **Run initial scan:**
   ```bash
   npm run scan:all
   ```

3. **View results:**
   - Open http://localhost:3000
   - Go to "Scan History" to see all results
   - Download HTML reports for detailed violations

4. **Enable automated scans:**
   - Sites will be scanned automatically every Monday at 2 AM
   - Adjust schedule in `.env` if needed

## Reports

Reports include:

- **Violation Count** by severity (Critical, Serious, Moderate, Minor)
- **WCAG Criteria** affected
- **Element Details** with HTML snippets
- **Remediation Guidance** with links to axe-core documentation
- **Historical Trends** to track progress

## Email Notifications

To enable email notifications:

1. Edit `.env`:
   ```env
   ENABLE_EMAIL=true
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_TO=admin@yourcompany.com
   ```

2. For Gmail, create an [App Password](https://support.google.com/accounts/answer/185833)

## Troubleshooting

### "Browser not found" error

Run: `npx playwright install chromium`

### Database errors

Re-initialize: `npm run init-db`

### Scans timeout

Increase timeout in `.env`:
```env
SCAN_TIMEOUT=60000
```

### Too many concurrent scans

Reduce in `.env`:
```env
MAX_CONCURRENT_SCANS=2
```

## Cost Comparison

| Solution | Annual Cost | Your Cost |
|----------|-------------|-----------|
| Level Access Platform | ~$80,000 | **$0** |
| Axe Monitor | Contact Sales | **$0** |
| Accessibility Checker | $3,588 | **$0** |
| UserWay | $131,880 | **$0** |
| **This Tool** | **FREE** | **FREE** |

Plus you have full control, customization, and no data leaves your infrastructure.

## Production Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start src/index.js --name accessibility-monitor
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npx playwright install --with-deps chromium
COPY . .
RUN npm run init-db
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t accessibility-monitor .
docker run -p 3000:3000 -v $(pwd)/data:/app/data accessibility-monitor
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name accessibility.yourcompany.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Recommendations

1. **Authentication**: Add authentication middleware to protect the dashboard
2. **HTTPS**: Use SSL/TLS in production
3. **Firewall**: Restrict access to trusted IPs
4. **Database**: Regular backups of SQLite database
5. **Updates**: Keep dependencies up to date

## Support

For issues or questions:
- Check the README.md
- Review the code comments
- Open an issue on GitHub

## License

MIT License - Free to use and modify

---

**Built with:**
- Playwright - Browser automation
- @axe-core/playwright - Accessibility testing engine
- Express - Web server
- SQLite - Database
- Node-cron - Task scheduling

Enjoy your cost-effective accessibility monitoring! 🎉
