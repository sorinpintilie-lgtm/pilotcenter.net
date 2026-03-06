const crypto = require('crypto');

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_USER_AGENT = 'PilotCenterJobsBot/1.0 (+https://pilotcenter.net)';
const DEFAULT_TIMEOUT_MS = 12000;
const PERPLEXITY_ENDPOINT = 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_DEFAULT_MODEL = 'sonar';
const PERPLEXITY_TIMEOUT_MS = 18000;
const PERPLEXITY_DEFAULT_MIN_INTERVAL_MS = 1200;
const PERPLEXITY_DEFAULT_MAX_RETRIES = 3;
const PERPLEXITY_DEFAULT_RETRY_BASE_MS = 900;

const SOURCE_REGISTRY = [
  {
    id: 'ryanair',
    name: 'Ryanair Careers',
    allowCrawler: true,
    seedUrls: ['https://careers.ryanair.com/search/?query=pilot'],
    allowedHosts: ['careers.ryanair.com'],
    maxPages: 36,
    maxDepth: 3,
    rateMs: 520
  },
  {
    id: 'wizzair',
    name: 'Wizz Air Careers',
    allowCrawler: true,
    seedUrls: ['https://careers.wizzair.com/search-jobs/?keyword=pilot'],
    allowedHosts: ['careers.wizzair.com'],
    maxPages: 36,
    maxDepth: 3,
    rateMs: 520
  },
  {
    id: 'qatar',
    name: 'Qatar Airways Careers',
    allowCrawler: true,
    seedUrls: ['https://careers.qatarairways.com/global/en/search-results?keywords=pilot'],
    allowedHosts: ['careers.qatarairways.com'],
    maxPages: 36,
    maxDepth: 3,
    rateMs: 620
  },
  {
    id: 'cae',
    name: 'CAE Careers',
    allowCrawler: true,
    seedUrls: ['https://careers.cae.com/search/?createNewAlert=false&q=pilot'],
    allowedHosts: ['careers.cae.com'],
    maxPages: 36,
    maxDepth: 3,
    rateMs: 520
  },
  {
    id: 'airbus',
    name: 'Airbus Careers',
    allowCrawler: true,
    seedUrls: ['https://jobs.airbus.com/search/?q=pilot'],
    allowedHosts: ['jobs.airbus.com'],
    maxPages: 32,
    maxDepth: 3,
    rateMs: 580
  },
  {
    id: 'boeing',
    name: 'Boeing Careers',
    allowCrawler: true,
    seedUrls: ['https://careers.boeing.com/search-jobs?keyword=pilot'],
    allowedHosts: ['careers.boeing.com'],
    maxPages: 32,
    maxDepth: 3,
    rateMs: 580
  },
  {
    id: 'lufthansa',
    name: 'Lufthansa Group Careers',
    allowCrawler: true,
    seedUrls: ['https://careers.lufthansagroup.com/en/search?query=pilot'],
    allowedHosts: ['careers.lufthansagroup.com'],
    maxPages: 28,
    maxDepth: 3,
    rateMs: 620
  },
  {
    id: 'easyjet',
    name: 'easyJet Careers',
    allowCrawler: true,
    seedUrls: ['https://careers.easyjet.com/search-jobs/?search=pilot'],
    allowedHosts: ['careers.easyjet.com'],
    maxPages: 28,
    maxDepth: 3,
    rateMs: 560
  },
  {
    id: 'delta',
    name: 'Delta Careers',
    allowCrawler: true,
    seedUrls: ['https://careers.delta.com/search-jobs/?keyword=pilot'],
    allowedHosts: ['careers.delta.com'],
    maxPages: 28,
    maxDepth: 3,
    rateMs: 620
  },
  {
    id: 'united',
    name: 'United Careers',
    allowCrawler: true,
    seedUrls: ['https://careers.united.com/us/en/search-results?keywords=pilot'],
    allowedHosts: ['careers.united.com'],
    maxPages: 28,
    maxDepth: 3,
    rateMs: 620
  },
  {
    id: 'american-airlines',
    name: 'American Airlines Careers',
    allowCrawler: true,
    seedUrls: ['https://jobs.aa.com/search/?q=pilot'],
    allowedHosts: ['jobs.aa.com'],
    maxPages: 28,
    maxDepth: 3,
    rateMs: 620
  },
  {
    id: 'aviation-jobsearch',
    name: 'Aviation Job Search',
    allowCrawler: true,
    seedUrls: ['https://www.aviationjobsearch.com/jobs/pilot'],
    allowedHosts: ['www.aviationjobsearch.com'],
    maxPages: 42,
    maxDepth: 3,
    rateMs: 700
  },
  {
    id: 'avjobs',
    name: 'Avjobs',
    allowCrawler: true,
    seedUrls: ['https://www.avjobs.com/jobs/pilot-jobs.asp'],
    allowedHosts: ['www.avjobs.com'],
    maxPages: 42,
    maxDepth: 3,
    rateMs: 700
  }
];

let jobsStorePromise = null;
const robotsCache = new Map();
const LOG_LIMIT = 480;
const memoryBlobData = new Map();
let perplexityLastRequestAt = 0;
let jobsStoreBackend = 'uninitialized';

function createMemoryStore() {
  return {
    async get(key, options = {}) {
      if (!memoryBlobData.has(key)) return null;
      const value = memoryBlobData.get(key);
      if (options?.type === 'json') {
        return JSON.parse(JSON.stringify(value));
      }
      return value;
    },
    async set(key, value) {
      memoryBlobData.set(key, value);
    },
    async delete(key) {
      memoryBlobData.delete(key);
    },
    async list(options = {}) {
      const prefix = String(options?.prefix || '');
      const limitRaw = Number(options?.limit || 1000);
      const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 1000;
      const cursorRaw = Number(options?.cursor || 0);
      const cursor = Number.isFinite(cursorRaw) && cursorRaw >= 0 ? Math.floor(cursorRaw) : 0;

      const keys = Array.from(memoryBlobData.keys())
        .filter((key) => !prefix || String(key).startsWith(prefix))
        .sort((a, b) => String(a).localeCompare(String(b)));

      const slice = keys.slice(cursor, cursor + limit);
      const nextIndex = cursor + slice.length;
      const hasMore = nextIndex < keys.length;

      return {
        blobs: slice.map((key) => ({ key })),
        hasMore,
        cursor: hasMore ? String(nextIndex) : null
      };
    }
  };
}

async function withJobsStore() {
  if (!jobsStorePromise) {
    jobsStorePromise = (async () => {
      const manualSiteId = normalizeSpaces(
        process.env.NETLIFY_SITE_ID
          || process.env.SITE_ID
          || ''
      );
      const manualToken = normalizeSpaces(
        process.env.NETLIFY_API_TOKEN
          || process.env.NETLIFY_AUTH_TOKEN
          || process.env.NETLIFY_BLOBS_TOKEN
          || ''
      );

      const blobOptions = (manualSiteId && manualToken)
        ? { siteID: manualSiteId, token: manualToken }
        : undefined;

      try {
        const { getStore } = require('@netlify/blobs');
        jobsStoreBackend = 'netlify-blobs';
        return getStore('pilot-jobs', blobOptions);
      } catch (error) {
        const allowMemoryFallback = normalizeSpaces(process.env.PILOT_JOBS_ALLOW_MEMORY_FALLBACK || '') === '1';
        if (!allowMemoryFallback) {
          throw new Error(
            [
              'Netlify Blobs is not configured for pilot-jobs.',
              'Set NETLIFY_SITE_ID and NETLIFY_API_TOKEN (or run inside a properly linked Netlify runtime).',
              `Original error: ${error.message}`
            ].join(' ')
          );
        }
        jobsStoreBackend = 'memory-fallback';
        return createMemoryStore();
      }
    })();
  }

  return jobsStorePromise;
}

function normalizeSpaces(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function clampNumber(value, min, max, fallback = min) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

function decodeHtmlEntities(value = '') {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ');
}

function stripTags(value = '') {
  return normalizeSpaces(decodeHtmlEntities(String(value || '').replace(/<[^>]+>/g, ' ')));
}

function clampWords(text = '', maxWords = 44) {
  const words = normalizeSpaces(text).split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(' ').trim();
}

function slugify(value = '') {
  const normalized = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'pilot-job';
}

function shortHash(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 12);
}

function toIsoDateMaybe(value = '') {
  const input = normalizeSpaces(value);
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function canonicalizeUrl(input = '') {
  try {
    const parsed = new URL(normalizeSpaces(input));
    if (!/^https?:$/i.test(parsed.protocol)) return '';

    parsed.hash = '';

    const blockedParams = new Set([
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
      'mc_eid',
      'mc_cid'
    ]);

    const params = [];
    for (const [key, value] of parsed.searchParams.entries()) {
      if (blockedParams.has(String(key || '').toLowerCase())) continue;
      params.push([key, value]);
    }
    params.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

    parsed.search = '';
    params.forEach(([key, value]) => parsed.searchParams.append(key, value));

    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    }

    return parsed.toString();
  } catch {
    return '';
  }
}

function getHost(input = '') {
  try {
    return new URL(input).host.toLowerCase();
  } catch {
    return '';
  }
}

function getPathname(input = '') {
  try {
    return new URL(input).pathname || '/';
  } catch {
    return '/';
  }
}

