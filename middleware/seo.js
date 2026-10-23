const express = require('express');
const router = express.Router();
const seoData = require('../data/seo.json');
const blogPosts = require('../data/blog-posts.json');

// Common/legacy URLs people (and old WordPress links) use -> real pages
const legacyRedirects = {
  '/contact': '/contact-2',
  '/contact-us': '/contact-2',
  '/blog': '/news-blog',
  '/news': '/news-blog',
  '/healthcare': '/healthcare-3',
  '/about': '/our-team',
  '/about-us': '/our-team'
};

// 301 trailing-slash URLs (old WordPress format) and legacy slugs to one canonical URL
router.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  let target = req.path;
  if (target.length > 1 && target.endsWith('/')) target = target.replace(/\/+$/, '');
  if (legacyRedirects[target.toLowerCase()]) target = legacyRedirects[target.toLowerCase()];
  if (target === req.path) return next();
  const query = req.originalUrl.slice(req.path.length);
  res.redirect(301, (target || '/') + query);
});

// robots.txt
router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  const siteUrl = process.env.SITE_URL || 'https://datahubusa.com';
  res.send(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`);
});

// sitemap.xml (indexable pages only)
router.get('/sitemap.xml', (req, res) => {
  const siteUrl = process.env.SITE_URL || 'https://datahubusa.com';
  const postDates = {};
  blogPosts.forEach(post => { postDates['/' + post.slug] = String(post.date).split(' ')[0]; });

  const urls = Object.keys(seoData)
    .filter(path => !seoData[path].noindex)
    .map(path => {
      const lastmod = postDates[path] ? `\n    <lastmod>${postDates[path]}</lastmod>` : '';
      return `  <url>
    <loc>${siteUrl}${path}</loc>${lastmod}
    <changefreq>monthly</changefreq>
    <priority>${path === '/' ? '1.0' : path === '/contact-2' ? '0.9' : '0.8'}</priority>
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
