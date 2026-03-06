const crypto = require('crypto');

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_USER_AGENT = 'PilotCenterJobsBot/1.0 (+https://pilotcenter.net)';
const DEFAULT_TIMEOUT_MS = 12000;

const SOURCE_REGISTRY = [
  {
    id: 'ryanair',
    name: 'Ryanair Careers',
    allowCrawler: true,
    seedUrls: [
      'https://careers.ryanair.com/search/?query=pilot'
    ],
    allowedHosts: ['careers.ryanair.com'],
    maxPages: 24,
    maxDepth: 2,
    rateMs: 550
  },
  {
    id: 'wizzair',
    name: 'Wizz Air Careers',
    allowCrawler: true,
    seedUrls: [
      'https://careers.wizzair.com/search-jobs/?keyword=pilot'
    ],
    allowedHosts: ['careers.wizzair.com'],
    maxPages: 24,
    maxDepth: 2,
    rateMs: 550
  },
  {
    id: 'qatar',
    name: 'Qatar Airways Careers',
    allowCrawler: true,
    seedUrls: [
      'https://careers.qatarairways.com/global/en/search-results?keywords=pilot'
    ],
    allowedHosts: ['careers.qatarairways.com'],
    maxPages: 24,
    maxDepth: 2,
    rateMs: 650
  },
  {
    id: 'cae',
    name: 'CAE Careers',
    allowCrawler: true,
    seedUrls: [
      'https://careers.cae.com/search/?createNewAlert=false&q=pilot'
    ],
    allowedHosts: ['careers.cae.com'],
    maxPages: 24,
    maxDepth: 2,
    rateMs: 550
  }
];

let jobsStorePromise = null;
const robotsCache = new Map();
const LOG_LIMIT = 480;
const memoryBlobData = new Map();

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
        return createMemoryStore();
      }
    })();
  }

  return jobsStorePromise;
}

