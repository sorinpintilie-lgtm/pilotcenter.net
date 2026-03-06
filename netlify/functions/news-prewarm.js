const { handler: aviationNewsHandler } = require('./aviation-news');

function buildEvent(query = {}) {
  return {
    httpMethod: 'GET',
    queryStringParameters: query,
    headers: {
      accept: 'application/json'
    }
  };
}

async function callAviationNews(query = {}) {
  const response = await aviationNewsHandler(buildEvent(query));
  const statusCode = Number(response?.statusCode || 500);
  const payload = JSON.parse(response?.body || '{}');

  if (statusCode >= 400) {
    const reason = payload?.error || payload?.details || `status ${statusCode}`;
    throw new Error(`aviation-news call failed: ${reason}`);
  }

  return payload;
}

exports.handler = async () => {
  try {
    const listPayload = await callAviationNews({ limit: '12', page: '1', sort: 'latest' });
    const items = Array.isArray(listPayload?.items) ? listPayload.items : [];

    const latestSlugs = items
      .map((item) => String(item?.slug || '').trim())
      .filter(Boolean)
      .slice(0, 4);

    for (const slug of latestSlugs) {
      // eslint-disable-next-line no-await-in-loop
      await callAviationNews({ slug });
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        ok: true,
        warmedListCount: items.length,
        warmedFullBodySlugs: latestSlugs,
        generatedAt: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Failed to prewarm news',
        details: error.message
      })
    };
  }
};