function isAviationRelevant(text = '') {
  const normalized = normalizeSpaces(text).toLowerCase();
  if (!normalized) return false;

  const keywords = [
    'pilot',
    'first officer',
    'captain',
    'flight instructor',
    'aviation',
    'airline',
    'aircraft',
    'helicopter',
    'a&p',
    'maintenance',
    'dispatcher',
    'airport',
    'cabin crew',
    'ground operations'
  ];

  return keywords.some((keyword) => normalized.includes(keyword));
}

function inferRoleFamily(job = {}) {
  const haystack = normalizeSpaces(`${job.title || ''} ${job.summary || ''} ${job.description || ''}`).toLowerCase();
  if (!haystack) return 'Other Aviation';

  if (haystack.includes('first officer') || haystack.includes('co-pilot')) return 'First Officer';
  if (haystack.includes('captain')) return 'Captain';
  if (haystack.includes('flight instructor') || haystack.includes('cfi')) return 'Flight Instructor';
  if (haystack.includes('helicopter')) return 'Helicopter Pilot';
  if (haystack.includes('maintenance') || haystack.includes('a&p')) return 'Aircraft Maintenance';
  if (haystack.includes('dispatcher')) return 'Flight Dispatch';
  if (haystack.includes('cabin crew')) return 'Cabin Crew';
  if (haystack.includes('ground')) return 'Ground Operations';
  if (haystack.includes('pilot')) return 'Pilot';
  return 'Other Aviation';
}

function inferCountry(location = '') {
  const value = normalizeSpaces(location);
  if (!value) return 'Unknown';
  const parts = value.split(',').map((item) => normalizeSpaces(item)).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : 'Unknown';
}

function firstMatch(text = '', regex) {
  const match = String(text || '').match(regex);
  return match ? normalizeSpaces(stripTags(match[1] || '')) : '';
}

function parseJsonSafely(raw = '') {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractFirstJsonObject(raw = '') {
  const input = String(raw || '').trim();
  if (!input) return null;

  const direct = parseJsonSafely(input);
  if (direct && typeof direct === 'object') return direct;

  const fenced = input.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    const fromFence = parseJsonSafely(String(fenced[1]).trim());
    if (fromFence && typeof fromFence === 'object') return fromFence;
  }

  const firstBrace = input.indexOf('{');
  const lastBrace = input.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = input.slice(firstBrace, lastBrace + 1);
    const fromSlice = parseJsonSafely(candidate);
    if (fromSlice && typeof fromSlice === 'object') return fromSlice;
  }

  return null;
}

function getPerplexityConfig() {
  const apiKey = normalizeSpaces(process.env.PERPLEXITY_API_KEY || '');
  const model = normalizeSpaces(process.env.PERPLEXITY_MODEL || PERPLEXITY_DEFAULT_MODEL) || PERPLEXITY_DEFAULT_MODEL;
  const minConfidence = clampNumber(process.env.PILOT_JOBS_PERPLEXITY_MIN_CONFIDENCE, 0, 1, 0.72);
  const minIntervalMs = clampNumber(
    process.env.PILOT_JOBS_PERPLEXITY_MIN_INTERVAL_MS,
    250,
    60000,
    PERPLEXITY_DEFAULT_MIN_INTERVAL_MS
  );
  const maxRetries = Math.max(0, Math.floor(clampNumber(
    process.env.PILOT_JOBS_PERPLEXITY_MAX_RETRIES,
    0,
    8,
    PERPLEXITY_DEFAULT_MAX_RETRIES
  )));
  const retryBaseMs = clampNumber(
    process.env.PILOT_JOBS_PERPLEXITY_RETRY_BASE_MS,
    300,
    20000,
    PERPLEXITY_DEFAULT_RETRY_BASE_MS
  );
  const strictMode = normalizeSpaces(process.env.PILOT_JOBS_PERPLEXITY_STRICT || '1') !== '0';

  return {
    enabled: Boolean(apiKey),
    apiKey,
    model,
    minConfidence,
    minIntervalMs,
    maxRetries,
    retryBaseMs,
    strictMode
  };
}

function boolFromUnknown(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  const normalized = normalizeSpaces(value).toLowerCase();
  if (!normalized) return fallback;
  if (['true', '1', 'yes', 'real', 'valid'].includes(normalized)) return true;
  if (['false', '0', 'no', 'not-real', 'invalid'].includes(normalized)) return false;
  return fallback;
}

function extractPerplexityMessageContent(payload = {}) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') return String(item.text || item.content || '');
        return '';
      })
      .join('\n')
      .trim();
  }
  return '';
}

function sanitizePerplexityReview(payload = {}) {
  if (!payload || typeof payload !== 'object') return null;

  const isJobPage = boolFromUnknown(payload.isJobPage, true);
  const title = normalizeSpaces(payload.title || payload.jobTitle || payload.positionTitle || '');
  const company = normalizeSpaces(payload.company || payload.employer || payload.hiringOrganization || '');
  const location = normalizeSpaces(payload.location || payload.jobLocation || '');
  const employmentType = normalizeSpaces(payload.employmentType || payload.type || '');
  const postedAt = toIsoDateMaybe(payload.postedAt || payload.datePosted || payload.publishedAt || '');
  const description = normalizeSpaces(stripTags(payload.description || payload.details || ''));
  const summary = clampWords(stripTags(payload.summary || payload.shortSummary || description), 42);
  const sourceUrl = canonicalizeUrl(payload.sourceUrl || payload.jobUrl || payload.url || '');
  const applyUrl = canonicalizeUrl(payload.applyUrl || payload.applicationUrl || payload.sourceUrl || payload.url || '');
  const sourceJobId = normalizeSpaces(payload.sourceJobId || payload.jobId || payload.referenceId || '');
  const reason = normalizeSpaces(payload.reason || payload.notes || payload.rationale || '');
  const confidence = clampNumber(payload.confidence, 0, 1, 0);
  const isRealAviationJob = boolFromUnknown(payload.isRealAviationJob, confidence >= 0.7);

  return {
    isJobPage,
    title,
    company,
    location,
    employmentType,
    postedAt,
    description,
    summary,
    sourceUrl,
    applyUrl,
    sourceJobId,
    reason,
    confidence,
    isRealAviationJob
  };
}

function extractPageEvidence(html = '') {
  const stripped = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  return clampWords(stripTags(stripped), 220);
}

function extractPageTitle(html = '') {
  return firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
    || firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
    || '';
}

async function waitForPerplexityWindow(config = {}, forceDelayMs = 0) {
  const minIntervalMs = clampNumber(config.minIntervalMs, 250, 60000, PERPLEXITY_DEFAULT_MIN_INTERVAL_MS);
  const elapsed = Date.now() - perplexityLastRequestAt;
  const waitMs = Math.max(Number(forceDelayMs || 0), minIntervalMs - elapsed);
  if (waitMs > 0) await sleep(waitMs);
}

function calcPerplexityRetryDelayMs(config = {}, attempt = 0, retryAfterHeader = '') {
  const parsedRetryAfterSec = Number(retryAfterHeader);
  if (Number.isFinite(parsedRetryAfterSec) && parsedRetryAfterSec > 0) {
    return clampNumber(parsedRetryAfterSec * 1000, 250, 120000, 1000);
  }

  const base = clampNumber(config.retryBaseMs, 300, 20000, PERPLEXITY_DEFAULT_RETRY_BASE_MS);
  const exp = Math.pow(2, Math.max(0, attempt));
  const jitter = Math.floor(Math.random() * 250);
  return clampNumber(base * exp + jitter, 300, 120000, base + jitter);
}

function buildPerplexityCandidateFromPage(review = {}, pageUrl = '', sourceName = '') {
  const sourceUrl = canonicalizeUrl(review.sourceUrl || pageUrl);
  const applyUrl = canonicalizeUrl(review.applyUrl || sourceUrl || pageUrl);

  return {
    title: normalizeSpaces(review.title || ''),
    company: normalizeSpaces(review.company || sourceName || ''),
    location: normalizeSpaces(review.location || ''),
    description: normalizeSpaces(review.description || ''),
    summary: normalizeSpaces(review.summary || ''),
    postedAt: toIsoDateMaybe(review.postedAt || ''),
    sourceUrl,
    applyUrl,
    sourceJobId: normalizeSpaces(review.sourceJobId || ''),
    hasExplicitSourceJobId: Boolean(normalizeSpaces(review.sourceJobId || '')),
    employmentType: normalizeSpaces(review.employmentType || ''),
    extractionMethod: 'perplexity-curated'
  };
}

function formatLogMetaPreview(meta = {}) {
  if (!meta || typeof meta !== 'object') return '';

  const parts = [];
  const numericFields = [
    ['pages', meta.pagesFetched],
    ['discovered', meta.discoveredUrls],
    ['extracted', meta.jobsExtracted],
    ['accepted', meta.jobsAccepted],
    ['rejected', meta.jobsRejected],
    ['perplexity reviewed', meta.perplexityReviewed],
    ['perplexity accepted', meta.perplexityAccepted],
    ['perplexity rejected', meta.perplexityRejected],
    ['perplexity errors', meta.perplexityErrors]
  ];

  numericFields.forEach(([label, value]) => {
    if (Number.isFinite(Number(value))) parts.push(`${label}: ${Number(value)}`);
  });

  if (meta.storeBackend) parts.push(`store: ${normalizeSpaces(meta.storeBackend)}`);
  if (meta.perplexityModel) parts.push(`model: ${normalizeSpaces(meta.perplexityModel)}`);
  if (meta.perplexityMinIntervalMs) parts.push(`min interval: ${Number(meta.perplexityMinIntervalMs)}ms`);

  return parts.join(' • ');
}

