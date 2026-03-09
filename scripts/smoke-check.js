const https = require('https');

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://pilotcenter.net';

const targets = [
  '/sitemap.xml',
  '/sitemap-index.xml',
  '/news-sitemap.xml',
  '/jobs-sitemap.xml',
  '/news-sitemap.xml?limit=1',
  '/jobs-sitemap.xml?limit=1',
  '/.netlify/functions/news-prewarm?dryRun=1',
  '/.netlify/functions/pilot-jobs-sync?dryRun=1'
];

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000 }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: Number(res.statusCode || 0),
          body,
          headers: res.headers || {}
        });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Timeout for ${url}`));
    });

    req.on('error', reject);
  });
}

function assertResponse(path, response) {
  const statusOk = response.statusCode >= 200 && response.statusCode < 300;
  if (!statusOk) {
    throw new Error(`${path} returned status ${response.statusCode}`);
  }

  const xmlLikePath = path.includes('.xml');
  if (xmlLikePath) {
    const hasXml = /<\?xml|<urlset|<sitemapindex/i.test(response.body || '');
    const htmlFallback = /<!doctype html>|<html/i.test(response.body || '');
    if (!hasXml && !htmlFallback) {
      throw new Error(`${path} did not return XML-like content`);
    }
  }

  if (path.includes('/functions/')) {
    const contentType = String(response.headers['content-type'] || '').toLowerCase();
    const hasJsonLike = contentType.includes('application/json')
      || /"ok"\s*:|"error"\s*:/i.test(response.body || '');
    const htmlFallback = /<!doctype html>|<html/i.test(response.body || '');
    if (!hasJsonLike && !htmlFallback) {
      throw new Error(`${path} did not return JSON-like content`);
    }
  }
}

async function run() {
  const failures = [];

  for (const target of targets) {
    const url = `${BASE_URL}${target}`;
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await get(url);
      assertResponse(target, response);
      // eslint-disable-next-line no-console
      console.log(`[smoke] OK ${target} (${response.statusCode})`);
    } catch (error) {
      failures.push(`${target}: ${error.message}`);
      // eslint-disable-next-line no-console
      console.error(`[smoke] FAIL ${target} -> ${error.message}`);
    }
  }

  if (failures.length) {
    throw new Error(`Smoke checks failed:\n- ${failures.join('\n- ')}`);
  }

  // eslint-disable-next-line no-console
  console.log('[smoke] All checks passed');
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error.message || error);
  process.exit(1);
});
