require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers (relaxed for inline styles/scripts and external fonts)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
const publicDir = path.resolve(__dirname, 'public');
const viewsDir = path.resolve(__dirname, 'views');

app.use(express.static(publicDir, {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', viewsDir);
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Load shared data for all views
const navigation = require('./data/navigation.json');
const seoData = require('./data/seo.json');

app.use((req, res, next) => {
  res.locals.navigation = navigation;
  res.locals.seoData = seoData;
  res.locals.currentPath = req.path;
  res.locals.siteUrl = process.env.SITE_URL || 'https://datahubusa.com';
  res.locals.gaTrackingId = process.env.GA_TRACKING_ID || '';
  next();
});

// SEO middleware (sitemap, robots)
const seoMiddleware = require('./middleware/seo');
app.use(seoMiddleware);

// Routes
const pageRoutes = require('./routes/pages');
const blogRoutes = require('./routes/blog');
const apiRoutes = require('./routes/api');

app.use('/', pageRoutes);
app.use('/', blogRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('errors/404', {
    title: 'Page Not Found - DataHub',
    metaDescription: '',
    canonicalUrl: ''
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).render('errors/404', {
    title: 'Server Error - DataHub',
    metaDescription: '',
    canonicalUrl: ''
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`DataHub USA server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
