# Adding Your 25 Sites - Quick Guide

## Method 1: Using JSON Configuration File (Fastest)

### Step 1: Edit the Configuration File

Create or edit `config/sites.json` with your 25 sites:

```json
[
  {
    "id": "relias-site-1",
    "name": "Relias Main Site",
    "url": "https://www.reliaslearning.com",
    "enabled": true,
    "pages": [
      "/",
      "/about",
      "/products",
      "/contact",
      "/solutions",
      "/healthcare",
      "/enterprise"
    ]
  },
  {
    "id": "relias-site-2",
    "name": "Customer Portal",
    "url": "https://portal.reliaslearning.com",
    "enabled": true,
    "pages": [
      "/",
      "/login",
      "/dashboard",
      "/courses",
      "/reports"
    ]
  },
  {
    "id": "relias-site-3",
    "name": "Learning Platform",
    "url": "https://learn.reliaslearning.com",
    "enabled": true,
    "pages": [
      "/",
      "/catalog",
      "/my-courses"
    ]
  }
  // ... add all 25 sites
]
```

### Step 2: Import Sites

```bash
# Make sure database is initialized
npm run init-db

# Import all sites
npm run import-sites config/sites.json
```

You'll see:
```
📥 Importing 25 sites...

✅ Relias Main Site (7 pages)
✅ Customer Portal (5 pages)
✅ Learning Platform (3 pages)
...

✅ Successfully imported 25 sites!
```

### Step 3: Start Scanning

```bash
# Scan all sites immediately
npm run scan:all

# Or start the web dashboard
npm start
```

---

## Method 2: Using Web Dashboard (Interactive)

### Step 1: Start the Application

```bash
npm start
```

Open http://localhost:3000

### Step 2: Add Sites One by One

1. Click **"Sites"** tab
2. Click **"+ Add Site"** button
3. Fill in the form:
   - **Site Name**: e.g., "Relias Main Site"
   - **Base URL**: e.g., "https://www.reliaslearning.com"
   - **Pages** (one per line):
     ```
     /
     /about
     /products
     /contact
     ```
4. Click **"Add Site"**
5. Repeat for all 25 sites

### Step 3: Trigger First Scan

After adding sites:
1. Click **"Manual Scan"** tab
2. Select a site from dropdown
3. Click **"Scan All Pages"**
4. Wait for completion
5. View results in **"Scan History"**

---

## Method 3: Using API (Programmatic)

### Step 1: Start the Server

```bash
npm start
```

### Step 2: Add Sites via API

```bash
# Add Site 1
curl -X POST http://localhost:3000/api/sites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Relias Main Site",
    "url": "https://www.reliaslearning.com",
    "pages": ["/", "/about", "/products", "/contact"]
  }'

# Add Site 2
curl -X POST http://localhost:3000/api/sites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Portal",
    "url": "https://portal.reliaslearning.com",
    "pages": ["/", "/login", "/dashboard"]
  }'

# ... repeat for all 25 sites
```

Or create a script `add-sites.sh`:

```bash
#!/bin/bash

sites=(
  '{"name":"Site 1","url":"https://site1.com","pages":["/"]}'
  '{"name":"Site 2","url":"https://site2.com","pages":["/"]}'
  # ... all 25 sites
)

for site in "${sites[@]}"; do
  curl -X POST http://localhost:3000/api/sites \
    -H "Content-Type: application/json" \
    -d "$site"
  echo ""
done
```

---

## Template for Your 25 Sites

Copy this template to `config/sites.json` and customize:

