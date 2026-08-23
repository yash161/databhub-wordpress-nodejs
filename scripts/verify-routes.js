const http = require('http');

const routes = [
  '/', '/our-mission', '/core-values', '/our-team', '/giving-back',
  '/riskgrc', '/security', '/analytics', '/cloud-adoption', '/data-management',
  '/problem-solving', '/application-development', '/ibm-i-as400', '/ibm-power',
  '/hybrid-cloud-with-red-hat', '/grc-consulting', '/operation-risk-managment',
  '/it-governance', '/internal-audit', '/financial-control-management',
  '/data-privacy', '/business-continuity-managment', '/regulatory-compliance-management',
  '/banking', '/healthcare-3', '/insurance', '/energy', '/manufacturing',
  '/tellcumacation', '/retail', '/financial-services',
  '/partners', '/ibm', '/cisco', '/red-hat', '/vm-ware', '/aws-2', '/google-2',
  '/contact-2', '/form', '/news-blog', '/client-login', '/landing-page',
  '/transformation-hub',
  '/regulations-for-2023',
  '/the-transformation-of-mainframes-ibm-z-today-and-the-future-with-red-hat-ansible',
  '/cloud-native-applications',
  '/sitemap.xml', '/robots.txt', '/nonexistent-page-404'
];

let passed = 0, failed = 0;
const results = [];

function checkRoute(path, idx) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      const ok = path === '/nonexistent-page-404' ? res.statusCode === 404 : res.statusCode < 400;
      if (ok) passed++;
      else failed++;
      results.push({ path, status: res.statusCode, ok });
      resolve();
    }).on('error', (err) => {
      failed++;
      results.push({ path, status: 'ERROR', ok: false, error: err.message });
      resolve();
    });
  });
}

async function runAll() {
  await Promise.all(routes.map(checkRoute));
  console.log('\n=== ROUTE VERIFICATION RESULTS ===');
  results.sort((a,b) => a.path.localeCompare(b.path)).forEach(r => {
    console.log(`  ${r.ok ? '✓' : '✗'} [${r.status}] ${r.path}`);
  });
  console.log(`\nTotal: ${routes.length} | Passed: ${passed} | Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runAll();
