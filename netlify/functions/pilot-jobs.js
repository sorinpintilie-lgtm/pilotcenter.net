const {
  normalizeSpaces,
  getPublicJobs,
  getJobBySlug,
  updateJobBySlug,
  getValidationReport,
  getCrawlerLogs,
  getCrawlerLogsFeed,
  clearPilotJobsData,
  syncPilotJobs
} = require('./_pilot-jobs-core');

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

function toBoolean(value = '') {
  const normalized = normalizeSpaces(value).toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  const query = event.queryStringParameters || {};
  const method = event.httpMethod || 'GET';

  try {
    if (method === 'GET') {
      const action = normalizeSpaces(query.action || '').toLowerCase();

      if (action === 'status') {
        const payload = await getPublicJobs({ page: 1, limit: 1, includeExpired: true });
        return jsonResponse(200, {
          ok: true,
          configured: Boolean(normalizeSpaces(process.env.PILOT_JOBS_ADMIN_TOKEN || '')),
          stats: payload.stats,
          state: payload.state,
          store: payload?.state?.store || null,
          generatedAt: new Date().toISOString()
        });
      }

      if (action === 'sync') {
        if (!isAdminAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized' });

        const result = await syncPilotJobs({
          sourceLimit: Number(query.sourceLimit || 0) || undefined,
          maxPagesPerSource: Number(query.maxPagesPerSource || 0) || undefined,
          maxDepth: Number(query.maxDepth || 0) || undefined,
          perplexityBudgetPerSource: Number(query.perplexityBudgetPerSource || 0) || undefined,
          perplexityMinConfidence: Number(query.perplexityMinConfidence || 0) || undefined,
          logToConsole: toBoolean(query.logToConsole || ''),
          forcePerplexityStrict: toBoolean(query.forcePerplexityStrict || ''),
          liveLogs: !toBoolean(query.disableLiveLogs || '')
        });

        return jsonResponse(200, {
          ok: true,
          mode: 'manual-sync',
          ...result
        });
      }

      if (action === 'validate') {
        if (!isAdminAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized' });
        const report = await getValidationReport();
        return jsonResponse(200, { ok: true, report });
      }

      if (action === 'logs') {
        if (!isAdminAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized' });
        const logs = await getCrawlerLogs(Number(query.limit || 200));
        return jsonResponse(200, {
          ok: true,
          logs,
          generatedAt: new Date().toISOString()
        });
      }

      if (action === 'logs-feed') {
        if (!isAdminAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized' });
        const feed = await getCrawlerLogsFeed(Number(query.limit || 240));
        return jsonResponse(200, {
          ok: true,
          ...feed
        });
      }

      if (action === 'reset') {
        if (!isAdminAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized' });
        const result = await clearPilotJobsData();
        return jsonResponse(200, {
          ok: true,
          result
        });
      }

      const slug = normalizeSpaces(query.slug || '').toLowerCase();
      if (slug) {
        const item = await getJobBySlug(slug);
        if (!item) return jsonResponse(404, { error: 'Job not found' });
        return jsonResponse(200, { ok: true, item });
      }

      const payload = await getPublicJobs({
        page: Number(query.page || 1),
        limit: Number(query.limit || 12),
        search: query.search || '',
        country: query.country || 'all',
        role: query.role || 'all',
        source: query.source || 'all',
        sort: query.sort || 'latest',
        includeExpired: toBoolean(query.includeExpired || '')
      });

      return jsonResponse(200, {
        ok: true,
        ...payload,
        filters: {
          page: Number(query.page || 1),
          limit: Number(query.limit || 12),
          search: normalizeSpaces(query.search || ''),
          country: normalizeSpaces(query.country || 'all') || 'all',
          role: normalizeSpaces(query.role || 'all') || 'all',
          source: normalizeSpaces(query.source || 'all') || 'all',
          sort: normalizeSpaces(query.sort || 'latest') || 'latest'
        }
      });
    }

    if (method === 'POST') {
      if (!isAdminAuthorized(event)) return jsonResponse(401, { error: 'Unauthorized' });

      const body = parseJsonBody(event);
      const action = normalizeSpaces(body.action || '').toLowerCase();

      if (action === 'sync') {
        const result = await syncPilotJobs({
          sourceLimit: Number(body?.options?.sourceLimit || 0) || undefined,
          maxPagesPerSource: Number(body?.options?.maxPagesPerSource || 0) || undefined,
          maxDepth: Number(body?.options?.maxDepth || 0) || undefined,
          perplexityBudgetPerSource: Number(body?.options?.perplexityBudgetPerSource || 0) || undefined,
          perplexityMinConfidence: Number(body?.options?.perplexityMinConfidence || 0) || undefined,
          logToConsole: toBoolean(body?.options?.logToConsole || ''),
          forcePerplexityStrict: toBoolean(body?.options?.forcePerplexityStrict || ''),
          liveLogs: body?.options?.disableLiveLogs ? false : true
        });

        return jsonResponse(200, {
          ok: true,
          mode: 'manual-sync',
          ...result
        });
      }

      if (action === 'hide-slug' || action === 'unhide-slug' || action === 'force-expire') {
        const slug = normalizeSpaces(body.slug || '').toLowerCase();
        if (!slug) return jsonResponse(400, { error: 'Missing slug' });

        const updated = await updateJobBySlug(slug, (current) => {
          if (action === 'hide-slug') {
            return { status: 'hidden' };
          }

          if (action === 'unhide-slug') {
            return {
              status: current.status === 'hidden' ? 'active' : current.status
            };
          }

          return {
            status: 'expired',
            expiresAt: new Date().toISOString()
          };
        });

        if (!updated) return jsonResponse(404, { error: 'Job not found' });

        return jsonResponse(200, {
          ok: true,
          action,
          updated
        });
      }

      return jsonResponse(400, { error: 'Unknown action' });
    }

    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Pilot jobs operation failed',
      details: error.message
    });
  }
};