function normalizeSpaces(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
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

async function crawlSource(source = {}, runAt = '') {
  const telemetry = {
    sourceId: source.id,
    sourceName: source.name,
    pagesFetched: 0,
    discoveredUrls: 0,
    skippedByRobots: 0,
    jobsExtracted: 0,
    jobsAccepted: 0,
    jobsRejected: 0,
    errors: []
  };

  if (!source.allowCrawler) {
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
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const html = await fetchHtml(canonical, source.id);
    if (!html) continue;
    telemetry.pagesFetched += 1;

    const extracted = [
      ...extractCandidatesFromJsonLd(html, canonical, source.name),
      ...extractCandidatesFallback(html, canonical, source.name)
    ];

    telemetry.jobsExtracted += extracted.length;

    extracted.forEach((candidate) => {
      const normalized = buildNormalizedJob(candidate, source, runAt);
      const validation = validateJob(normalized);

      normalized.qualityScore = validation.score;

      if (!validation.valid) {
        telemetry.jobsRejected += 1;
        rejected.push({
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: normalized.sourceUrl || canonical,
          title: normalized.title,
          issues: validation.issues,
          qualityScore: validation.score
        });
        return;
      }

      if (!isAviationRelevant(`${normalized.title} ${normalized.summary} ${normalized.description}`)) {
        telemetry.jobsRejected += 1;
        rejected.push({
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: normalized.sourceUrl || canonical,
          title: normalized.title,
          issues: ['not-aviation-relevant'],
          qualityScore: validation.score
        });
        return;
      }

      if (!acceptedById.has(normalized.id)) {
        acceptedById.set(normalized.id, normalized);
        telemetry.jobsAccepted += 1;
      }
    });

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

async function writeState(state = {}) {
  const store = await withJobsStore();
  await store.set('state', state, { type: 'json' });
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
  const payload = await store.get('logs', { type: 'json' });
  if (!payload || !Array.isArray(payload.items)) return [];
  return payload.items
    .map((item) => normalizeCrawlerLogEntry(item))
    .slice(-LOG_LIMIT);
}

async function appendCrawlerLogs(entries = []) {
  const normalizedIncoming = (entries || [])
    .map((item) => normalizeCrawlerLogEntry(item))
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
      updatedAt: null
    };
  }

  return {
    lastRunAt: state.lastRunAt || null,
    lastRunSummary: state.lastRunSummary || null,
    updatedAt: state.updatedAt || null
  };
}

async function syncPilotJobs(options = {}) {
  const runAt = new Date().toISOString();
  const sourceLimit = Number(options.sourceLimit || SOURCE_REGISTRY.length);
  const nowMs = Date.now();
  const syncLogs = [];

  const addLog = (level, event, message, meta = {}, source = {}) => {
    syncLogs.push(normalizeCrawlerLogEntry({
      at: new Date().toISOString(),
      level,
      event,
      sourceId: source?.id || '',
      sourceName: source?.name || '',
      message,
      meta
    }));
  };

  const sources = SOURCE_REGISTRY
    .filter((item) => item.allowCrawler)
    .slice(0, Math.max(1, sourceLimit));

  const existing = await readAllJobs();
  const existingById = new Map(existing.filter((item) => item?.id).map((item) => [item.id, item]));

  addLog('info', 'sync:start', 'Pilot jobs sync started', {
    sourceLimit,
    existingJobs: existing.length
  });

  const crawledJobs = [];
  const rejected = [];
  const sourceTelemetry = [];

  for (const source of sources) {
    addLog('info', 'source:start', `Source crawl started: ${source.name}`, {
      sourceId: source.id,
      maxPages: Number(options.maxPagesPerSource || source.maxPages || 24),
      maxDepth: Number(options.maxDepth || source.maxDepth || 2)
    }, source);

    const withOverrides = {
      ...source,
      maxPages: Math.min(Number(options.maxPagesPerSource || source.maxPages || 24), 80),
      maxDepth: Math.min(Number(options.maxDepth || source.maxDepth || 2), 4)
    };

    // eslint-disable-next-line no-await-in-loop
    const crawled = await crawlSource(withOverrides, runAt);
    crawledJobs.push(...(crawled.jobs || []));
    rejected.push(...(crawled.rejected || []));
    sourceTelemetry.push(crawled.telemetry || {});

    const sourceRejected = Array.isArray(crawled?.rejected) ? crawled.rejected : [];
    const sampleRejected = sourceRejected.slice(0, 4).map((item) => ({
      title: item.title,
      issues: item.issues,
      sourceUrl: item.sourceUrl
    }));

    addLog(
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
        sampleRejected
      },
      source
    );

    if (sampleRejected.length) {
      addLog(
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
  await writeJobs(mergedJobs);

  const summary = {
    runAt,
    sourcesAttempted: sources.length,
    discoveredRaw: crawledJobs.length,
    discoveredDeduped: dedupedIncoming.length,
    rejected: rejected.length,
    active: mergedJobs.filter((item) => item.status === 'active').length,
    expired: mergedJobs.filter((item) => item.status === 'expired').length,
    hidden: mergedJobs.filter((item) => item.status === 'hidden').length,
    total: mergedJobs.length,
    sourceTelemetry
  };

  addLog('info', 'sync:complete', 'Pilot jobs sync completed', {
    discoveredRaw: summary.discoveredRaw,
    discoveredDeduped: summary.discoveredDeduped,
    rejected: summary.rejected,
    active: summary.active,
    expired: summary.expired,
    hidden: summary.hidden,
    total: summary.total
  });

  if (summary.rejected > 0) {
    addLog('warn', 'sync:quality', `Sync completed with ${summary.rejected} rejected jobs`, {
      rejected: summary.rejected
    });
  }

  const persistedLogs = await appendCrawlerLogs(syncLogs);

  await writeState({
    lastRunAt: runAt,
    lastRunSummary: summary,
    updatedAt: runAt,
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
  return logs.slice(-max).reverse();
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
  clearPilotJobsData,
  syncPilotJobs
};