function buildReadableLogLine(entry = {}) {
  const at = normalizeSpaces(entry.at || '');
  const level = normalizeSpaces(entry.level || 'info').toUpperCase();
  const sourceName = normalizeSpaces(entry.sourceName || '');
  const message = normalizeSpaces(entry.message || 'No details provided');
  const preview = formatLogMetaPreview(entry.meta || {});

  return [
    at ? `[${at}]` : '',
    `[${level}]`,
    sourceName ? `[${sourceName}]` : '',
    message,
    preview ? `| ${preview}` : ''
  ].filter(Boolean).join(' ');
}

function enrichLogEntry(entry = {}) {
  const normalized = normalizeCrawlerLogEntry(entry);
  const readable = buildReadableLogLine(normalized);
  return {
    ...normalized,
    readable
  };
}

async function reviewJobWithPerplexity(options = {}) {
  const config = getPerplexityConfig();
  if (!config.enabled) {
    return {
      ok: false,
      error: 'perplexity-not-configured'
    };
  }

  const promptPayload = {
    sourceName: normalizeSpaces(options?.source?.name || ''),
    sourceId: normalizeSpaces(options?.source?.id || ''),
    pageUrl: canonicalizeUrl(options?.pageUrl || options?.job?.sourceUrl || ''),
    pageTitle: normalizeSpaces(options?.pageTitle || ''),
    sourceUrl: canonicalizeUrl(options?.job?.sourceUrl || options?.pageUrl || ''),
    applyUrl: canonicalizeUrl(options?.job?.applyUrl || options?.pageUrl || ''),
    title: normalizeSpaces(options?.job?.title || ''),
    company: normalizeSpaces(options?.job?.company || ''),
    location: normalizeSpaces(options?.job?.location || ''),
    employmentType: normalizeSpaces(options?.job?.employmentType || ''),
    postedAt: normalizeSpaces(options?.job?.postedAt || ''),
    summary: normalizeSpaces(options?.job?.summary || ''),
    description: normalizeSpaces(options?.job?.description || ''),
    pageEvidence: normalizeSpaces(options?.pageEvidence || '')
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PERPLEXITY_TIMEOUT_MS);

  try {
    for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      await waitForPerplexityWindow(config);

      let response = null;
      try {
        // eslint-disable-next-line no-await-in-loop
        response = await fetch(PERPLEXITY_ENDPOINT, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: config.model,
            temperature: 0,
            max_tokens: 1100,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: [
                  'You are an aviation jobs curator.',
                  'Task: inspect one crawled careers page and decide if it is a concrete aviation job posting.',
                  'Return ONLY JSON with this exact schema:',
                  '{"isJobPage":boolean,"isRealAviationJob":boolean,"confidence":number,"title":string,"company":string,"location":string,"employmentType":string,"postedAt":string,"summary":string,"description":string,"sourceUrl":string,"applyUrl":string,"sourceJobId":string,"reason":string}',
                  'Rules:',
                  '- confidence must be between 0 and 1.',
                  '- isJobPage is true only if the page is a single job posting.',
                  '- isRealAviationJob is true only if role is truly in aviation.',
                  '- keep summary concise and factual.',
                  '- do not invent fields; use empty strings if unavailable.'
                ].join(' ')
              },
              {
                role: 'user',
                content: JSON.stringify(promptPayload)
              }
            ]
          })
        });
        perplexityLastRequestAt = Date.now();
      } catch {
        if (attempt < config.maxRetries) {
          const retryDelay = calcPerplexityRetryDelayMs(config, attempt);
          // eslint-disable-next-line no-await-in-loop
          await sleep(retryDelay);
          continue;
        }
        return {
          ok: false,
          error: 'perplexity-request-failed',
          attempts: attempt + 1
        };
      }

      const isRetryableStatus = response.status === 429 || response.status >= 500;
      if (!response.ok && isRetryableStatus && attempt < config.maxRetries) {
        const retryDelay = calcPerplexityRetryDelayMs(config, attempt, response.headers.get('retry-after') || '');
        // eslint-disable-next-line no-await-in-loop
        await sleep(retryDelay);
        continue;
      }

      if (!response.ok) {
        return {
          ok: false,
          error: `perplexity-http-${response.status}`,
          attempts: attempt + 1
        };
      }

      const payload = await response.json().catch(() => null);
      const content = extractPerplexityMessageContent(payload);
      const parsed = extractFirstJsonObject(content);
      const review = sanitizePerplexityReview(parsed);

      if (!review) {
        if (attempt < config.maxRetries) {
          const retryDelay = calcPerplexityRetryDelayMs(config, attempt);
          // eslint-disable-next-line no-await-in-loop
          await sleep(retryDelay);
          continue;
        }

        return {
          ok: false,
          error: 'perplexity-invalid-json',
          attempts: attempt + 1
        };
      }

      return {
        ok: true,
        ...review,
        model: config.model,
        attempts: attempt + 1
      };
    }

    return {
      ok: false,
      error: 'perplexity-exhausted-retries',
      attempts: config.maxRetries + 1
    };
  } catch {
    return {
      ok: false,
      error: 'perplexity-request-failed',
      attempts: 1
    };
  } finally {
    clearTimeout(timer);
  }
}

function shouldReviewWithPerplexity(job = {}, validation = {}, state = {}) {
  if (!state.enabled || state.remaining <= 0) return false;

  const method = normalizeSpaces(job.extractionMethod || '').toLowerCase();
  const hasThinDetails = !normalizeSpaces(job.description)
    || normalizeSpaces(job.description).length < 120
    || normalizeSpaces(job.company).toLowerCase() === 'unknown company'
    || normalizeSpaces(job.location).toLowerCase() === 'location not specified';

  const reviewableIssues = new Set([
    'generic-page-title',
    'not-aviation-relevant',
    'noisy-summary',
    'fallback-low-confidence',
    'fallback-non-detail-url'
  ]);
  const hasReviewableIssues = Array.isArray(validation?.issues)
    && validation.issues.some((issue) => reviewableIssues.has(issue));

  return method.includes('fallback') || hasThinDetails || hasReviewableIssues || !validation.valid;
}

function applyPerplexityEnrichment(job = {}, review = {}) {
  const title = normalizeSpaces(review.title || job.title || 'Aviation role');
  const company = normalizeSpaces(review.company || job.company || 'Unknown company');
  const location = normalizeSpaces(review.location || job.location || 'Location not specified');
  const employmentType = normalizeSpaces(review.employmentType || job.employmentType || '');
  const description = normalizeSpaces(review.description || job.description || '');
  const summary = normalizeSpaces(review.summary || job.summary || clampWords(description, 42));
  const postedAt = toIsoDateMaybe(review.postedAt || '') || job.postedAt;
  const extractionMethodBase = normalizeSpaces(job.extractionMethod || 'fallback') || 'fallback';
  const extractionMethod = extractionMethodBase.includes('perplexity')
    ? extractionMethodBase
    : `${extractionMethodBase}+perplexity`;

  return {
    ...job,
    title,
    company,
    location,
    country: inferCountry(location),
    roleFamily: inferRoleFamily({ title, summary, description }),
    employmentType,
    description,
    summary,
    postedAt,
    extractionMethod,
    perplexityReviewedAt: new Date().toISOString(),
    perplexityConfidence: clampNumber(review.confidence, 0, 1, 0),
    perplexityVerdict: review.isRealAviationJob ? 'real-job' : 'not-real-job',
    perplexityReason: normalizeSpaces(review.reason || ''),
    perplexityModel: normalizeSpaces(review.model || '')
  };
}

function computeQualityScore(validationScore = 0, review = null) {
  let score = clampNumber(validationScore, 0, 100, 0);

  if (review && typeof review === 'object') {
    const confidence = clampNumber(review.confidence, 0, 1, 0);
    if (review.isRealAviationJob) {
      score += Math.round(confidence * 12);
    } else {
      score -= Math.round((1 - confidence) * 24 + 10);
    }
  }

  return clampNumber(score, 0, 100, 0);
}

function extractJsonLdObjects(html = '') {
  const blocks = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = regex.exec(html);

  while (match) {
    const parsed = parseJsonSafely(String(match[1] || '').trim());
    if (parsed) blocks.push(parsed);
    match = regex.exec(html);
  }

  return blocks;
}

function collectJobPostingNodes(node, output = []) {
  if (!node) return output;

  if (Array.isArray(node)) {
    node.forEach((item) => collectJobPostingNodes(item, output));
    return output;
  }

  if (typeof node !== 'object') return output;

  const nodeType = node['@type'];
  const asList = Array.isArray(nodeType) ? nodeType : [nodeType];
  const hasJobPostingType = asList.some((item) => String(item || '').toLowerCase() === 'jobposting');
  if (hasJobPostingType) output.push(node);

  Object.values(node).forEach((value) => {
    if (value && typeof value === 'object') collectJobPostingNodes(value, output);
  });

  return output;
}

