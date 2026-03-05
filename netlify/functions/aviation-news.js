const RSS_FEED_URL = process.env.NEWS_RSS_URL || 'https://rss.app/feeds/vbBqD5waAkF3pLqc.xml';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const CACHE_MAX_ITEMS = 300;
const rewriteCache = new Map();
const runtimeHiddenLinks = new Set();
const runtimeHiddenSlugs = new Set();

const MAX_BODY_CHARS = 1800;
const FULL_BODY_MIN_CHARS = 2500;
const TELEMETRY_KEY = 'telemetry:global';
const TELEMETRY_MAX_LOGS = 220;

const NEGATIVE_KEYWORDS = [
  'war', 'wars', 'conflict', 'military strike', 'airstrike', 'attack', 'combat',
  'crash', 'crashes', 'crashed', 'accident', 'incident', 'fatal', 'fatality',
  'death', 'dead', 'killed', 'injured', 'emergency landing', 'hijack', 'hijacking',
  'terror', 'terrorism', 'bomb', 'hostage', 'missile', 'sanction'
];

const FIXED_NEWS_CATEGORIES = ['Training', 'Airlines', 'Technology', 'Regulations'];
const CATEGORY_KEYWORDS = {
  Training: [
    'training', 'cadet', 'academy', 'simulator', 'flight school', 'pilot program',
    'curriculum', 'instructor', 'license', 'upskill', 'ab-initio', 'upskilling'
  ],
  Airlines: [
    'airline', 'carrier', 'fleet', 'route', 'passenger', 'cabin', 'airport',
    'network', 'load factor', 'ticket', 'aviation market', 'operation'
  ],
  Technology: [
    'technology', 'avionics', 'aircraft tech', 'ai', 'automation', 'digital',
    'electric', 'hybrid', 'sustainable fuel', 'saf', 'innovation', 'software'
  ],
  Regulations: [
    'regulation', 'regulatory', 'faa', 'easa', 'icao', 'policy', 'compliance',
    'rule', 'certification', 'authority', 'safety standard', 'approval'
  ]
};

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readAdminState } = require('./_news-admin-store');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=90, stale-while-revalidate=120',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(body)
  };
}

function parseCsvValue(value = '') {
  return String(value || '')
    .split(',')
    .map((part) => normalizeSpaces(part).toLowerCase())
    .filter(Boolean);
}

function loadCurationConfig() {
  const defaults = {
    blockedLinks: [],
    blockedKeywords: [],
    blockedSources: []
  };

  try {
    const filePath = path.join(__dirname, '..', '..', 'data', 'news-curation.json');
    if (!fs.existsSync(filePath)) return defaults;

    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      blockedLinks: Array.isArray(parsed.blockedLinks)
        ? parsed.blockedLinks.map((item) => normalizeSpaces(item).toLowerCase()).filter(Boolean)
        : [],
      blockedKeywords: Array.isArray(parsed.blockedKeywords)
        ? parsed.blockedKeywords.map((item) => normalizeSpaces(item).toLowerCase()).filter(Boolean)
        : [],
      blockedSources: Array.isArray(parsed.blockedSources)
        ? parsed.blockedSources.map((item) => normalizeSpaces(item).toLowerCase()).filter(Boolean)
        : []
    };
  } catch {
    return defaults;
  }
}

function isBlockedByCuration(item = {}, curation = {}) {
  const link = normalizeSpaces(item.link || '').toLowerCase();
  const source = normalizeSpaces(item.source || '').toLowerCase();
  const text = `${item.title || ''} ${item.description || ''} ${item.content || ''}`.toLowerCase();

  if (runtimeHiddenLinks.has(link)) return true;

  if (Array.isArray(curation.blockedLinks) && curation.blockedLinks.some((value) => link.includes(value))) {
    return true;
  }

  if (Array.isArray(curation.blockedSources) && curation.blockedSources.some((value) => source.includes(value))) {
    return true;
  }

  if (Array.isArray(curation.blockedKeywords) && curation.blockedKeywords.some((value) => text.includes(value))) {
    return true;
  }

  return false;
}

function getAdminKey(event) {
  const queryKey = normalizeSpaces(event?.queryStringParameters?.key || '');
  const headerKey = normalizeSpaces(
    event?.headers?.['x-news-admin-key']
      || event?.headers?.['X-News-Admin-Key']
      || ''
  );
  return queryKey || headerKey;
}

function stripHtml(input = '') {
  return String(input)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function getSourceName(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'external source';
  }
}

function extractImageFromHtml(html = '') {
  const match = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : '';
}

