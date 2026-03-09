const {
  readAllJobs,
  normalizeSpaces
} = require('./_pilot-jobs-core');

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function xmlResponse(xml) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800'
    },
    body: xml
  };
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function toDateOnly(value = '') {
  const parsed = new Date(value || '');
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().split('T')[0];
  return parsed.toISOString().split('T')[0];
}

function isActive(job = {}, nowMs = Date.now()) {
  const status = normalizeSpaces(job.status || '').toLowerCase();
  if (status === 'hidden' || status === 'expired') return false;

  const expiresAt = new Date(job.expiresAt || '').getTime();
  if (Number.isFinite(expiresAt) && expiresAt > 0 && expiresAt < nowMs) return false;

  return true;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const nowMs = Date.now();
    const jobs = await readAllJobs();

    const active = jobs
      .filter((job) => job?.slug)
      .filter((job) => isActive(job, nowMs))
      .sort((a, b) => {
        const aMs = new Date(a.postedAt || a.firstSeenAt || 0).getTime() || 0;
        const bMs = new Date(b.postedAt || b.firstSeenAt || 0).getTime() || 0;
        return bMs - aMs;
      })
      .slice(0, 5000);

    const rows = active
      .map((job) => {
        const loc = `https://pilotcenter.net/latest-pilot-jobs/${encodeURIComponent(job.slug)}`;
        const lastmod = toDateOnly(job.updatedAt || job.postedAt || job.firstSeenAt || job.createdAt);

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
      rows,
      '</urlset>',
      ''
    ].join('\n');

    return xmlResponse(xml);
  } catch (error) {
    return jsonResponse(500, {
      error: 'Failed to generate jobs sitemap',
      details: error.message
    });
  }
};

