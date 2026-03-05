async function jsonResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

async function xmlResponse(xml) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800'
    },
    body: xml
  };
}

async function withRewriteStore() {
  const { getStore } = require('@netlify/blobs');
  return getStore('news-rewrites');
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const store = await withRewriteStore();
    const listed = await store.list({ prefix: 'rewrite:', limit: 1200 });
    const keys = Array.isArray(listed?.blobs) ? listed.blobs.map((item) => item.key) : [];

    const items = [];
    for (const key of keys) {
      // eslint-disable-next-line no-await-in-loop
      const value = await store.get(key, { type: 'json' });
      if (!value?.slug) continue;
      items.push(value);
    }

    const uniqueBySlug = new Map();
    items.forEach((item) => {
      const slug = String(item.slug || '').trim().toLowerCase();
      if (!slug) return;
      if (!uniqueBySlug.has(slug)) uniqueBySlug.set(slug, item);
    });

    const routes = Array.from(uniqueBySlug.values())
      .map((item) => {
        const slug = String(item.slug || '').trim();
        const publishedAt = new Date(item.publishedAt || item.updatedAt || item.date || Date.now());
        const lastmod = Number.isNaN(publishedAt.getTime())
          ? new Date().toISOString().split('T')[0]
          : publishedAt.toISOString().split('T')[0];

        const loc = `https://pilotcenter.net/news-and-resources/${encodeURIComponent(slug)}`;
        return [
          '  <url>',
          `    <loc>${escapeXml(loc)}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          '    <changefreq>daily</changefreq>',
          '    <priority>0.8</priority>',
          '  </url>'
        ].join('\n');
      })
      .join('\n');

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      routes,
      '</urlset>',
      ''
    ].join('\n');

    return xmlResponse(xml);
  } catch (error) {
    return jsonResponse(500, {
      error: 'Failed to generate news sitemap',
      details: error.message
    });
  }
};