function extractTextFromHtml(html = '') {
  const source = String(html || '');
  if (!source) return '';

  const paragraphs = Array.from(source.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map((match) => stripHtml(match[1]))
    .map((text) => normalizeSpaces(text))
    .filter((text) => text.length > 50);

  if (paragraphs.length >= 4) {
    return paragraphs.join('\n\n');
  }

  const articleMatch = source.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch?.[1]) {
    const articleText = stripHtml(articleMatch[1]);
    if (articleText.length > 400) return articleText;
  }

  return stripHtml(source);
}

function normalizeSpaces(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function toAbsoluteUrl(url = '', base = '') {
  const candidate = String(url || '').trim();
  if (!candidate) return '';

  try {
    return new URL(candidate, base || undefined).toString();
  } catch {
    return '';
  }
}

function normalizeForCompare(value = '') {
  return normalizeSpaces(String(value).toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
  const input = String(value || '');
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).slice(0, 6) || 'update';
}

function strongHash(value = '') {
  return crypto.createHash('sha1').update(String(value || '')).digest('hex');
}

function buildRewriteCacheKey(link = '') {
  return `rewrite:${strongHash(link)}`;
}

let rewriteBlobStorePromise = null;

async function getRewriteBlobStore() {
  if (!rewriteBlobStorePromise) {
    rewriteBlobStorePromise = (async () => {
      try {
        const { getStore } = require('@netlify/blobs');
        return getStore('news-rewrites');
      } catch {
        return null;
      }
    })();
  }

  return rewriteBlobStorePromise;
}

async function readTelemetry() {
  const defaults = {
    counters: {
      totalRequests: 0,
      listRequests: 0,
      slugRequests: 0,
      rewriteCalls: 0,
      openaiRewriteCalls: 0,
      localRewriteCalls: 0,
      blobCacheHits: 0,
      memoryCacheHits: 0,
      persistedWrites: 0,
      slugFullBodyRewrites: 0,
      errors: 0
    },
    logs: []
  };

  const store = await getRewriteBlobStore();
  if (!store) return defaults;

  try {
    const telemetry = await store.get(TELEMETRY_KEY, { type: 'json' });
    if (!telemetry || typeof telemetry !== 'object') return defaults;
    return {
      counters: {
        ...defaults.counters,
        ...(telemetry.counters || {})
      },
      logs: Array.isArray(telemetry.logs) ? telemetry.logs.slice(-TELEMETRY_MAX_LOGS) : []
    };
  } catch {
    return defaults;
  }
}

async function recordTelemetry(eventName, details = {}) {
  const store = await getRewriteBlobStore();
  if (!store) return;

  try {
    const telemetry = await readTelemetry();
    const counters = { ...(telemetry.counters || {}) };

    counters.totalRequests = Number(counters.totalRequests || 0);
    counters.listRequests = Number(counters.listRequests || 0);
    counters.slugRequests = Number(counters.slugRequests || 0);
    counters.rewriteCalls = Number(counters.rewriteCalls || 0);
    counters.openaiRewriteCalls = Number(counters.openaiRewriteCalls || 0);
    counters.localRewriteCalls = Number(counters.localRewriteCalls || 0);
    counters.blobCacheHits = Number(counters.blobCacheHits || 0);
    counters.memoryCacheHits = Number(counters.memoryCacheHits || 0);
    counters.persistedWrites = Number(counters.persistedWrites || 0);
    counters.slugFullBodyRewrites = Number(counters.slugFullBodyRewrites || 0);
    counters.errors = Number(counters.errors || 0);

    if (eventName === 'request:list') counters.listRequests += 1;
    if (eventName === 'request:slug') counters.slugRequests += 1;
    if (eventName === 'rewrite:openai') {
      counters.rewriteCalls += 1;
      counters.openaiRewriteCalls += 1;
    }
    if (eventName === 'rewrite:local') {
      counters.rewriteCalls += 1;
      counters.localRewriteCalls += 1;
    }
    if (eventName === 'cache:blob:hit') counters.blobCacheHits += 1;
    if (eventName === 'cache:memory:hit') counters.memoryCacheHits += 1;
    if (eventName === 'cache:persist:write') counters.persistedWrites += 1;
    if (eventName === 'rewrite:slug-full-body') counters.slugFullBodyRewrites += 1;
    if (eventName === 'error') counters.errors += 1;

    const logs = Array.isArray(telemetry.logs) ? telemetry.logs : [];
    logs.push({
      at: new Date().toISOString(),
      event: eventName,
      ...details
    });

    await store.set(TELEMETRY_KEY, {
      counters,
      logs: logs.slice(-TELEMETRY_MAX_LOGS)
    }, { type: 'json' });
  } catch {
    // ignore telemetry failures
  }
}

async function preloadPersistentCache(items = [], maxReads = 12) {
  const store = await getRewriteBlobStore();
  if (!store) return;

  const toRead = items
    .filter((item) => item?.link && !cacheGet(item.link))
    .slice(0, maxReads);

  if (!toRead.length) return;

  await Promise.all(toRead.map(async (item) => {
    try {
      const stored = await store.get(buildRewriteCacheKey(item.link), { type: 'json' });
      if (!stored || !stored.link) return;
      cacheSet(stored.link, stored);
      await recordTelemetry('cache:blob:hit', {
        link: stored.link,
        slug: stored.slug || ''
      });
    } catch {
      // ignore cache read failures
    }
  }));
}

async function persistArticlesToStore(articles = [], maxWrites = 12) {
  const store = await getRewriteBlobStore();
  if (!store) return;

  const toWrite = articles
    .filter((item) => item?.link)
    .slice(0, maxWrites);

  if (!toWrite.length) return;

  await Promise.all(toWrite.map(async (item) => {
    try {
      await store.set(buildRewriteCacheKey(item.link), {
        ...item,
        persistedAt: new Date().toISOString()
      }, { type: 'json' });
      await recordTelemetry('cache:persist:write', {
        link: item.link,
        slug: item.slug || '',
        rewriteMode: item.rewriteMode || ''
      });
    } catch {
      // ignore cache write failures
    }
  }));
}

function buildArticleSlug(item = {}) {
  const base = slugify(item.title || 'aviation-update').slice(0, 78);
  const unique = shortHash(item.link || `${item.title || ''}-${item.pubDate || ''}`);
  return `${base}-${unique}`;
}

function cleanEditorialTitle(value = '') {
  return normalizeSpaces(String(value).replace(/^PilotCenter\s+Briefing:\s*/i, '')) || 'Aviation update';
}

function splitSentences(text = '') {
  return String(text)
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function decodeXmlEntities(value = '') {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(Number.parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(Number.parseInt(dec, 10));
      } catch {
        return '';
      }
    })
    .trim();
}

