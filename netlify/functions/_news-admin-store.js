const crypto = require('crypto');

const DEFAULT_STATE = {
  hiddenSlugs: [],
  manualPosts: [],
  adminLogs: [],
  updatedAt: null
};

let memoryState = { ...DEFAULT_STATE };

function normalizeSpaces(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function slugify(value = '') {
  const normalized = String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'aviation-update';
}

function shortHash(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 10);
}

function clampWords(text = '', maxWords = 60) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(' ').trim();
}

function normalizeManualPost(post = {}) {
  const now = new Date().toISOString();
  const title = normalizeSpaces(post.title || 'Aviation update');
  const summary = normalizeSpaces(post.summary || clampWords(post.body || post.excerpt || '', 45));
  const excerpt = normalizeSpaces(post.excerpt || clampWords(post.body || summary, 110));
  const body = String(post.body || excerpt || summary).trim();
  const categoryRaw = normalizeSpaces(post.category || 'Training') || 'Training';
  const category = normalizeManualCategory(categoryRaw);
  const image = normalizeSpaces(post.image || '');
  const source = normalizeSpaces(post.source || 'PilotCenter.net') || 'PilotCenter.net';
  const publishedAtRaw = normalizeSpaces(post.publishedAt || post.isoDate || now);
  const publishedAt = Number.isNaN(new Date(publishedAtRaw).getTime()) ? now : new Date(publishedAtRaw).toISOString();
  const base = slugify(title).slice(0, 78);
  const slug = normalizeSpaces(post.slug || `${base}-${shortHash(`${title}|${publishedAt}|manual`)}`.slice(0, 96)).toLowerCase();

  return {
    id: normalizeSpaces(post.id || `manual-${shortHash(`${slug}|${publishedAt}`)}`),
    slug,
    articlePath: `/news-and-resources/${slug}`,
    title,
    summary,
    excerpt,
    body,
    category,
    image,
    source,
    link: normalizeSpaces(post.link || `manual://${slug}`),
    sourceLink: normalizeSpaces(post.sourceLink || ''),
    date: post.date || new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(publishedAt)),
    publishedAt,
    rewriteMode: 'manual',
    isManual: true,
    createdAt: normalizeSpaces(post.createdAt || now),
    updatedAt: now
  };
}

function normalizeManualCategory(input = '') {
  const value = normalizeSpaces(String(input || '')).toLowerCase();

  if (!value) return 'Training';
  if (value.includes('train') || value.includes('career') || value.includes('cadet')) return 'Training';
  if (value.includes('airline') || value.includes('airport') || value.includes('fleet')) return 'Airlines';
  if (value.includes('tech') || value.includes('digital') || value.includes('innovation')) return 'Technology';
  if (value.includes('regulation') || value.includes('policy') || value.includes('faa') || value.includes('easa') || value.includes('icao') || value.includes('compliance')) return 'Regulations';

  return 'Training';
}

function normalizeState(input = {}) {
  const adminLogs = Array.isArray(input.adminLogs)
    ? input.adminLogs
      .map((item) => ({
        at: normalizeSpaces(item?.at || '') || new Date().toISOString(),
        event: normalizeSpaces(item?.event || 'unknown') || 'unknown',
        message: normalizeSpaces(item?.message || '') || 'No details provided',
        meta: item?.meta && typeof item.meta === 'object' ? item.meta : {}
      }))
      .slice(-240)
    : [];

  return {
    hiddenSlugs: Array.isArray(input.hiddenSlugs)
      ? input.hiddenSlugs.map((item) => normalizeSpaces(item).toLowerCase()).filter(Boolean)
      : [],
    manualPosts: Array.isArray(input.manualPosts)
      ? input.manualPosts.map((item) => normalizeManualPost(item))
      : [],
    adminLogs,
    updatedAt: normalizeSpaces(input.updatedAt || '') || null
  };
}

async function withBlobStore() {
  const { getStore } = require('@netlify/blobs');
  return getStore('news-admin');
}

async function readAdminState() {
  try {
    const store = await withBlobStore();
    const stored = await store.get('state', { type: 'json' });
    const normalized = normalizeState(stored || DEFAULT_STATE);
    memoryState = normalized;
    return normalized;
  } catch {
    return normalizeState(memoryState);
  }
}

async function writeAdminState(nextState = DEFAULT_STATE) {
  const normalized = normalizeState({
    ...nextState,
    updatedAt: new Date().toISOString()
  });
  memoryState = normalized;

  try {
    const store = await withBlobStore();
    await store.set('state', normalized, { type: 'json' });
  } catch {
    // fallback to in-memory state for local dev or unavailable blob store
  }

  return normalized;
}

function getAdminPasswordFromEvent(event = {}) {
  const authHeader = normalizeSpaces(
    event?.headers?.authorization
      || event?.headers?.Authorization
      || ''
  );

  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return normalizeSpaces(authHeader.slice(7));
  }

  return normalizeSpaces(
    event?.headers?.['x-admin-password']
      || event?.headers?.['X-Admin-Password']
      || event?.queryStringParameters?.password
      || ''
  );
}

function isAdminAuthorized(event = {}) {
  const configured = normalizeSpaces(process.env.NEWS_ADMIN_PASSWORD || '');
  if (!configured) return false;
  const incoming = getAdminPasswordFromEvent(event);
  if (!incoming) return false;
  return incoming === configured;
}

function parseJsonBody(event = {}) {
  try {
    if (!event.body) return {};
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

module.exports = {
  normalizeSpaces,
  normalizeManualCategory,
  normalizeManualPost,
  readAdminState,
  writeAdminState,
  isAdminAuthorized,
  parseJsonBody
};