function extractJobLocation(node = {}) {
  const jobLocation = node.jobLocation;
  if (!jobLocation) return '';

  const values = Array.isArray(jobLocation) ? jobLocation : [jobLocation];
  const parsed = values
    .map((item) => {
      const address = item?.address || {};
      const parts = [
        address.addressLocality,
        address.addressRegion,
        address.addressCountry
      ]
        .map((value) => normalizeSpaces(value))
        .filter(Boolean);
      return parts.join(', ');
    })
    .filter(Boolean);

  return normalizeSpaces(parsed[0] || '');
}

function extractCandidatesFromJsonLd(html = '', pageUrl = '', sourceName = '') {
  const objects = extractJsonLdObjects(html);
  const postings = collectJobPostingNodes(objects, []);

  return postings.map((item) => {
    const identifierValue = typeof item.identifier === 'object'
      ? normalizeSpaces(item.identifier.value || item.identifier.name || '')
      : normalizeSpaces(item.identifier || '');

    return {
      title: normalizeSpaces(item.title || item.name || ''),
      company: normalizeSpaces(item?.hiringOrganization?.name || sourceName),
      location: extractJobLocation(item),
      description: stripTags(item.description || ''),
      summary: clampWords(stripTags(item.description || ''), 42),
      postedAt: toIsoDateMaybe(item.datePosted || item.dateCreated || ''),
      sourceUrl: canonicalizeUrl(item.url || pageUrl),
      applyUrl: canonicalizeUrl(item.url || pageUrl),
      sourceJobId: identifierValue,
      hasExplicitSourceJobId: Boolean(identifierValue),
      extractionMethod: 'jsonld'
    };
  });
}

function extractCandidatesFallback(html = '', pageUrl = '', sourceName = '') {
  const title = firstMatch(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
    || firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || firstMatch(html, /<p[^>]*>([\s\S]{40,360}?)<\/p>/i);
  const location = firstMatch(html, /(?:location|based in|city)\s*[:\-]\s*([^<\n\r]{3,120})/i)
    || '';

  if (!title) return [];

  return [{
    title,
    company: sourceName,
    location,
    description: stripTags(description || ''),
    summary: clampWords(stripTags(description || ''), 42),
    postedAt: '',
    sourceUrl: canonicalizeUrl(pageUrl),
    applyUrl: canonicalizeUrl(pageUrl),
    sourceJobId: '',
    hasExplicitSourceJobId: false,
    extractionMethod: 'fallback'
  }];
}

function extractLinks(html = '', pageUrl = '', allowedHosts = []) {
  const links = [];
  const allowed = new Set((allowedHosts || []).map((item) => normalizeSpaces(item).toLowerCase()).filter(Boolean));
  const regex = /href=["']([^"'#]+)["']/gi;
  let match = regex.exec(html);

  while (match) {
    const rawHref = normalizeSpaces(match[1] || '');
    if (!rawHref || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('javascript:')) {
      match = regex.exec(html);
      continue;
    }

    try {
      const resolved = canonicalizeUrl(new URL(rawHref, pageUrl).toString());
      if (!resolved) {
        match = regex.exec(html);
        continue;
      }
      const host = getHost(resolved);
      if (allowed.size && !allowed.has(host)) {
        match = regex.exec(html);
        continue;
      }
      links.push(resolved);
    } catch {
      // ignore malformed links
    }

    match = regex.exec(html);
  }

  return Array.from(new Set(links));
}

function shouldFollowLink(url = '') {
  const value = normalizeSpaces(url).toLowerCase();
  if (!value) return false;

  return /(job|jobs|career|careers|vacanc|opening|position|pilot|flight|aviation|recruit)/i.test(value);
}

function isLikelyJobDetailUrl(url = '') {
  const value = normalizeSpaces(url).toLowerCase();
  if (!value) return false;

  return /(\/job\/|\/jobs\/[^/?#]{4,}|\/career\/[^/?#]{4,}|\/vacanc(?:y|ies)\/|gh_jid=|lever\.co\/.*\/[^/?#]{6,}|smartrecruiters\.com\/[^/?#]+\/[^/?#]+)/i.test(value);
}

function isGenericListingTitle(title = '') {
  const value = normalizeSpaces(title).toLowerCase();
  if (!value) return true;

  return /^(search|homepage|find jobs|job search|careers at|careers|jobs|pilot jobs|become a pilot|pilots)$/.test(value)
    || /(navigation page|search results|find jobs -|careers at )/.test(value);
}

function looksNoisySummary(summary = '') {
  const value = normalizeSpaces(summary);
  if (!value) return true;

  const semicolonCount = (value.match(/;/g) || []).length;
  const cssSignals = /(display\s*:|position\s*:|align-items\s*:|justify-content\s*:|wp-lightbox|background\s*:|font-size\s*:|margin\s*:|padding\s*:)/i;

  return semicolonCount >= 3 || cssSignals.test(value);
}

function buildNormalizedJob(candidate = {}, source = {}, runAt = '') {
  const title = normalizeSpaces(candidate.title || 'Aviation role');
  const company = normalizeSpaces(candidate.company || source.name || 'Unknown company');
  const location = normalizeSpaces(candidate.location || 'Location not specified');
  const sourceUrl = canonicalizeUrl(candidate.sourceUrl || candidate.applyUrl || '');
  const applyUrl = canonicalizeUrl(candidate.applyUrl || sourceUrl);
  const sourceJobId = normalizeSpaces(candidate.sourceJobId || shortHash(`${sourceUrl}|${title}|${company}|${location}`));
  const jobId = `${source.id}-${sourceJobId}`.toLowerCase();
  const description = normalizeSpaces(candidate.description || '');
  const summaryCandidate = normalizeSpaces(candidate.summary || clampWords(description || `${title} at ${company}`, 42));
  const summary = looksNoisySummary(summaryCandidate)
    ? `${title} opportunity at ${company}.`
    : summaryCandidate;
  const slugBase = slugify(`${title}-${company}-${location}`).slice(0, 84);
  const slug = `${slugBase}-${shortHash(jobId).slice(0, 6)}`;
  const postedAt = toIsoDateMaybe(candidate.postedAt || '') || runAt;
  const firstSeenAt = runAt;
  const expiresAt = new Date(new Date(firstSeenAt).getTime() + ONE_MONTH_MS).toISOString();
  const roleFamily = inferRoleFamily({ title, summary, description });
  const country = inferCountry(location);

  return {
    id: jobId,
    slug,
    title,
    company,
    location,
    country,
    roleFamily,
    employmentType: normalizeSpaces(candidate.employmentType || ''),
    sourceName: source.name,
    sourceId: source.id,
    sourceJobId,
    sourceUrl,
    applyUrl,
    summary,
    description,
    extractionMethod: normalizeSpaces(candidate.extractionMethod || 'fallback') || 'fallback',
    hasExplicitSourceJobId: Boolean(candidate.hasExplicitSourceJobId),
    postedAt,
    firstSeenAt,
    lastSeenAt: runAt,
    expiresAt,
    status: 'active',
    qualityScore: 100,
    updatedAt: runAt,
    createdAt: runAt,
    jobPath: `/latest-pilot-jobs/${slug}`
  };
}

function validateJob(job = {}) {
  const issues = [];

  if (!normalizeSpaces(job.title)) issues.push('missing-title');
  if (!normalizeSpaces(job.company)) issues.push('missing-company');
  if (!normalizeSpaces(job.location)) issues.push('missing-location');
  if (!normalizeSpaces(job.sourceUrl)) issues.push('missing-source-url');
  if (!normalizeSpaces(job.applyUrl)) issues.push('missing-apply-url');

  if (job.sourceUrl && !canonicalizeUrl(job.sourceUrl)) issues.push('invalid-source-url');
  if (job.applyUrl && !canonicalizeUrl(job.applyUrl)) issues.push('invalid-apply-url');
  if (!isAviationRelevant(`${job.title} ${job.summary} ${job.description}`)) issues.push('not-aviation-relevant');
  if (isGenericListingTitle(job.title)) issues.push('generic-page-title');
  if (looksNoisySummary(job.summary)) issues.push('noisy-summary');

  if (normalizeSpaces(job.extractionMethod || '').toLowerCase() === 'fallback') {
    if (!isLikelyJobDetailUrl(job.sourceUrl || '')) issues.push('fallback-non-detail-url');
    const hasDate = !Number.isNaN(new Date(job.postedAt || '').getTime());
    if (!job.hasExplicitSourceJobId && !hasDate) issues.push('fallback-low-confidence');
  }

  const score = Math.max(0, 100 - (issues.length * 16));

  return {
    valid: !issues.some((item) => item.startsWith('missing-')
      || item.includes('invalid-')
      || item.startsWith('generic-')
      || item.startsWith('fallback-')
      || item === 'noisy-summary'),
    issues,
    score
  };
}

async function fetchHtml(url = '', sourceId = '') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': DEFAULT_USER_AGENT,
        'X-Source-Id': sourceId
      }
    });

    if (!response.ok) return '';
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) return '';

    return response.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url = '', sourceId = '') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/plain,text/*;q=0.9,*/*;q=0.1',
        'User-Agent': DEFAULT_USER_AGENT,
        'X-Source-Id': sourceId
      }
    });

    if (!response.ok) return '';
    return response.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function parseRobotsTxt(content = '') {
  const groups = new Map();
  let activeAgents = [];

  String(content || '').split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.split('#')[0].trim();
    if (!line) return;

    const sepIndex = line.indexOf(':');
    if (sepIndex === -1) return;

    const key = line.slice(0, sepIndex).trim().toLowerCase();
    const value = line.slice(sepIndex + 1).trim();
    if (!key) return;

    if (key === 'user-agent') {
      const agent = value.toLowerCase();
      activeAgents = [agent];
      if (!groups.has(agent)) groups.set(agent, []);
      return;
    }

    if ((key === 'allow' || key === 'disallow') && activeAgents.length) {
      activeAgents.forEach((agent) => {
        if (!groups.has(agent)) groups.set(agent, []);
        groups.get(agent).push({
          type: key,
          path: value
        });
      });
    }
  });

  return groups;
}

