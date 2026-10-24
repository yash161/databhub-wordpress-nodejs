const app = require('../server');

module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('Unhandled Lambda Error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end(`<h1>Serverless Function Error</h1><pre>${err.stack || err}</pre>`);
  }
};
