const { normalizeSpaces, syncPilotJobs } = require('./_pilot-jobs-core');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Pilot-Jobs-Token'
    },
    body: JSON.stringify(body)
  };
}

function parseJsonBody(event = {}) {
  try {
    if (!event.body) return {};
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

function getAdminTokenFromEvent(event = {}) {
  const authHeader = normalizeSpaces(
    event?.headers?.authorization
      || event?.headers?.Authorization
      || ''
  );

  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return normalizeSpaces(authHeader.slice(7));
  }

  return normalizeSpaces(
    event?.headers?.['x-pilot-jobs-token']
      || event?.headers?.['X-Pilot-Jobs-Token']
      || event?.queryStringParameters?.token
      || ''
  );
}

function isAdminAuthorized(event = {}) {
  const configured = normalizeSpaces(process.env.PILOT_JOBS_ADMIN_TOKEN || '');
  if (!configured) return false;
  const incoming = getAdminTokenFromEvent(event);
  if (!incoming) return false;
  return incoming === configured;
}

function pickNumber(value, fallback = undefined) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return numeric;
}

function toBoolean(value = '') {
  const normalized = normalizeSpaces(value).toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function collectSyncOptions(event = {}) {
  const query = event.queryStringParameters || {};
  const body = parseJsonBody(event);
  const options = body?.options && typeof body.options === 'object' ? body.options : {};

  return {
    sourceLimit: pickNumber(query.sourceLimit ?? options.sourceLimit),
    maxPagesPerSource: pickNumber(query.maxPagesPerSource ?? options.maxPagesPerSource),
    maxDepth: pickNumber(query.maxDepth ?? options.maxDepth),
    perplexityBudgetPerSource: pickNumber(query.perplexityBudgetPerSource ?? options.perplexityBudgetPerSource),
    perplexityMinConfidence: pickNumber(query.perplexityMinConfidence ?? options.perplexityMinConfidence),
    liveLogs: true,
    logToConsole: toBoolean(query.logToConsole ?? options.logToConsole ?? '1')
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (!isAdminAuthorized(event)) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  try {
    const result = await syncPilotJobs(collectSyncOptions(event));
    return jsonResponse(200, {
      ok: true,
      mode: 'background-sync',
      ...result,
      finishedAt: new Date().toISOString()
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: 'Pilot jobs background sync failed',
      details: error.message
    });
  }
};

