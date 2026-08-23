const express = require('express');
const router = express.Router();
const seoData = require('../data/seo.json');

// Helper to get SEO data for a route
function getSeo(path) {
  return seoData[path] || { title: 'DataHub - Where Data Meets Innovation', description: '', canonical: path };
}

// --- Homepage ---
router.get('/', (req, res) => {
  const seo = getSeo('/');
  res.render('pages/home', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/' });
});

// Redirect old slug
router.get('/home-a', (req, res) => res.redirect(301, '/'));

// --- About Pages ---
router.get('/our-mission', (req, res) => {
  const seo = getSeo('/our-mission');
  res.render('pages/about/our-mission', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/our-mission' });
});

router.get('/core-values', (req, res) => {
  const seo = getSeo('/core-values');
  res.render('pages/about/core-values', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/core-values' });
});

router.get('/our-team', (req, res) => {
  const seo = getSeo('/our-team');
  res.render('pages/about/our-team', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/our-team' });
});

router.get('/giving-back', (req, res) => {
  const seo = getSeo('/giving-back');
  res.render('pages/about/giving-back', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/giving-back' });
});

// --- Solutions Pages ---
router.get('/riskgrc', (req, res) => {
  const seo = getSeo('/riskgrc');
  res.render('pages/solutions/riskgrc', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/riskgrc' });
});

router.get('/security', (req, res) => {
  const seo = getSeo('/security');
  res.render('pages/solutions/security', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/security' });
});

router.get('/analytics', (req, res) => {
  const seo = getSeo('/analytics');
  res.render('pages/solutions/analytics', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/analytics' });
});

router.get('/cloud-adoption', (req, res) => {
  const seo = getSeo('/cloud-adoption');
  res.render('pages/solutions/cloud-adoption', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/cloud-adoption' });
});

router.get('/data-management', (req, res) => {
  const seo = getSeo('/data-management');
  res.render('pages/solutions/data-management', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/data-management' });
});

router.get('/problem-solving', (req, res) => {
  const seo = getSeo('/problem-solving');
  res.render('pages/solutions/problem-solving', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/problem-solving' });
});

router.get('/application-development', (req, res) => {
  const seo = getSeo('/application-development');
  res.render('pages/solutions/application-development', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/application-development' });
});

router.get('/ibm-i-as400', (req, res) => {
  const seo = getSeo('/ibm-i-as400');
  res.render('pages/solutions/ibm-i-as400', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/ibm-i-as400' });
});

router.get('/ibm-power', (req, res) => {
  const seo = getSeo('/ibm-power');
  res.render('pages/solutions/ibm-power', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/ibm-power' });
});

router.get('/hybrid-cloud-with-red-hat', (req, res) => {
  const seo = getSeo('/hybrid-cloud-with-red-hat');
  res.render('pages/solutions/hybrid-cloud-with-red-hat', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/hybrid-cloud-with-red-hat' });
});

// --- GRC Sub-pages ---
router.get('/grc-consulting', (req, res) => {
  const seo = getSeo('/grc-consulting');
  res.render('pages/grc/grc-consulting', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/grc-consulting' });
});

router.get('/operation-risk-managment', (req, res) => {
  const seo = getSeo('/operation-risk-managment');
  res.render('pages/grc/operation-risk-managment', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/operation-risk-managment' });
});

router.get('/it-governance', (req, res) => {
  const seo = getSeo('/it-governance');
  res.render('pages/grc/it-governance', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/it-governance' });
});

router.get('/internal-audit', (req, res) => {
  const seo = getSeo('/internal-audit');
  res.render('pages/grc/internal-audit', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/internal-audit' });
});

router.get('/financial-control-management', (req, res) => {
  const seo = getSeo('/financial-control-management');
  res.render('pages/grc/financial-control-management', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/financial-control-management' });
});

router.get('/data-privacy', (req, res) => {
  const seo = getSeo('/data-privacy');
  res.render('pages/grc/data-privacy', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/data-privacy' });
});

router.get('/business-continuity-managment', (req, res) => {
  const seo = getSeo('/business-continuity-managment');
  res.render('pages/grc/business-continuity-managment', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/business-continuity-managment' });
});

router.get('/regulatory-compliance-management', (req, res) => {
  const seo = getSeo('/regulatory-compliance-management');
  res.render('pages/grc/regulatory-compliance-management', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/regulatory-compliance-management' });
});

// --- Industry Pages ---
router.get('/banking', (req, res) => {
  const seo = getSeo('/banking');
  res.render('pages/industries/banking', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/banking' });
});

router.get('/healthcare-3', (req, res) => {
  const seo = getSeo('/healthcare-3');
  res.render('pages/industries/healthcare', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/healthcare-3' });
});

router.get('/insurance', (req, res) => {
  const seo = getSeo('/insurance');
  res.render('pages/industries/insurance', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/insurance' });
});

router.get('/energy', (req, res) => {
  const seo = getSeo('/energy');
  res.render('pages/industries/energy', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/energy' });
});

router.get('/manufacturing', (req, res) => {
  const seo = getSeo('/manufacturing');
  res.render('pages/industries/manufacturing', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/manufacturing' });
});

router.get('/tellcumacation', (req, res) => {
  const seo = getSeo('/tellcumacation');
  res.render('pages/industries/tellcumacation', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/tellcumacation' });
});

router.get('/retail', (req, res) => {
  const seo = getSeo('/retail');
  res.render('pages/industries/retail', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/retail' });
});

router.get('/financial-services', (req, res) => {
  const seo = getSeo('/financial-services');
  res.render('pages/industries/financial-services', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/financial-services' });
});

// --- Partners Pages ---
router.get('/partners', (req, res) => {
  const seo = getSeo('/partners');
  res.render('pages/partners/partners', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/partners' });
});

const partnerStubs = ['ibm', 'cisco', 'red-hat', 'vm-ware', 'aws-2', 'google-2'];
partnerStubs.forEach(slug => {
  router.get('/' + slug, (req, res) => {
    const name = slug.replace(/-\d+$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    res.render('pages/partners/partner-stub', {
      title: name + ' | DataHub',
      metaDescription: name + ' partnership with DataHub.',
      canonicalUrl: '/' + slug,
      partnerName: name
    });
  });
});

// --- Contact & Form Pages ---
router.get('/contact-2', (req, res) => {
  const seo = getSeo('/contact-2');
  res.render('pages/contact', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/contact-2' });
});

router.get('/form', (req, res) => {
  const seo = getSeo('/form');
  res.render('pages/form', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/form' });
});

// --- Other Pages ---
router.get('/client-login', (req, res) => {
  const seo = getSeo('/client-login');
  res.render('pages/client-login', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/client-login' });
});

router.get('/landing-page', (req, res) => {
  const seo = getSeo('/landing-page');
  res.render('pages/landing-page', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/landing-page' });
});

router.get('/transformation-hub', (req, res) => {
  const seo = getSeo('/transformation-hub');
  res.render('pages/transformation-hub', { title: seo.title, metaDescription: seo.description, canonicalUrl: '/transformation-hub' });
});

module.exports = router;