```json
[
  {
    "id": "site-1",
    "name": "CHANGE_ME - Site Name 1",
    "url": "https://www.example1.com",
    "enabled": true,
    "pages": ["/", "/about", "/contact"]
  },
  {
    "id": "site-2",
    "name": "CHANGE_ME - Site Name 2",
    "url": "https://www.example2.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-3",
    "name": "CHANGE_ME - Site Name 3",
    "url": "https://www.example3.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-4",
    "name": "CHANGE_ME - Site Name 4",
    "url": "https://www.example4.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-5",
    "name": "CHANGE_ME - Site Name 5",
    "url": "https://www.example5.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-6",
    "name": "CHANGE_ME - Site Name 6",
    "url": "https://www.example6.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-7",
    "name": "CHANGE_ME - Site Name 7",
    "url": "https://www.example7.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-8",
    "name": "CHANGE_ME - Site Name 8",
    "url": "https://www.example8.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-9",
    "name": "CHANGE_ME - Site Name 9",
    "url": "https://www.example9.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-10",
    "name": "CHANGE_ME - Site Name 10",
    "url": "https://www.example10.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-11",
    "name": "CHANGE_ME - Site Name 11",
    "url": "https://www.example11.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-12",
    "name": "CHANGE_ME - Site Name 12",
    "url": "https://www.example12.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-13",
    "name": "CHANGE_ME - Site Name 13",
    "url": "https://www.example13.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-14",
    "name": "CHANGE_ME - Site Name 14",
    "url": "https://www.example14.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-15",
    "name": "CHANGE_ME - Site Name 15",
    "url": "https://www.example15.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-16",
    "name": "CHANGE_ME - Site Name 16",
    "url": "https://www.example16.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-17",
    "name": "CHANGE_ME - Site Name 17",
    "url": "https://www.example17.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-18",
    "name": "CHANGE_ME - Site Name 18",
    "url": "https://www.example18.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-19",
    "name": "CHANGE_ME - Site Name 19",
    "url": "https://www.example19.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-20",
    "name": "CHANGE_ME - Site Name 20",
    "url": "https://www.example20.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-21",
    "name": "CHANGE_ME - Site Name 21",
    "url": "https://www.example21.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-22",
    "name": "CHANGE_ME - Site Name 22",
    "url": "https://www.example22.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-23",
    "name": "CHANGE_ME - Site Name 23",
    "url": "https://www.example23.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-24",
    "name": "CHANGE_ME - Site Name 24",
    "url": "https://www.example24.com",
    "enabled": true,
    "pages": ["/"]
  },
  {
    "id": "site-25",
    "name": "CHANGE_ME - Site Name 25",
    "url": "https://www.example25.com",
    "enabled": true,
    "pages": ["/"]
  }
]
```

---

## Pro Tips

### 1. Test with One Site First

Before adding all 25:
1. Add just 1 site
2. Run a scan: `npm run scan -- --site site-1`
3. Verify results look good
4. Then add the rest

### 2. Start with Homepage Only

For initial setup:
- Use `"pages": ["/"]` for all sites
- Run initial scans to verify connectivity
- Add more pages later for deeper scans

### 3. Disable Sites Temporarily

To skip certain sites in automated scans:
```json
{
  "id": "site-3",
  "name": "Staging Site",
  "url": "https://staging.example.com",
  "enabled": false,  // <-- Set to false
  "pages": ["/"]
}
```

### 4. Group by Priority

Add high-priority sites first with more pages:
```json
{
  "id": "main-site",
  "name": "Main Public Website (HIGH PRIORITY)",
  "url": "https://www.example.com",
  "enabled": true,
  "pages": [
    "/",
    "/products",
    "/services",
    "/about",
    "/contact",
    "/pricing",
    "/features"
  ]
}
```

---

## Verification

After importing, verify all sites were added:

```bash
# Via CLI
npm start

# Then in another terminal
curl http://localhost:3000/api/sites | jq '. | length'
# Should output: 25
```

Or open http://localhost:3000 and check the "Sites" tab.

---

## Next Steps

Once all 25 sites are added:

1. **Run initial scan**:
   ```bash
   npm run scan:all
   ```

2. **Review results**:
   - Open http://localhost:3000
   - Go to "Scan History"
   - Download HTML reports

3. **Enable automated scans**:
   - Already configured to run every Monday at 2 AM
   - Check `.env` to modify schedule

4. **Set up email notifications** (optional):
   - Edit `.env` with your SMTP settings
   - Get notified when scans complete

---

## Cost Savings Recap

By using this tool for 25 sites instead of commercial solutions:

| Tool | Cost for 25 Sites |
|------|-------------------|
| Level Access Platform | **~$666,000/year** (assuming 3 assets × $80k each + scaling) |
| UserWay | **~$274,750/year** (1,500 pages × 25 sites = 37,500 pages) |
| Accessibility Checker | **~$89,700/year** ($299/domain × 25 × 12 months) |
| **This Tool** | **$0/year** ✅ |

**You're potentially saving hundreds of thousands of dollars annually!**

---

Ready to get started? Choose the method above that works best for you! 🚀
