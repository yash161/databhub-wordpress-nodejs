const express = require('express');
const router = express.Router();
const seoData = require('../data/seo.json');

// robots.txt
router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  const siteUrl = process.env.SITE_URL || 'https://datahubusa.com';
  res.send(`User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`);
});

// sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  const siteUrl = process.env.SITE_URL || 'https://datahubusa.com';
  const urls = Object.keys(seoData).map(path => {
    return `  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>monthly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

module.exports = router;