function extractTagValue(xml = '', tagName = '') {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(xml).match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)</${escaped}>`, 'i'));
  return match ? decodeXmlEntities(match[1]) : '';
}

function extractMediaUrlFromItem(xml = '') {
  const mediaContent = String(xml).match(/<media:content[^>]*\burl=["']([^"']+)["'][^>]*>/i);
  if (mediaContent?.[1]) return decodeXmlEntities(mediaContent[1]);

  const mediaThumbnail = String(xml).match(/<media:thumbnail[^>]*\burl=["']([^"']+)["'][^>]*>/i);
  if (mediaThumbnail?.[1]) return decodeXmlEntities(mediaThumbnail[1]);

  const enclosure = String(xml).match(/<enclosure[^>]*\burl=["']([^"']+)["'][^>]*>/i);
  if (enclosure?.[1]) return decodeXmlEntities(enclosure[1]);

  return '';
}

async function fetchArticleImage(articleUrl) {
  if (!articleUrl) return '';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(articleUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PilotCenterBot/1.0; +https://pilotcenter.net)'
      }
    });

    if (!response.ok) return '';
    const html = await response.text();

    const ogPatterns = [
      /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
      /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i
    ];

    for (const pattern of ogPatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const imageUrl = toAbsoluteUrl(decodeXmlEntities(match[1]), articleUrl);
        if (imageUrl) return imageUrl;
      }
    }

    const fallbackImage = extractImageFromHtml(html);
    return toAbsoluteUrl(fallbackImage, articleUrl);
  } catch {
    return '';
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchArticleText(articleUrl) {
  if (!articleUrl) return '';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(articleUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PilotCenterBot/1.0; +https://pilotcenter.net)'
      }
    });

    if (!response.ok) return '';
    const html = await response.text();
    const extracted = extractTextFromHtml(html);
    return normalizeSpaces(extracted);
  } catch {
    return '';
  } finally {
    clearTimeout(timeoutId);
  }
}

async function ensureImageReadyItems(items, neededCount) {
  const result = [];

  for (const item of items) {
    if (result.length >= neededCount) break;

    const existingImage = toAbsoluteUrl(item.image || '', item.link);
    if (existingImage) {
      result.push({ ...item, image: existingImage });
      continue;
    }

    const fetchedImage = await fetchArticleImage(item.link);
    result.push({ ...item, image: fetchedImage || '' });
  }

  return result;
}

function normalizeFilterValue(value = '') {
  return normalizeSpaces(String(value || '')).toLowerCase();
}

function classifyCategoryFromText(text = '') {
  const normalized = normalizeFilterValue(text);
  if (!normalized) return 'Training';

  const scores = FIXED_NEWS_CATEGORIES.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {});

  FIXED_NEWS_CATEGORIES.forEach((category) => {
    const keywords = CATEGORY_KEYWORDS[category] || [];
    keywords.forEach((keyword) => {
      if (normalized.includes(keyword)) scores[category] += 1;
    });
  });

  let bestCategory = 'Training';
  let bestScore = -1;

  FIXED_NEWS_CATEGORIES.forEach((category) => {
    const score = scores[category] || 0;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  });

  return bestCategory;
}

function normalizeNewsCategory(category = '', contextText = '') {
  const value = normalizeFilterValue(category)
    .replace(/&/g, 'and')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!value) return classifyCategoryFromText(contextText);

  if (value.includes('train') || value.includes('career') || value.includes('cadet')) {
    return 'Training';
  }

  if (value.includes('airline') || value.includes('airport') || value.includes('operation')) {
    return 'Airlines';
  }

  if (value.includes('tech') || value.includes('digital') || value.includes('innovation')) {
    return 'Technology';
  }

  if (value.includes('regulation') || value.includes('policy') || value.includes('faa') || value.includes('easa') || value.includes('icao') || value.includes('compliance')) {
    return 'Regulations';
  }

  return classifyCategoryFromText(`${value} ${contextText}`);
}

function applyNewsFilters(items = [], filters = {}) {
  const search = normalizeFilterValue(filters.search);
  const category = normalizeFilterValue(filters.category);

  return items.filter((item) => {
    const itemCategory = normalizeFilterValue(item.category || 'training');

    if (category && category !== 'all' && itemCategory !== category) return false;

    if (!search) return true;

    const haystack = [
      item.title,
      item.summary,
      item.excerpt,
      item.body,
      item.category,
      item.date
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

function sortNewsItems(items = [], sortBy = 'latest') {
  const list = items.slice();

  list.sort((a, b) => {
    const timeA = new Date(a.publishedAt || a.updatedAt || a.date || 0).getTime() || 0;
    const timeB = new Date(b.publishedAt || b.updatedAt || b.date || 0).getTime() || 0;

    if (sortBy === 'oldest') {
      return timeA - timeB || String(a.title || '').localeCompare(String(b.title || ''));
    }

    if (sortBy === 'title-asc') {
      return String(a.title || '').localeCompare(String(b.title || '')) || (timeB - timeA);
    }

    if (sortBy === 'title-desc') {
      return String(b.title || '').localeCompare(String(a.title || '')) || (timeB - timeA);
    }

    // latest (default)
    return timeB - timeA || String(a.title || '').localeCompare(String(b.title || ''));
  });

  return list;
}

function isRewrittenOutputValid(rewritten = {}, original = {}) {
  const title = normalizeSpaces(rewritten.title || '');
  const summary = normalizeSpaces(rewritten.summary || '');
  const excerpt = normalizeSpaces(rewritten.excerpt || '');
  const body = normalizeSpaces(rewritten.body || '');
  const bodyMinLength = Number.isFinite(rewritten.minBodyLength)
    ? rewritten.minBodyLength
    : 180;

  if (!title || !summary || !excerpt || !body) return false;
  if (summary.length < 25 || excerpt.length < 80) return false;
  if (body.length < bodyMinLength) return false;

  const rewrittenTitle = normalizeForCompare(title);
  const originalTitle = normalizeForCompare(original.title || '');
  if (!rewrittenTitle || !originalTitle) return false;

  return true;
}

function isPositiveArticle(item) {
  const text = `${item.title || ''} ${item.description || ''} ${item.content || ''}`.toLowerCase();
  return !NEGATIVE_KEYWORDS.some((keyword) => text.includes(keyword));
}

async function fetchRssItems(feedUrl) {
  let rss2jsonError = null;

  try {
    const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=80`;
    const response = await fetch(rss2jsonUrl, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      throw new Error(`rss2json failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.items)) {
      throw new Error('rss2json returned invalid payload');
    }

    if (data.items.length) {
      return data.items.map((item) => ({
        title: item.title || 'Aviation update',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || '',
        description: item.description || '',
        content: item.content || item.description || '',
        image: item.thumbnail || extractImageFromHtml(item.description || ''),
        source: getSourceName(item.link || '')
      }));
    }
  } catch (error) {
    rss2jsonError = error;
  }

  const xmlResponse = await fetch(feedUrl, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
  if (!xmlResponse.ok) {
    if (rss2jsonError) throw rss2jsonError;
    throw new Error(`rss xml fetch failed with status ${xmlResponse.status}`);
  }

  const xmlText = await xmlResponse.text();
  const itemBlocks = xmlText.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  const xmlItems = itemBlocks.map((itemXml) => {
    const title = extractTagValue(itemXml, 'title') || 'Aviation update';
    const link = extractTagValue(itemXml, 'link');
    const pubDate = extractTagValue(itemXml, 'pubDate');
    const description = extractTagValue(itemXml, 'description');
    const content = extractTagValue(itemXml, 'content:encoded') || description;
    const mediaImage = extractMediaUrlFromItem(itemXml);
    const image = mediaImage || extractImageFromHtml(description || content);

    return {
      title,
      link,
      pubDate,
      description,
      content,
      image,
      source: getSourceName(link)
    };
  }).filter((item) => item.link || item.title || item.description);

  if (xmlItems.length) {
    return xmlItems;
  }

  if (rss2jsonError) {
    throw rss2jsonError;
  }

  throw new Error('RSS feed parsing returned no items');
}

function buildFallbackSummary(text = '') {
  const sentences = String(text)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  const summary = sentences.slice(0, 2).join(' ').trim();
  return summary.slice(0, 340);
}

function buildFallbackExcerpt(text = '') {
  const cleaned = String(text).trim();
  if (!cleaned) return '';
  if (cleaned.length <= 680) return cleaned;
  return `${cleaned.slice(0, 677).trim()}...`;
}

function buildFallbackBody(text = '') {
  const cleaned = String(text).trim();
  if (!cleaned) return '';

  const sentences = splitSentences(cleaned);
  if (!sentences.length) return cleaned.slice(0, MAX_BODY_CHARS);

  const paragraphSize = 3;
  const paragraphs = [];
  for (let i = 0; i < sentences.length && paragraphs.length < 4; i += paragraphSize) {
    const paragraph = sentences.slice(i, i + paragraphSize).join(' ').trim();
    if (paragraph) paragraphs.push(paragraph);
  }

  const articleBody = paragraphs.join('\n\n');
  return articleBody.length > MAX_BODY_CHARS
    ? `${articleBody.slice(0, MAX_BODY_CHARS - 3).trim()}...`
    : articleBody;
}

function buildFullFallbackBody(text = '') {
  const cleaned = normalizeSpaces(text);
  if (!cleaned) return '';

  const sentences = splitSentences(cleaned);
  if (!sentences.length) return cleaned;

  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 3) {
    const chunk = sentences.slice(i, i + 3).join(' ').trim();
    if (chunk) paragraphs.push(chunk);
  }

  return paragraphs.join('\n\n');
}

function rewriteLocally(items, options = {}) {
  const fullBodyMode = Boolean(options.fullBodyMode);

  return items.map((item) => {
    const cleanText = stripHtml(item.content || item.description || '');
    const title = cleanEditorialTitle(item.title || 'Aviation update');
    const fallbackBody = fullBodyMode
      ? buildFullFallbackBody(item.content || cleanText)
      : buildFallbackBody(cleanText);

    const rewrittenItem = {
      title,
      summary: buildFallbackSummary(cleanText) || 'Latest positive aviation update from trusted industry sources.',
      excerpt: buildFallbackExcerpt(cleanText) || 'Latest aviation developments with practical context for aspiring and professional pilots.',
      body: fallbackBody || buildFallbackExcerpt(cleanText),
      minBodyLength: fullBodyMode ? FULL_BODY_MIN_CHARS : 180,
      category: normalizeNewsCategory('', `${item.title || ''} ${cleanText}`),
      rewriteMode: 'local-fallback',
      slug: item.slug,
      articlePath: `/news-and-resources/${item.slug}`,
      sourceLink: item.link,
      link: item.link,
      image: item.image,
      source: item.source,
      date: formatDate(item.pubDate)
    };

    if (!isRewrittenOutputValid(rewrittenItem, item)) {
      return null;
    }

    return rewrittenItem;
  }).filter(Boolean);
}

async function rewriteWithOpenAI(items, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const fullBodyMode = Boolean(options.fullBodyMode);

  const compactItems = items.map((item, idx) => ({
    id: idx,
    title: item.title,
    source: item.source,
    date: formatDate(item.pubDate),
    text: stripHtml(item.content || item.description).slice(0, fullBodyMode ? 12000 : 900)
  }));

  const systemPrompt = [
    'You are the PilotCenter.net aviation editor.',
    'Task: rewrite aviation news items into unique editorial wording.',
    'Strict rules:',
    '1) Keep only positive or neutral aviation developments.',
    '2) Exclude anything about war, crashes, accidents, fatalities, attacks, terrorism, conflict.',
    '3) Rewrite fully: do not copy original phrasing.',
    '4) Return valid JSON only, no markdown.',
    '5) For each kept item provide:',
    '- id (integer from input)',
    '- title (max 12 words, new wording)',
    '- summary (35-60 words)',
    '- excerpt (90-150 words, concise and readable)',
    fullBodyMode
      ? '- body (full rewritten article in plain text, 600-1400 words, multiple paragraphs, fully rewritten from source text)'
      : '- body (160-280 words split into 3 short paragraphs)',
    '- category (one of: Training, Airlines, Technology, Regulations)'
  ].join('\n');

  const userPrompt = `Input items JSON:\n${JSON.stringify(compactItems)}`;

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text();
    throw new Error(`OpenAI request failed (${openaiResponse.status}): ${errorText.slice(0, 500)}`);
  }

  const completion = await openaiResponse.json();
  const content = completion?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned empty content');
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('OpenAI returned non-JSON content');
  }

  const rewritten = Array.isArray(parsed.articles) ? parsed.articles : [];

  return rewritten
    .map((item) => {
      const id = Number.isInteger(item.id) ? item.id : Number.parseInt(item.id, 10);
      if (!Number.isInteger(id) || id < 0 || id >= items.length) return null;

      return {
        title: cleanEditorialTitle(item.title || ''),
        summary: String(item.summary || '').trim(),
        excerpt: String(item.excerpt || '').trim(),
        body: String(item.body || '').trim(),
        minBodyLength: fullBodyMode ? FULL_BODY_MIN_CHARS : 180,
        category: normalizeNewsCategory(item.category, `${items[id]?.title || ''} ${items[id]?.content || items[id]?.description || ''}`),
        rewriteMode: 'openai',
        original: items[id]
      };
    })
    .filter(Boolean)
    .filter((item) => isRewrittenOutputValid(item, item.original))
    .map((item) => ({
      title: item.title,
      summary: item.summary,
      excerpt: item.excerpt,
      body: item.body,
      category: item.category,
      rewriteMode: item.rewriteMode,
      slug: item.original.slug,
      articlePath: `/news-and-resources/${item.original.slug}`,
      sourceLink: item.original.link,
      link: item.original.link,
      image: item.original.image,
      source: item.original.source,
      date: formatDate(item.original.pubDate)
    }));
}

function cacheSet(link, article) {
  if (!link) return;

  if (rewriteCache.has(link)) {
    rewriteCache.delete(link);
  }

  rewriteCache.set(link, {
    ...article,
    cachedAt: Date.now()
  });

  if (rewriteCache.size > CACHE_MAX_ITEMS) {
    const oldestKey = rewriteCache.keys().next().value;
    if (oldestKey) rewriteCache.delete(oldestKey);
  }
}

function cacheGet(link) {
  if (!link || !rewriteCache.has(link)) return null;
  const value = rewriteCache.get(link);

  // refresh LRU order
  rewriteCache.delete(link);
  rewriteCache.set(link, value);

  recordTelemetry('cache:memory:hit', {
    link,
    slug: value?.slug || ''
  });

  return value;
}

function mergeNewsItems(manualPosts = [], rssPosts = []) {
  const combined = [...manualPosts, ...rssPosts];
  const bySlug = new Map();

  combined.forEach((item) => {
    const slug = normalizeSpaces(item.slug || '').toLowerCase();
    if (!slug) return;
    if (!bySlug.has(slug)) bySlug.set(slug, item);
  });

  return Array.from(bySlug.values())
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.date || 0).getTime() || 0;
      const dateB = new Date(b.publishedAt || b.date || 0).getTime() || 0;
      return dateB - dateA;
    });
}

async function buildFullArticleIfNeeded(article = null, sourceItem = null) {
  if (!article || !sourceItem) return article;

  const existingBody = normalizeSpaces(article.body || '');
  if (existingBody.length >= FULL_BODY_MIN_CHARS) return article;

  const fetchedFullText = await fetchArticleText(sourceItem.link);
  const fullContent = fetchedFullText || stripHtml(sourceItem.content || sourceItem.description || '');
  if (!fullContent || fullContent.length < 900) return article;

  const enrichedSource = {
    ...sourceItem,
    content: fullContent
  };

  try {
    const rewritten = await rewriteWithOpenAI([enrichedSource], { fullBodyMode: true });
    if (rewritten[0]) {
      cacheSet(rewritten[0].link, rewritten[0]);
      await persistArticlesToStore([rewritten[0]], 1);
      await recordTelemetry('rewrite:openai', {
        phase: 'slug-full-body',
        link: rewritten[0].link,
        slug: rewritten[0].slug || '',
        fullBodyMode: true
      });
      await recordTelemetry('rewrite:slug-full-body', {
        link: rewritten[0].link,
        slug: rewritten[0].slug || ''
      });
      return rewritten[0];
    }
  } catch {
    const localRewritten = rewriteLocally([enrichedSource], { fullBodyMode: true });
    if (localRewritten[0]) {
      cacheSet(localRewritten[0].link, localRewritten[0]);
      await persistArticlesToStore([localRewritten[0]], 1);
      await recordTelemetry('rewrite:local', {
        phase: 'slug-full-body',
        link: localRewritten[0].link,
        slug: localRewritten[0].slug || '',
        fullBodyMode: true
      });
      await recordTelemetry('rewrite:slug-full-body', {
        link: localRewritten[0].link,
        slug: localRewritten[0].slug || ''
      });
      return localRewritten[0];
    }
  }

  return article;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const adminKeyConfigured = normalizeSpaces(process.env.NEWS_ADMIN_KEY || '');
  const adminKeyProvided = getAdminKey(event);
  const isAuthorizedAdmin = adminKeyConfigured && adminKeyProvided === adminKeyConfigured;

  const adminAction = normalizeSpaces(event.queryStringParameters?.admin || '').toLowerCase();
  const runtimeHideLinks = parseCsvValue(event.queryStringParameters?.hideLink || '');
  const runtimeHideSlugs = parseCsvValue(event.queryStringParameters?.hideSlug || '');

  if (adminAction || runtimeHideLinks.length || runtimeHideSlugs.length) {
    if (!isAuthorizedAdmin) {
      return jsonResponse(401, {
        error: 'Unauthorized admin action'
      });
    }

    if (adminAction === 'reset-hidden') {
      runtimeHiddenLinks.clear();
      runtimeHiddenSlugs.clear();
    }

    if (adminAction === 'clear-cache') {
      rewriteCache.clear();
    }

    runtimeHideLinks.forEach((link) => runtimeHiddenLinks.add(link));
    runtimeHideSlugs.forEach((slug) => runtimeHiddenSlugs.add(slug));
  }

  const pageRaw = Number.parseInt(event.queryStringParameters?.page || '1', 10);
  const page = Number.isFinite(pageRaw) ? Math.max(1, pageRaw) : 1;
  const limitRaw = Number.parseInt(event.queryStringParameters?.limit || event.queryStringParameters?.pageSize || '12', 10);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 60)) : 12;
  const onlyNew = event.queryStringParameters?.onlyNew === '1';
  const slugQuery = normalizeSpaces(event.queryStringParameters?.slug || '').toLowerCase();
  const sortBy = normalizeFilterValue(event.queryStringParameters?.sort || 'latest') || 'latest';
  const searchQuery = normalizeSpaces(event.queryStringParameters?.search || '');
  const categoryQuery = normalizeSpaces(event.queryStringParameters?.category || 'all');
  const seenLinksRaw = event.queryStringParameters?.seen || '';
  const seenLinks = new Set(
    seenLinksRaw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );

  try {
    await recordTelemetry(slugQuery ? 'request:slug' : 'request:list', {
      limit,
      onlyNew,
      slugQuery
    });

    const adminState = await readAdminState();
    const hiddenFromAdmin = new Set((adminState?.hiddenSlugs || []).map((slug) => normalizeSpaces(slug).toLowerCase()));

    const curation = loadCurationConfig();
    const fetched = await fetchRssItems(RSS_FEED_URL);

    const deduped = [];
    const seen = new Set();
    for (const item of fetched) {
      const key = (item.link || '').trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }

    const positiveCandidates = deduped.filter(isPositiveArticle);
    const curatedCandidates = positiveCandidates.filter((item) => !isBlockedByCuration(item, curation));
    const neededPool = slugQuery ? 80 : Math.max(limit * 3, 24);
    const safeCandidates = curatedCandidates.slice(0, neededPool);
    const requiredImagePool = slugQuery ? Math.max(limit * 2, 24) : Math.max(limit + 8, 24);
    const imageReadySafeItems = await ensureImageReadyItems(safeCandidates, requiredImagePool);
    const safeItems = imageReadySafeItems.map((item) => ({
      ...item,
      slug: buildArticleSlug(item)
    }));

    await preloadPersistentCache(safeItems, slugQuery ? 24 : 12);

    const uncachedItems = safeItems
      .filter((item) => !cacheGet(item.link))
      .slice(0, Math.max(limit + 6, 24));
    let usedRewriteFallback = false;
    if (uncachedItems.length) {
      let rewrittenUncached = [];
      try {
        if (uncachedItems.length > 12) {
          rewrittenUncached = rewriteLocally(uncachedItems);
          usedRewriteFallback = true;
          await recordTelemetry('rewrite:local', {
            phase: 'feed-batch',
            count: uncachedItems.length,
            reason: 'batch-size-limit'
          });
        } else {
          rewrittenUncached = await rewriteWithOpenAI(uncachedItems);
          await recordTelemetry('rewrite:openai', {
            phase: 'feed-batch',
            count: uncachedItems.length,
            fullBodyMode: false
          });
        }
      } catch {
        rewrittenUncached = rewriteLocally(uncachedItems);
        usedRewriteFallback = true;
        await recordTelemetry('rewrite:local', {
          phase: 'feed-batch',
          count: uncachedItems.length,
          reason: 'openai-error'
        });
      }

      const rewrittenByLink = new Map(rewrittenUncached.map((article) => [article.link, article]));
      const missingForRewrite = uncachedItems.filter((item) => !rewrittenByLink.has(item.link));

      if (missingForRewrite.length) {
        const locallyRewrittenMissing = rewriteLocally(missingForRewrite);
        locallyRewrittenMissing.forEach((article) => rewrittenByLink.set(article.link, article));
        rewrittenUncached = Array.from(rewrittenByLink.values());
        usedRewriteFallback = true;
        await recordTelemetry('rewrite:local', {
          phase: 'feed-batch-missing-fill',
          count: missingForRewrite.length,
          reason: 'missing-output'
        });
      }

      rewrittenUncached.forEach((article) => cacheSet(article.link, article));
      await persistArticlesToStore(rewrittenUncached, slugQuery ? 24 : 12);
    }

    const allRewrittenItems = safeItems
      .map((item) => cacheGet(item.link))
      .filter(Boolean)
      .filter((item) => item.rewriteMode)
      .filter((item) => !hiddenFromAdmin.has(normalizeSpaces(item.slug || '').toLowerCase()))
      .filter((item) => !runtimeHiddenSlugs.has(normalizeSpaces(item.slug || '').toLowerCase()));

    const manualPosts = Array.isArray(adminState?.manualPosts)
      ? adminState.manualPosts.filter((item) => !hiddenFromAdmin.has(normalizeSpaces(item.slug || '').toLowerCase()))
      : [];

    const mergedItems = mergeNewsItems(manualPosts, allRewrittenItems);
    const availableCategories = FIXED_NEWS_CATEGORIES;

    const filteredItems = applyNewsFilters(mergedItems, {
      search: searchQuery,
      category: categoryQuery
    });
    const sortedItems = sortNewsItems(filteredItems, sortBy);
    const totalItems = sortedItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * limit;
    const pagedItems = sortedItems.slice(startIndex, startIndex + limit);

    if (slugQuery) {
      const matchedArticle = mergedItems.find((item) => String(item.slug || '').toLowerCase() === slugQuery);
      if (!matchedArticle) {
        return jsonResponse(404, {
          error: 'Article not found',
          slug: slugQuery
        });
      }

      const sourceForMatchedArticle = safeItems.find((item) => item.link === matchedArticle.link);
      const fullArticle = await buildFullArticleIfNeeded(matchedArticle, sourceForMatchedArticle);

      return jsonResponse(200, {
        feedUrl: RSS_FEED_URL,
        generatedAt: new Date().toISOString(),
        item: fullArticle,
        items: [fullArticle],
        stats: {
          fetched: fetched.length,
          deduped: deduped.length,
          curated: curatedCandidates.length,
          safe: safeItems.length,
          withImage: safeItems.filter((item) => item.image).length,
          rewrittenNow: uncachedItems.length,
          rewriteMode: usedRewriteFallback ? 'fallback' : 'openai',
          manualPosts: manualPosts.length,
          cacheSize: rewriteCache.size,
          returned: 1,
          hiddenRuntimeLinks: runtimeHiddenLinks.size,
          hiddenRuntimeSlugs: runtimeHiddenSlugs.size,
          strictOneTimeFlow: true
        }
      });
    }

    const latestItems = onlyNew
      ? pagedItems.filter((item) => !seenLinks.has(item.link))
      : pagedItems;

    return jsonResponse(200, {
      feedUrl: RSS_FEED_URL,
      generatedAt: new Date().toISOString(),
      items: latestItems,
      pagination: {
        page: currentPage,
        pageSize: limit,
        totalItems,
        totalPages,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages
      },
      filters: {
        search: searchQuery,
        category: categoryQuery || 'all',
        sort: sortBy
      },
      facets: {
        categories: availableCategories
      },
      stats: {
        fetched: fetched.length,
        deduped: deduped.length,
        curated: curatedCandidates.length,
        safe: safeItems.length,
        withImage: safeItems.filter((item) => item.image).length,
        rewrittenNow: uncachedItems.length,
        rewriteMode: usedRewriteFallback ? 'fallback' : 'openai',
        manualPosts: manualPosts.length,
        cacheSize: rewriteCache.size,
        returned: latestItems.length,
        totalItems,
        totalPages,
        page: currentPage,
        pageSize: limit,
        hiddenRuntimeLinks: runtimeHiddenLinks.size,
        hiddenRuntimeSlugs: runtimeHiddenSlugs.size,
        strictOneTimeFlow: true
      }
    });
  } catch (error) {
    await recordTelemetry('error', {
      message: error.message
    });

    return jsonResponse(500, {
      error: 'Failed to build curated aviation news feed',
      details: error.message
    });
  }
};
