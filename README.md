# DataHub USA - Node.js Website

Production-ready Node.js/Express application migrated from WordPress (Divi theme).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Templating | EJS + express-ejs-layouts |
| CSS | Vanilla CSS (custom design system matching Divi) |
| Security | Helmet, express-rate-limit |
| Email | Nodemailer (optional, SMTP-configurable) |

## Deployment to Vercel

The application is pre-configured with `vercel.json` and a serverless entry point at `api/index.js`.

### 1-Click CLI Deployment

```bash
# Login to Vercel (first time only)
npx vercel login

# Deploy to Preview
npx vercel

# Deploy to Production
npx vercel --prod
```

### Git-based Deployment
Push this repository to GitHub/GitLab/Bitbucket and import it directly into your [Vercel Dashboard](https://vercel.com/new). Vercel will automatically detect `vercel.json` and deploy.

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env

# 3. Run development server (with hot reload)
npm run dev

# 4. Open in browser
open http://localhost:3000
```

## Production

```bash
NODE_ENV=production PORT=3000 npm start
```

## Project Structure

```
databhub-wordpress-nodejs/
├── server.js              # Express entry point
├── .env.example           # Environment template
├── public/
│   ├── css/style.css      # Main stylesheet
│   ├── js/main.js         # Client-side JS
│   └── images/            # Migrated media (1036 files)
├── views/
│   ├── layouts/main.ejs   # Base HTML layout
│   ├── partials/          # Header, footer, etc.
│   └── pages/             # All 44+ page templates
├── routes/
│   ├── pages.js           # All page routes
│   ├── blog.js            # Blog routes
│   └── api.js             # Contact form API
├── data/
│   ├── navigation.json    # Menu structure
│   ├── seo.json           # SEO metadata per route
│   └── blog-posts.json    # 3 blog posts
└── middleware/
    └── seo.js             # Sitemap & robots.txt
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `SMTP_HOST` | SMTP server for contact form email | (optional) |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | (optional) |
| `SMTP_PASS` | SMTP password | (optional) |
| `CONTACT_EMAIL` | Recipient email for form submissions | `info1@datahubusa.com` |
| `GA_TRACKING_ID` | Google Analytics tracking ID | (optional) |
| `SITE_URL` | Canonical site URL | `https://datahubusa.com` |

## Contact Form

Contact form submissions are:
1. **Always logged** to `data/submissions/contact-submissions.jsonl`
2. **Optionally emailed** if SMTP credentials are set in `.env`

To enable email, add SMTP credentials to `.env`.

## Routes

All original WordPress URL slugs are preserved:

| Path | Page |
|------|------|
| `/` | Homepage |
| `/riskgrc` | GRC Solutions |
| `/security` | Security |
| `/analytics` | Analytics |
| `/cloud-adoption` | Cloud Adoption |
| `/data-management` | DevOps |
| `/problem-solving` | AI/ML Problem Solving |
| `/application-development` | Application Development |
| `/ibm-i-as400` | IBM i (AS/400) |
| `/ibm-power` | IBM Power |
| `/hybrid-cloud-with-red-hat` | Hybrid Cloud with Red Hat |
| `/banking` | Banking Industry |
| `/healthcare-3` | Healthcare Industry |
| `/partners` | Partners |
| `/contact-2` | Contact |
| `/news-blog` | Blog |
| ... | 50 total routes |

## SEO

- **Meta tags** per page (title, description, canonical)
- **Sitemap** at `/sitemap.xml` (auto-generated)
- **robots.txt** at `/robots.txt`
- **OG tags** (title, description, URL)

## Verification

```bash
# Test all 50 routes return expected status codes
node scripts/verify-routes.js
```

## Migration Notes

- WordPress theme: Divi 4.27.8 (Elegant Themes)
- Original host: datahubusa.com
- Content extracted from: `datahubusa-com-20260822-223242-wxzgadhcv8ja.wpress`
- Media files: 1036 files migrated from `wp_extracted/uploads/` → `public/images/`
- See `MIGRATION_REPORT.md` for full details