async function getRobotsForHost(host = '') {
  const key = normalizeSpaces(host).toLowerCase();
  if (!key) return { rules: null, fetchedAt: Date.now(), available: false };

  const cached = robotsCache.get(key);
  const maxAgeMs = 6 * 60 * 60 * 1000;
  if (cached && Date.now() - cached.fetchedAt < maxAgeMs) return cached;

  const robotsUrl = `https://${key}/robots.txt`;
  const body = await fetchText(robotsUrl, 'robots');
  const result = {
    rules: body ? parseRobotsTxt(body) : null,
    fetchedAt: Date.now(),
    available: Boolean(body)
  };

  robotsCache.set(key, result);
  return result;
}

function matchRobotsRule(pathname = '/', rules = []) {
  let matched = null;

  rules.forEach((rule) => {
    const rulePath = String(rule.path || '').trim();
    if (!rulePath) return;
    if (rulePath === '/') {
      if (!matched || rulePath.length > String(matched.path || '').length) {
        matched = { ...rule, path: rulePath };
      }
      return;
    }
    if (!pathname.startsWith(rulePath)) return;
    if (!matched || rulePath.length > String(matched.path || '').length) {
      matched = { ...rule, path: rulePath };
    }
  });

  return matched;
}

async function isRobotsAllowed(url = '') {
  const host = getHost(url);
  if (!host) return true;
  const pathname = getPathname(url);

  const robots = await getRobotsForHost(host);
  if (!robots.available || !robots.rules) return true;

  const uaRules = robots.rules.get('pilotcenterjobsbot') || robots.rules.get('*') || [];
  if (!uaRules.length) return true;

  const allowRules = uaRules.filter((item) => item.type === 'allow');
  const disallowRules = uaRules.filter((item) => item.type === 'disallow');

  const allowMatch = matchRobotsRule(pathname, allowRules);
  const disallowMatch = matchRobotsRule(pathname, disallowRules);

  if (!disallowMatch) return true;
  if (!allowMatch) return false;

  return allowMatch.path.length >= disallowMatch.path.length;
}

