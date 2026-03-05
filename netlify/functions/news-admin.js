const {
  normalizeSpaces,
  normalizeManualPost,
  readAdminState,
  writeAdminState,
  isAdminAuthorized,
  parseJsonBody
} = require('./_news-admin-store');

async function withRewriteStore() {
  const { getStore } = require('@netlify/blobs');
  return getStore('news-rewrites');
}

async function readTelemetryForAdmin() {
  try {
    const store = await withRewriteStore();
    const telemetry = await store.get('telemetry:global', { type: 'json' });
    if (!telemetry || typeof telemetry !== 'object') {
      return { counters: {}, logs: [] };
    }
    return {
      counters: telemetry.counters || {},
      logs: Array.isArray(telemetry.logs) ? telemetry.logs.slice(-200).reverse() : []
    };
  } catch {
    return { counters: {}, logs: [] };
  }
}

async function listPersistedRewrites(limit = 220) {
  try {
    const store = await withRewriteStore();
    const listed = await store.list({ prefix: 'rewrite:', limit });
    const keys = Array.isArray(listed?.blobs) ? listed.blobs.map((item) => item.key) : [];

    const items = [];
    for (const key of keys) {
      // eslint-disable-next-line no-await-in-loop
      const value = await store.get(key, { type: 'json' });
      if (value && value.slug) items.push(value);
    }

    return items.sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.date || 0).getTime() || 0;
      const timeB = new Date(b.publishedAt || b.date || 0).getTime() || 0;
      return timeB - timeA;
    });
  } catch {
    return [];
  }
}

async function savePersistedRewrite(item) {
  if (!item?.link) return;
  const crypto = require('crypto');
  const hash = crypto.createHash('sha1').update(String(item.link)).digest('hex');
  const key = `rewrite:${hash}`;
  const store = await withRewriteStore();
  await store.set(key, {
    ...item,
    persistedAt: new Date().toISOString()
  }, { type: 'json' });
}

async function deletePersistedRewriteBySlug(slug = '') {
  const targetSlug = normalizeSpaces(slug).toLowerCase();
  if (!targetSlug) return false;

  const store = await withRewriteStore();
  const listed = await store.list({ prefix: 'rewrite:', limit: 500 });
  const keys = Array.isArray(listed?.blobs) ? listed.blobs.map((item) => item.key) : [];

  for (const key of keys) {
    // eslint-disable-next-line no-await-in-loop
    const value = await store.get(key, { type: 'json' });
    if (normalizeSpaces(value?.slug || '').toLowerCase() === targetSlug) {
      // eslint-disable-next-line no-await-in-loop
      await store.delete(key);
      return true;
    }
  }

  return false;
}

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

      if (action === 'dashboard') {
        const telemetry = await readTelemetryForAdmin();
        const rewrites = await listPersistedRewrites(260);

        return jsonResponse(200, {
          ok: true,
          state: sanitizePublicState(state),
          telemetry,
          rewrites
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
        await savePersistedRewrite(post);
        return jsonResponse(200, { ok: true, state: sanitizePublicState(nextState), created: post });
      }

      if (postAction === 'update-post') {
        const incoming = body.post || {};
        const incomingSlug = normalizeSpaces(incoming.slug || '').toLowerCase();
        if (!incomingSlug) return jsonResponse(400, { error: 'Missing post slug' });

        const rewrites = await listPersistedRewrites(400);
        const existing = rewrites.find((item) => normalizeSpaces(item.slug || '').toLowerCase() === incomingSlug);
        if (!existing) return jsonResponse(404, { error: 'Post not found' });

        const updated = {
          ...existing,
          title: normalizeSpaces(incoming.title || existing.title),
          summary: normalizeSpaces(incoming.summary || existing.summary),
          excerpt: normalizeSpaces(incoming.excerpt || existing.excerpt),
          body: String(incoming.body || existing.body || '').trim(),
          category: normalizeSpaces(incoming.category || existing.category || 'General'),
          image: normalizeSpaces(incoming.image || existing.image || ''),
          source: normalizeSpaces(incoming.source || existing.source || 'PilotCenter.net'),
          sourceLink: normalizeSpaces(incoming.sourceLink || existing.sourceLink || ''),
          updatedAt: new Date().toISOString()
        };

        await savePersistedRewrite(updated);

        if (updated.rewriteMode === 'manual') {
          const manualPosts = (state.manualPosts || []).filter((item) => item.slug !== incomingSlug);
          const nextState = await writeAdminState({
            ...state,
            manualPosts: [updated, ...manualPosts]
          });
          return jsonResponse(200, { ok: true, state: sanitizePublicState(nextState), updated });
        }

        return jsonResponse(200, { ok: true, state: sanitizePublicState(state), updated });
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

      await deletePersistedRewriteBySlug(slug);

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

