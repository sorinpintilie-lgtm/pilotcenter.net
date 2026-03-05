const {
  normalizeSpaces,
  normalizeManualPost,
  readAdminState,
  writeAdminState,
  isAdminAuthorized,
  parseJsonBody
} = require('./_news-admin-store');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Password'
    },
    body: JSON.stringify(body)
  };
}

function sanitizePublicState(state = {}) {
  return {
    hiddenSlugs: Array.isArray(state.hiddenSlugs) ? state.hiddenSlugs : [],
    manualPosts: Array.isArray(state.manualPosts) ? state.manualPosts : [],
    updatedAt: state.updatedAt || null
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  const action = normalizeSpaces(event.queryStringParameters?.action || '').toLowerCase();
  const isPublicStatusCheck = event.httpMethod === 'GET' && action === 'status';

  if (!isPublicStatusCheck && !isAdminAuthorized(event)) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  try {
    const state = await readAdminState();

    if (event.httpMethod === 'GET') {
      if (action === 'status') {
        return jsonResponse(200, {
          ok: true,
          configured: Boolean(normalizeSpaces(process.env.NEWS_ADMIN_PASSWORD || ''))
        });
      }

      return jsonResponse(200, {
        ok: true,
        state: sanitizePublicState(state)
      });
    }

    if (event.httpMethod === 'POST') {
      const body = parseJsonBody(event);
      const postAction = normalizeSpaces(body.action || '').toLowerCase();

      if (postAction === 'create-manual') {
        const post = normalizeManualPost(body.post || {});
        const withoutSameSlug = state.manualPosts.filter((item) => item.slug !== post.slug);
        const nextState = await writeAdminState({
          ...state,
          manualPosts: [post, ...withoutSameSlug]
        });
        return jsonResponse(200, { ok: true, state: sanitizePublicState(nextState), created: post });
      }

      if (postAction === 'hide-slug') {
        const slug = normalizeSpaces(body.slug || '').toLowerCase();
        if (!slug) return jsonResponse(400, { error: 'Missing slug' });
        const hiddenSet = new Set(state.hiddenSlugs || []);
        hiddenSet.add(slug);
        const nextState = await writeAdminState({
          ...state,
          hiddenSlugs: Array.from(hiddenSet)
        });
        return jsonResponse(200, { ok: true, state: sanitizePublicState(nextState) });
      }

      if (postAction === 'unhide-slug') {
        const slug = normalizeSpaces(body.slug || '').toLowerCase();
        if (!slug) return jsonResponse(400, { error: 'Missing slug' });
        const nextState = await writeAdminState({
          ...state,
          hiddenSlugs: (state.hiddenSlugs || []).filter((item) => item !== slug)
        });
        return jsonResponse(200, { ok: true, state: sanitizePublicState(nextState) });
      }

      if (postAction === 'reset-hidden') {
        const nextState = await writeAdminState({
          ...state,
          hiddenSlugs: []
        });
        return jsonResponse(200, { ok: true, state: sanitizePublicState(nextState) });
      }

      return jsonResponse(400, { error: 'Unknown action' });
    }

    if (event.httpMethod === 'DELETE') {
      const body = parseJsonBody(event);
      const slug = normalizeSpaces(body.slug || '').toLowerCase();
      if (!slug) return jsonResponse(400, { error: 'Missing slug' });

      const nextState = await writeAdminState({
        ...state,
        manualPosts: (state.manualPosts || []).filter((item) => item.slug !== slug)
      });

      return jsonResponse(200, { ok: true, state: sanitizePublicState(nextState) });
    }

    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Admin operation failed',
      details: error.message
    });
  }
};