async function sleep(ms = 0) {
  if (!ms || ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function crawlSource(source = {}, runAt = '', hooks = {}) {
  const perplexityConfig = getPerplexityConfig();
  let perplexityRemaining = Math.max(0, Math.floor(clampNumber(
    source.perplexityBudget,
    0,
    1200,
    clampNumber(process.env.PILOT_JOBS_PERPLEXITY_BUDGET, 0, 1200, 220)
  )));
  const perplexityMinConfidence = clampNumber(
    source.perplexityMinConfidence,
    0,
    1,
    perplexityConfig.minConfidence
  );

  const telemetry = {
    sourceId: source.id,
    sourceName: source.name,
    pagesFetched: 0,
    discoveredUrls: 0,
    skippedByRobots: 0,
    jobsExtracted: 0,
    jobsAccepted: 0,
    jobsRejected: 0,
    perplexityEnabled: perplexityConfig.enabled,
    perplexityReviewed: 0,
    perplexityAccepted: 0,
    perplexityRejected: 0,
    perplexityErrors: 0,
    errors: []
  };

  const emit = async (level, event, message, meta = {}) => {
    if (typeof hooks?.onLog !== 'function') return;
    await hooks.onLog({
      at: new Date().toISOString(),
      level,
      event,
      sourceId: source.id,
      sourceName: source.name,
      message,
      meta
    });
  };

  if (!source.allowCrawler) {
    await emit('warn', 'source:blocked', `Crawler disabled for source ${source.name}`, {
      sourceId: source.id
    });
    return {
      jobs: [],
      rejected: [],
      telemetry: {
        ...telemetry,
        errors: ['source-not-allowed']
      }
    };
  }

  const allowedHosts = new Set((source.allowedHosts || []).map((item) => normalizeSpaces(item).toLowerCase()).filter(Boolean));
  const queue = (source.seedUrls || [])
    .map((url) => canonicalizeUrl(url))
    .filter(Boolean)
    .map((url) => ({ url, depth: 0 }));
  const visited = new Set();
  const queued = new Set(queue.map((item) => item.url));
  const acceptedById = new Map();
  const rejected = [];

  const maxPages = Number(source.maxPages || 24);
  const maxDepth = Number(source.maxDepth || 2);
  const rateMs = Number(source.rateMs || 450);

  while (queue.length && visited.size < maxPages) {
    const current = queue.shift();
    if (!current?.url) continue;

    const canonical = canonicalizeUrl(current.url);
    if (!canonical || visited.has(canonical)) continue;
    visited.add(canonical);

    const host = getHost(canonical);
    if (allowedHosts.size && !allowedHosts.has(host)) continue;

    // eslint-disable-next-line no-await-in-loop
    const allowedByRobots = await isRobotsAllowed(canonical);
    if (!allowedByRobots) {
      telemetry.skippedByRobots += 1;
      // eslint-disable-next-line no-await-in-loop
      await emit('warn', 'page:robots-skip', `Robots blocked ${canonical}`, {
        url: canonical,
        depth: current.depth,
        visited: visited.size,
        skippedByRobots: telemetry.skippedByRobots
      });
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const html = await fetchHtml(canonical, source.id);
    if (!html) {
      // eslint-disable-next-line no-await-in-loop
      await emit('warn', 'page:empty', `No HTML returned for ${canonical}`, {
        url: canonical,
        depth: current.depth,
        visited: visited.size
      });
      continue;
    }
    telemetry.pagesFetched += 1;

    const pageEvidence = extractPageEvidence(html);
    const pageTitle = extractPageTitle(html);
    const fallbackExtracted = extractCandidatesFallback(html, canonical, source.name);
    const jsonLdExtracted = extractCandidatesFromJsonLd(html, canonical, source.name);
    const shouldUseStrictPerplexity = Boolean(
      perplexityConfig.enabled && (
        source.forcePerplexityStrict === true || perplexityConfig.strictMode
      )
    );

    const extracted = shouldUseStrictPerplexity
      ? fallbackExtracted
      : [...jsonLdExtracted, ...fallbackExtracted];

    telemetry.jobsExtracted += extracted.length;
    let pageAccepted = 0;
    let pageRejected = 0;
    let pagePerplexityReviewed = 0;
    let pagePerplexityAccepted = 0;
    let pagePerplexityRejected = 0;
    let pagePerplexityErrors = 0;

    for (const candidate of extracted) {
      let normalized = buildNormalizedJob(candidate, source, runAt);
      let validation = validateJob(normalized);
      let perplexityReview = null;

      if (shouldUseStrictPerplexity) {
        if (perplexityRemaining <= 0) {
          telemetry.jobsRejected += 1;
          telemetry.perplexityErrors += 1;
          pageRejected += 1;
          pagePerplexityErrors += 1;
          rejected.push({
            sourceId: source.id,
            sourceName: source.name,
            sourceUrl: normalized.sourceUrl || canonical,
            title: normalized.title,
            issues: ['perplexity-budget-exhausted'],
            qualityScore: 0
          });
          continue;
        }

        telemetry.perplexityReviewed += 1;
        pagePerplexityReviewed += 1;
        perplexityRemaining -= 1;

        // eslint-disable-next-line no-await-in-loop
        perplexityReview = await reviewJobWithPerplexity({
          source,
          job: normalized,
          pageUrl: canonical,
          pageTitle,
          pageEvidence
        });

        if (!perplexityReview?.ok) {
          telemetry.perplexityErrors += 1;
          telemetry.jobsRejected += 1;
          pagePerplexityErrors += 1;
          pageRejected += 1;
          rejected.push({
            sourceId: source.id,
            sourceName: source.name,
            sourceUrl: normalized.sourceUrl || canonical,
            title: normalized.title,
            issues: [perplexityReview?.error || 'perplexity-failed'],
            qualityScore: 0
          });
          continue;
        }

        const curatedCandidate = buildPerplexityCandidateFromPage(perplexityReview, canonical, source.name);
        normalized = buildNormalizedJob(curatedCandidate, source, runAt);
        normalized = applyPerplexityEnrichment(normalized, perplexityReview);
        validation = validateJob(normalized);

        const belowConfidence = perplexityReview.confidence < perplexityMinConfidence;
        if (!perplexityReview.isJobPage || !perplexityReview.isRealAviationJob || belowConfidence) {
          telemetry.perplexityRejected += 1;
          telemetry.jobsRejected += 1;
          pagePerplexityRejected += 1;
          pageRejected += 1;
          rejected.push({
            sourceId: source.id,
            sourceName: source.name,
            sourceUrl: normalized.sourceUrl || canonical,
            title: normalized.title,
            issues: [
              !perplexityReview.isJobPage ? 'perplexity-not-job-page' : null,
              !perplexityReview.isRealAviationJob ? 'perplexity-not-real-job' : null,
              belowConfidence ? 'perplexity-low-confidence' : null,
              ...validation.issues
            ].filter(Boolean),
            qualityScore: computeQualityScore(validation.score, perplexityReview),
            perplexity: {
              confidence: perplexityReview.confidence,
              reason: normalizeSpaces(perplexityReview.reason || ''),
              attempts: Number(perplexityReview.attempts || 1)
            }
          });
          continue;
        }

        telemetry.perplexityAccepted += 1;
        pagePerplexityAccepted += 1;
      }

      if (!shouldUseStrictPerplexity && shouldReviewWithPerplexity(normalized, validation, {
        enabled: perplexityConfig.enabled,
        remaining: perplexityRemaining
      })) {
        telemetry.perplexityReviewed += 1;
        perplexityRemaining -= 1;

        // eslint-disable-next-line no-await-in-loop
        perplexityReview = await reviewJobWithPerplexity({
          source,
          job: normalized,
          pageUrl: canonical,
          pageEvidence
        });

        if (!perplexityReview?.ok) {
          telemetry.perplexityErrors += 1;
          pagePerplexityErrors += 1;
        } else {
          normalized = applyPerplexityEnrichment(normalized, perplexityReview);
          validation = validateJob(normalized);

          if (!perplexityReview.isRealAviationJob || perplexityReview.confidence < perplexityMinConfidence) {
            telemetry.perplexityRejected += 1;
            telemetry.jobsRejected += 1;
            pagePerplexityRejected += 1;
            pageRejected += 1;
            rejected.push({
              sourceId: source.id,
              sourceName: source.name,
              sourceUrl: normalized.sourceUrl || canonical,
              title: normalized.title,
              issues: [
                ...validation.issues,
                !perplexityReview.isRealAviationJob ? 'perplexity-not-real-job' : null,
                perplexityReview.confidence < perplexityMinConfidence ? 'perplexity-low-confidence' : null
              ].filter(Boolean),
              qualityScore: computeQualityScore(validation.score, perplexityReview),
              perplexity: {
                confidence: perplexityReview.confidence,
                reason: normalizeSpaces(perplexityReview.reason || '')
              }
            });
            continue;
          }

          telemetry.perplexityAccepted += 1;
          pagePerplexityAccepted += 1;
        }
      }

      normalized.qualityScore = computeQualityScore(validation.score, perplexityReview?.ok ? perplexityReview : null);

      if (!validation.valid) {
        telemetry.jobsRejected += 1;
        pageRejected += 1;
        rejected.push({
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: normalized.sourceUrl || canonical,
          title: normalized.title,
          issues: validation.issues,
          qualityScore: normalized.qualityScore
        });
        continue;
      }

      if (!isAviationRelevant(`${normalized.title} ${normalized.summary} ${normalized.description}`)) {
        telemetry.jobsRejected += 1;
        pageRejected += 1;
        rejected.push({
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: normalized.sourceUrl || canonical,
          title: normalized.title,
          issues: ['not-aviation-relevant'],
          qualityScore: normalized.qualityScore
        });
        continue;
      }

      if (!acceptedById.has(normalized.id)) {
        acceptedById.set(normalized.id, normalized);
        telemetry.jobsAccepted += 1;
        pageAccepted += 1;

        // eslint-disable-next-line no-await-in-loop
        await emit('info', 'job:accepted', `Accepted job: ${normalized.title}`, {
          jobId: normalized.id,
          title: normalized.title,
          company: normalized.company,
          location: normalized.location,
          sourceUrl: normalized.sourceUrl,
          qualityScore: normalized.qualityScore,
          extractionMethod: normalized.extractionMethod,
          perplexityConfidence: Number(normalized.perplexityConfidence || 0)
        });
      }
    }

    if (current.depth < maxDepth) {
      const discovered = extractLinks(html, canonical, Array.from(allowedHosts))
        .filter((link) => shouldFollowLink(link))
        .filter((link) => !visited.has(link) && !queued.has(link));

      discovered.forEach((link) => {
        queue.push({
          url: link,
          depth: current.depth + 1
        });
        queued.add(link);
      });

      telemetry.discoveredUrls += discovered.length;
    }

    // eslint-disable-next-line no-await-in-loop
    await emit('info', 'page:processed', `Processed page ${canonical}`, {
      url: canonical,
      depth: current.depth,
      visited: visited.size,
      pagesFetched: telemetry.pagesFetched,
      extracted: extracted.length,
      pageAccepted,
      pageRejected,
      discoveredUrls: telemetry.discoveredUrls,
      perplexityReviewed: pagePerplexityReviewed,
      perplexityAccepted: pagePerplexityAccepted,
      perplexityRejected: pagePerplexityRejected,
      perplexityErrors: pagePerplexityErrors,
      remainingPerplexityBudget: perplexityRemaining
    });

    // eslint-disable-next-line no-await-in-loop
    await sleep(rateMs);
  }

  return {
    jobs: Array.from(acceptedById.values()),
    rejected,
    telemetry
  };
}

async function readAllJobs(limit = 3000) {
  const store = await withJobsStore();
  const keys = [];
  let cursor = undefined;
  let hasMore = true;

  while (hasMore && keys.length < limit) {
    // eslint-disable-next-line no-await-in-loop
    const listed = await store.list({
      prefix: 'job:',
      limit: Math.min(200, Math.max(1, limit - keys.length)),
      cursor
    });

    const pageKeys = Array.isArray(listed?.blobs)
      ? listed.blobs.map((item) => item.key).filter(Boolean)
      : [];

    keys.push(...pageKeys);

    const nextCursor = listed?.cursor || listed?.next_cursor || listed?.pagination?.cursor;
    const pageHasMore = Boolean(listed?.hasMore || listed?.has_more || nextCursor);
    hasMore = pageHasMore && Boolean(nextCursor);
    cursor = nextCursor;
  }

  const jobs = [];
  for (const key of keys) {
    // eslint-disable-next-line no-await-in-loop
    const value = await store.get(key, { type: 'json' });
    if (value?.id) jobs.push(value);
  }

  return jobs;
}

function dedupeJobs(items = []) {
  const byId = new Map();
  const byFingerprint = new Set();

  items.forEach((item) => {
    if (!item?.id) return;

    const fingerprint = shortHash(
      `${canonicalizeUrl(item.sourceUrl || item.applyUrl || '')}|${slugify(`${item.title}-${item.company}-${item.location}`)}`
    );
    if (byFingerprint.has(fingerprint)) return;
    byFingerprint.add(fingerprint);

    if (!byId.has(item.id)) {
      byId.set(item.id, item);
      return;
    }

    const existing = byId.get(item.id);
    const existingScore = Number(existing?.qualityScore || 0);
    const incomingScore = Number(item?.qualityScore || 0);
    if (incomingScore >= existingScore) byId.set(item.id, item);
  });

  return Array.from(byId.values());
}

function computeStatus(job = {}, nowMs = Date.now()) {
  if (job.status === 'hidden') return 'hidden';
  const expiresAtMs = new Date(job.expiresAt || 0).getTime() || 0;
  if (!expiresAtMs) return 'expired';
  return nowMs < expiresAtMs ? 'active' : 'expired';
}

async function writeJobs(jobs = []) {
  const store = await withJobsStore();

  for (const job of jobs) {
    if (!job?.id) continue;
    // eslint-disable-next-line no-await-in-loop
    await store.set(`job:${job.id}`, job, { type: 'json' });
  }
}

async function writeJobsWithLogging(jobs = [], onLog = null) {
  const store = await withJobsStore();

  for (const job of jobs) {
    if (!job?.id) continue;
    // eslint-disable-next-line no-await-in-loop
    await store.set(`job:${job.id}`, job, { type: 'json' });

    if (typeof onLog === 'function') {
      // eslint-disable-next-line no-await-in-loop
      await onLog('info', 'job:persisted', `Persisted job: ${job.title || job.id}`, {
        jobId: job.id,
        slug: job.slug,
        title: job.title,
        sourceName: job.sourceName,
        qualityScore: Number(job.qualityScore || 0)
      }, {
        id: job.sourceId,
        name: job.sourceName
      });
    }
  }
}

async function writeState(state = {}) {
  const store = await withJobsStore();
  await store.set('state', state, { type: 'json' });
}

function safeJsonClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

async function appendLiveCrawlerLog(entry = {}) {
  const store = await withJobsStore();
  let existingItems = [];

  try {
    const current = await store.get('logs', { type: 'json' });
    existingItems = Array.isArray(current?.items)
      ? current.items.map((item) => enrichLogEntry(item))
      : [];
  } catch {
    try {
      await store.delete('logs');
    } catch {
      // ignore cleanup failures
    }
    existingItems = [];
  }

  const normalized = enrichLogEntry(entry);
  const merged = [...existingItems, normalized].slice(-LOG_LIMIT);

  const payload = {
    updatedAt: new Date().toISOString(),
    items: merged.map((item) => safeJsonClone(item) || normalizeCrawlerLogEntry(item))
  };

  await store.set('logs', payload, { type: 'json' });
  return merged;
}

function normalizeCrawlerLogEntry(entry = {}) {
  return {
    at: normalizeSpaces(entry.at || '') || new Date().toISOString(),
    level: normalizeSpaces(entry.level || 'info').toLowerCase() || 'info',
    event: normalizeSpaces(entry.event || 'unknown') || 'unknown',
    sourceId: normalizeSpaces(entry.sourceId || '') || '',
    sourceName: normalizeSpaces(entry.sourceName || '') || '',
    message: normalizeSpaces(entry.message || '') || 'No details provided',
    meta: entry.meta && typeof entry.meta === 'object' ? entry.meta : {}
  };
}

async function readCrawlerLogs() {
  const store = await withJobsStore();
  try {
    const payload = await store.get('logs', { type: 'json' });
    if (!payload || !Array.isArray(payload.items)) return [];
    return payload.items
      .map((item) => normalizeCrawlerLogEntry(item))
      .slice(-LOG_LIMIT);
  } catch {
    try {
      await store.delete('logs');
    } catch {
      // ignore cleanup failures
    }
    return [];
  }
}

async function appendCrawlerLogs(entries = []) {
  const normalizedIncoming = (entries || [])
    .map((item) => enrichLogEntry(item))
    .filter((item) => item.event);
  if (!normalizedIncoming.length) return [];

  const existing = await readCrawlerLogs();
  const merged = [...existing, ...normalizedIncoming].slice(-LOG_LIMIT);
  const store = await withJobsStore();

  await store.set('logs', {
    updatedAt: new Date().toISOString(),
    items: merged
  }, { type: 'json' });

  return merged;
}

async function readState() {
  const store = await withJobsStore();
  const state = await store.get('state', { type: 'json' });
  if (!state || typeof state !== 'object') {
    return {
      lastRunAt: null,
      lastRunSummary: null,
      updatedAt: null,
      store: {
        backend: jobsStoreBackend,
        blobsConfigured: jobsStoreBackend === 'netlify-blobs'
      }
    };
  }

  return {
    lastRunAt: state.lastRunAt || null,
    lastRunSummary: state.lastRunSummary || null,
    updatedAt: state.updatedAt || null,
    store: {
      backend: normalizeSpaces(state?.store?.backend || jobsStoreBackend) || 'unknown',
      blobsConfigured: Boolean(state?.store?.blobsConfigured || jobsStoreBackend === 'netlify-blobs')
    }
  };
}

async function syncPilotJobs(options = {}) {
  const runAt = new Date().toISOString();
  const sourceLimit = Number(options.sourceLimit || SOURCE_REGISTRY.length);
  const nowMs = Date.now();
  const liveLogsEnabled = options.liveLogs !== false;
  const consoleLogsEnabled = options.logToConsole === true
    || normalizeSpaces(process.env.PILOT_JOBS_CONSOLE_LOGS || '') === '1';
  const syncLogs = [];

  const addLog = async (level, event, message, meta = {}, source = {}) => {
    const entry = normalizeCrawlerLogEntry({
      at: new Date().toISOString(),
      level,
      event,
      sourceId: source?.id || '',
      sourceName: source?.name || '',
      message,
      meta
    });

    syncLogs.push(entry);

    if (consoleLogsEnabled) {
      try {
        // eslint-disable-next-line no-console
        console.log(`[pilot-jobs] ${buildReadableLogLine(entry)}`);
      } catch {
        // eslint-disable-next-line no-console
        console.log(`[pilot-jobs] ${entry.level} ${entry.event} ${entry.message}`);
      }
    }

    if (liveLogsEnabled) {
      await appendLiveCrawlerLog(entry);
    }
  };

  const sources = SOURCE_REGISTRY
    .filter((item) => item.allowCrawler)
    .slice(0, Math.max(1, sourceLimit));

  const existing = await readAllJobs();
  const existingById = new Map(existing.filter((item) => item?.id).map((item) => [item.id, item]));

  await addLog('info', 'sync:start', 'Pilot jobs sync started', {
    sourceLimit,
    existingJobs: existing.length,
    storeBackend: jobsStoreBackend,
    perplexityModel: getPerplexityConfig().model,
    perplexityMinIntervalMs: getPerplexityConfig().minIntervalMs
  });

  const crawledJobs = [];
  const rejected = [];
  const sourceTelemetry = [];

  for (const source of sources) {
    await addLog('info', 'source:start', `Source crawl started: ${source.name}`, {
      sourceId: source.id,
      maxPages: Number(options.maxPagesPerSource || source.maxPages || 24),
      maxDepth: Number(options.maxDepth || source.maxDepth || 2)
    }, source);

    const withOverrides = {
      ...source,
      maxPages: Math.min(Number(options.maxPagesPerSource || source.maxPages || 24), 80),
      maxDepth: Math.min(Number(options.maxDepth || source.maxDepth || 2), 4),
      perplexityBudget: clampNumber(
        options.perplexityBudgetPerSource,
        0,
        1200,
        clampNumber(source.perplexityBudget, 0, 1200, clampNumber(process.env.PILOT_JOBS_PERPLEXITY_BUDGET, 0, 1200, 220))
      ),
      perplexityMinConfidence: clampNumber(
        options.perplexityMinConfidence,
        0,
        1,
        clampNumber(source.perplexityMinConfidence, 0, 1, getPerplexityConfig().minConfidence)
      ),
      forcePerplexityStrict: options.forcePerplexityStrict === true
    };

    // eslint-disable-next-line no-await-in-loop
    const crawled = await crawlSource(withOverrides, runAt, {
      onLog: addLog
    });
    crawledJobs.push(...(crawled.jobs || []));
    rejected.push(...(crawled.rejected || []));
    sourceTelemetry.push(crawled.telemetry || {});

    const sourceRejected = Array.isArray(crawled?.rejected) ? crawled.rejected : [];
    const sampleRejected = sourceRejected.slice(0, 4).map((item) => ({
      title: item.title,
      issues: item.issues,
      sourceUrl: item.sourceUrl
    }));

    await addLog(
      'info',
      'source:complete',
      `Source crawl completed: ${source.name}`,
      {
        pagesFetched: Number(crawled?.telemetry?.pagesFetched || 0),
          discoveredUrls: Number(crawled?.telemetry?.discoveredUrls || 0),
          jobsExtracted: Number(crawled?.telemetry?.jobsExtracted || 0),
          jobsAccepted: Number(crawled?.telemetry?.jobsAccepted || 0),
          jobsRejected: Number(crawled?.telemetry?.jobsRejected || 0),
          skippedByRobots: Number(crawled?.telemetry?.skippedByRobots || 0),
          perplexityReviewed: Number(crawled?.telemetry?.perplexityReviewed || 0),
          perplexityAccepted: Number(crawled?.telemetry?.perplexityAccepted || 0),
          perplexityRejected: Number(crawled?.telemetry?.perplexityRejected || 0),
          perplexityErrors: Number(crawled?.telemetry?.perplexityErrors || 0),
          sampleRejected
        },
        source
    );

    if (sampleRejected.length) {
      await addLog(
        'warn',
        'source:rejections',
        `Validation rejected ${sourceRejected.length} jobs for ${source.name}`,
        {
          sampleRejected
        },
        source
      );
    }
  }

  const dedupedIncoming = dedupeJobs(crawledJobs);
  const touchedIds = new Set();
  const mergedById = new Map();

  dedupedIncoming.forEach((incoming) => {
    if (!incoming?.id) return;
    const existingJob = existingById.get(incoming.id);
    touchedIds.add(incoming.id);

    if (!existingJob) {
      mergedById.set(incoming.id, {
        ...incoming,
        status: computeStatus(incoming, nowMs),
        updatedAt: runAt
      });
      return;
    }

    const merged = {
      ...existingJob,
      ...incoming,
      createdAt: existingJob.createdAt || incoming.createdAt || runAt,
      firstSeenAt: existingJob.firstSeenAt || incoming.firstSeenAt || runAt,
      expiresAt: existingJob.expiresAt || incoming.expiresAt,
      lastSeenAt: runAt,
      status: existingJob.status === 'hidden'
        ? 'hidden'
        : computeStatus({ ...existingJob, expiresAt: existingJob.expiresAt || incoming.expiresAt }, nowMs),
      updatedAt: runAt
    };

    mergedById.set(merged.id, merged);
  });

  existing.forEach((job) => {
    if (!job?.id || touchedIds.has(job.id) || mergedById.has(job.id)) return;
    mergedById.set(job.id, {
      ...job,
      status: computeStatus(job, nowMs),
      updatedAt: runAt
    });
  });

  const mergedJobs = Array.from(mergedById.values());
  await writeJobsWithLogging(mergedJobs, liveLogsEnabled ? addLog : null);

  const summary = {
    runAt,
    sourcesAttempted: sources.length,
    discoveredRaw: crawledJobs.length,
    discoveredDeduped: dedupedIncoming.length,
    rejected: rejected.length,
    active: mergedJobs.filter((item) => item.status === 'active').length,
    expired: mergedJobs.filter((item) => item.status === 'expired').length,
    hidden: mergedJobs.filter((item) => item.status === 'hidden').length,
    perplexity: {
      reviewed: sourceTelemetry.reduce((acc, item) => acc + Number(item?.perplexityReviewed || 0), 0),
      accepted: sourceTelemetry.reduce((acc, item) => acc + Number(item?.perplexityAccepted || 0), 0),
      rejected: sourceTelemetry.reduce((acc, item) => acc + Number(item?.perplexityRejected || 0), 0),
      errors: sourceTelemetry.reduce((acc, item) => acc + Number(item?.perplexityErrors || 0), 0)
    },
    total: mergedJobs.length,
    sourceTelemetry
  };

  await addLog('info', 'sync:complete', 'Pilot jobs sync completed', {
    discoveredRaw: summary.discoveredRaw,
    discoveredDeduped: summary.discoveredDeduped,
    rejected: summary.rejected,
    active: summary.active,
    expired: summary.expired,
    hidden: summary.hidden,
    perplexity: summary.perplexity,
    total: summary.total
  });

  if (summary.rejected > 0) {
    await addLog('warn', 'sync:quality', `Sync completed with ${summary.rejected} rejected jobs`, {
      rejected: summary.rejected
    });
  }

  const persistedLogs = liveLogsEnabled
    ? await readCrawlerLogs()
    : await appendCrawlerLogs(syncLogs);

  await writeState({
    lastRunAt: runAt,
    lastRunSummary: summary,
    updatedAt: runAt,
    store: {
      backend: jobsStoreBackend,
      blobsConfigured: jobsStoreBackend === 'netlify-blobs'
    },
    logs: persistedLogs.slice(-100)
  });

  return {
    ok: true,
    summary,
    rejected: rejected.slice(0, 120),
    logs: syncLogs.slice(-120)
  };
}

function normalizeFilterValue(value = '') {
  return normalizeSpaces(value).toLowerCase();
}

function sortJobs(items = [], sort = 'latest') {
  const list = items.slice();

  list.sort((a, b) => {
    if (sort === 'oldest') {
      return (new Date(a.postedAt || a.firstSeenAt || 0).getTime() || 0)
        - (new Date(b.postedAt || b.firstSeenAt || 0).getTime() || 0);
    }

    if (sort === 'title-asc') return String(a.title || '').localeCompare(String(b.title || ''));
    if (sort === 'title-desc') return String(b.title || '').localeCompare(String(a.title || ''));

    return (new Date(b.postedAt || b.firstSeenAt || 0).getTime() || 0)
      - (new Date(a.postedAt || a.firstSeenAt || 0).getTime() || 0);
  });

  return list;
}

function buildFacets(items = []) {
  const countryMap = new Map();
  const roleMap = new Map();
  const sourceMap = new Map();

  items.forEach((item) => {
    const country = normalizeSpaces(item.country || 'Unknown');
    const role = normalizeSpaces(item.roleFamily || 'Other Aviation');
    const source = normalizeSpaces(item.sourceName || item.sourceId || 'Unknown source');

    countryMap.set(country, (countryMap.get(country) || 0) + 1);
    roleMap.set(role, (roleMap.get(role) || 0) + 1);
    sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
  });

  const toSortedList = (map) => Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

  return {
    countries: toSortedList(countryMap),
    roles: toSortedList(roleMap),
    sources: toSortedList(sourceMap)
  };
}

async function getPublicJobs(options = {}) {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.min(60, Math.max(1, Number(options.limit || 12)));
  const search = normalizeFilterValue(options.search || '');
  const country = normalizeFilterValue(options.country || 'all');
  const role = normalizeFilterValue(options.role || 'all');
  const source = normalizeFilterValue(options.source || 'all');
  const sort = normalizeFilterValue(options.sort || 'latest') || 'latest';
  const includeExpired = Boolean(options.includeExpired);

  const allJobs = await readAllJobs();
  const nowMs = Date.now();

  const withStatus = allJobs.map((item) => ({
    ...item,
    status: computeStatus(item, nowMs)
  }));

  const publicPool = withStatus.filter((item) => item.status !== 'hidden');
  const visibilityPool = includeExpired ? publicPool : publicPool.filter((item) => item.status === 'active');

  const filtered = visibilityPool.filter((item) => {
    if (country !== 'all' && normalizeFilterValue(item.country) !== country) return false;
    if (role !== 'all' && normalizeFilterValue(item.roleFamily) !== role) return false;
    if (source !== 'all' && normalizeFilterValue(item.sourceName || item.sourceId) !== source) return false;

    if (search) {
      const haystack = normalizeFilterValue([
        item.title,
        item.company,
        item.location,
        item.country,
        item.roleFamily,
        item.summary,
        item.sourceName
      ].join(' '));
      if (!haystack.includes(search)) return false;
    }

    return true;
  });

  const sorted = sortJobs(filtered, sort);
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);
  const sliceStart = (safePage - 1) * limit;
  const items = sorted.slice(sliceStart, sliceStart + limit);

  const facets = buildFacets(visibilityPool);
  const state = await readState();

  return {
    items,
    pagination: {
      page: safePage,
      pageSize: limit,
      totalItems,
      totalPages,
      hasPrevPage: safePage > 1,
      hasNextPage: safePage < totalPages
    },
    facets,
    stats: {
      active: withStatus.filter((item) => item.status === 'active').length,
      expired: withStatus.filter((item) => item.status === 'expired').length,
      hidden: withStatus.filter((item) => item.status === 'hidden').length,
      total: withStatus.length
    },
    state
  };
}

async function getJobBySlug(slug = '') {
  const target = normalizeFilterValue(slug);
  if (!target) return null;

  const jobs = await readAllJobs();
  const nowMs = Date.now();

  const found = jobs.find((item) => normalizeFilterValue(item.slug || '') === target);
  if (!found) return null;

  return {
    ...found,
    status: computeStatus(found, nowMs)
  };
}

async function updateJobBySlug(slug = '', updater = () => ({})) {
  const target = normalizeFilterValue(slug);
  if (!target) return null;

  const jobs = await readAllJobs();
  const runAt = new Date().toISOString();
  let updated = null;

  const nextJobs = jobs.map((item) => {
    if (normalizeFilterValue(item.slug || '') !== target) return item;
    const patch = updater(item) || {};
    updated = {
      ...item,
      ...patch,
      updatedAt: runAt
    };
    return updated;
  });

  if (!updated) return null;
  await writeJobs(nextJobs);
  return updated;
}

async function getValidationReport() {
  const jobs = await readAllJobs();
  const nowMs = Date.now();

  const invalid = [];
  const duplicateBySource = new Map();

  jobs.forEach((job) => {
    const validation = validateJob(job);
    if (!validation.valid) {
      invalid.push({
        slug: job.slug,
        id: job.id,
        title: job.title,
        issues: validation.issues,
        qualityScore: validation.score
      });
    }

    const sourceKey = canonicalizeUrl(job.sourceUrl || '');
    if (!sourceKey) return;
    duplicateBySource.set(sourceKey, (duplicateBySource.get(sourceKey) || 0) + 1);
  });

  const duplicates = Array.from(duplicateBySource.entries())
    .filter(([, count]) => count > 1)
    .map(([sourceUrl, count]) => ({ sourceUrl, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 80);

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      total: jobs.length,
      active: jobs.filter((item) => computeStatus(item, nowMs) === 'active').length,
      expired: jobs.filter((item) => computeStatus(item, nowMs) === 'expired').length,
      hidden: jobs.filter((item) => computeStatus(item, nowMs) === 'hidden').length,
      invalid: invalid.length,
      duplicatedSourceLinks: duplicates.length
    },
    invalid: invalid.slice(0, 160),
    duplicates
  };
}

async function getCrawlerLogs(limit = 200) {
  const max = Math.min(600, Math.max(1, Number(limit || 200)));
  const logs = await readCrawlerLogs();
  return logs
    .slice(-max)
    .reverse()
    .map((entry) => enrichLogEntry(entry));
}

async function getCrawlerLogsFeed(limit = 200) {
  const logs = await getCrawlerLogs(limit);
  return {
    generatedAt: new Date().toISOString(),
    store: {
      backend: jobsStoreBackend,
      blobsConfigured: jobsStoreBackend === 'netlify-blobs'
    },
    total: logs.length,
    logs,
    lines: logs.map((entry) => entry.readable)
  };
}

async function clearPilotJobsData() {
  const store = await withJobsStore();
  const listed = await store.list({ prefix: 'job:' });
  const keys = Array.isArray(listed?.blobs)
    ? listed.blobs.map((item) => item.key).filter(Boolean)
    : [];

  for (const key of keys) {
    // eslint-disable-next-line no-await-in-loop
    await store.delete(key);
  }

  await store.delete('state');
  await store.delete('logs');

  return {
    deletedJobs: keys.length,
    clearedState: true,
    clearedLogs: true,
    clearedAt: new Date().toISOString()
  };
}

module.exports = {
  SOURCE_REGISTRY,
  ONE_MONTH_MS,
  normalizeSpaces,
  canonicalizeUrl,
  readAllJobs,
  getPublicJobs,
  getJobBySlug,
  updateJobBySlug,
  getValidationReport,
  getCrawlerLogs,
  getCrawlerLogsFeed,
  clearPilotJobsData,
  syncPilotJobs
};

