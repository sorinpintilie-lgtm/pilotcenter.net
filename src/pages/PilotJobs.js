import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Home.css';
import './PilotJobs.css';

const PAGE_SIZE = 12;
const SITE_URL = 'https://pilotcenter.net';

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
  hasPrevPage: false,
  hasNextPage: false
};

const DEFAULT_FACETS = {
  countries: [],
  roles: [],
  sources: []
};

const DEFAULT_STATS = {
  active: 0,
  expired: 0,
  hidden: 0,
  total: 0
};

function buildJobsQuery({
  limit = PAGE_SIZE,
  page = 1,
  sort = 'latest',
  search = '',
  country = 'all',
  role = 'all',
  source = 'all'
} = {}) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('page', String(page));
  params.set('sort', sort);
  params.set('country', country);
  params.set('role', role);
  params.set('source', source);
  if (search.trim()) params.set('search', search.trim());
  return params.toString();
}

async function fetchPilotJobs(query) {
  const endpoints = [
    `/api/pilot-jobs?${query}`,
    `/.netlify/functions/pilot-jobs?${query}`
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const payload = await response.json();
      if (!payload?.ok || !Array.isArray(payload.items)) throw new Error('Invalid payload');
      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to load pilot jobs');
}

function formatDate(value = '') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export default function PilotJobs() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('Loading latest pilot jobs...');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [facets, setFacets] = useState(DEFAULT_FACETS);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    country: 'all',
    role: 'all',
    source: 'all',
    sort: 'latest'
  });

  const queryString = useMemo(() => buildJobsQuery({
    limit: PAGE_SIZE,
    page,
    sort: filters.sort,
    search: filters.search,
    country: filters.country,
    role: filters.role,
    source: filters.source
  }), [page, filters]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const payload = await fetchPilotJobs(queryString);
        if (!mounted) return;

        const nextItems = Array.isArray(payload.items) ? payload.items : [];
        setItems(nextItems);
        setPagination(payload.pagination || DEFAULT_PAGINATION);
        setFacets(payload.facets || DEFAULT_FACETS);
        setStats(payload.stats || DEFAULT_STATS);

        if (!nextItems.length) {
          setStatus('No active pilot jobs found right now. Please check again later.');
        } else {
          const pageInfo = payload.pagination || { page: 1, totalPages: 1, totalItems: nextItems.length };
          setStatus(`Showing ${nextItems.length} jobs · Page ${pageInfo.page} of ${pageInfo.totalPages} · ${pageInfo.totalItems} active jobs`);
        }
      } catch {
        if (!mounted) return;
        setItems([]);
        setStatus('Unable to load pilot jobs right now. Please refresh in a moment.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [queryString]);

  const countryOptions = ['all', ...(facets.countries || []).map((item) => String(item.value || '').toLowerCase())]
    .filter((value, index, list) => value && list.indexOf(value) === index);
  const roleOptions = ['all', ...(facets.roles || []).map((item) => String(item.value || '').toLowerCase())]
    .filter((value, index, list) => value && list.indexOf(value) === index);
  const sourceOptions = ['all', ...(facets.sources || []).map((item) => String(item.value || '').toLowerCase())]
    .filter((value, index, list) => value && list.indexOf(value) === index);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setFilters((current) => ({
      ...current,
      search: searchInput.trim()
    }));
  };

  const resetFilters = () => {
    setPage(1);
    setSearchInput('');
    setFilters({
      search: '',
      country: 'all',
      role: 'all',
      source: 'all',
      sort: 'latest'
    });
  };

  const handleFilterSelect = (key) => (event) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: event.target.value
    }));
  };

  const structuredData = useMemo(() => {
    const itemListElement = items.slice(0, 30).map((job, index) => {
      const path = job.jobPath || (job.slug ? `/latest-pilot-jobs/${job.slug}` : '/latest-pilot-jobs');
      const detailsUrl = `${SITE_URL}${String(path).startsWith('/') ? path : `/${path}`}`;
      const posted = new Date(job.postedAt || job.firstSeenAt || Date.now());

      return {
        '@type': 'ListItem',
        position: index + 1,
        url: detailsUrl,
        item: {
          '@type': 'JobPosting',
          title: job.title,
          description: job.summary || job.title,
          datePosted: Number.isNaN(posted.getTime()) ? new Date().toISOString() : posted.toISOString(),
          hiringOrganization: {
            '@type': 'Organization',
            name: job.company || 'Unknown company'
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.location || undefined,
              addressCountry: job.country || undefined
            }
          },
          url: detailsUrl
        }
      };
    });

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Latest Pilot Jobs | PilotCenter.net',
      url: `${SITE_URL}/latest-pilot-jobs`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'PilotCenter.net',
        url: SITE_URL
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: items.length,
        itemListElement
      }
    };
  }, [items]);

  return (
    <div className="page-content">
      <Helmet prioritizeSeoTags>
        <link rel="canonical" href={`${SITE_URL}/latest-pilot-jobs`} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <section className="hero pilot-jobs-hero">
        <div className="wrapper">
          <div className="hero-grid">
            <div className="hero-content-wrapper">
              <div className="hero-text-content">
                <div className="hero-kicker">PILOT JOBS</div>
                <h1 className="hero-title">Live Aviation Career Openings</h1>
                <p className="hero-subtitle">
                  Real pilot and aviation roles gathered from active sources, updated daily, and visible for one month.
                </p>
                <div className="pilot-jobs-hero-meta">
                  <span>Active jobs: <strong>{stats.active || 0}</strong></span>
                  <span>Total tracked: <strong>{stats.total || 0}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pilot-jobs-section">
        <div className="wrapper">
          <form className="pilot-jobs-controls" onSubmit={applyFilters}>
            <div className="pilot-jobs-controls-row">
              <label className="pilot-jobs-control-field">
                <span>Search</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by title, company, location, source"
                />
              </label>

              <label className="pilot-jobs-control-field">
                <span>Country</span>
                <select value={filters.country} onChange={handleFilterSelect('country')}>
                  {countryOptions.map((value) => (
                    <option key={value} value={value}>{value === 'all' ? 'All countries' : value}</option>
                  ))}
                </select>
              </label>

              <label className="pilot-jobs-control-field">
                <span>Role</span>
                <select value={filters.role} onChange={handleFilterSelect('role')}>
                  {roleOptions.map((value) => (
                    <option key={value} value={value}>{value === 'all' ? 'All roles' : value}</option>
                  ))}
                </select>
              </label>

              <label className="pilot-jobs-control-field">
                <span>Source</span>
                <select value={filters.source} onChange={handleFilterSelect('source')}>
                  {sourceOptions.map((value) => (
                    <option key={value} value={value}>{value === 'all' ? 'All sources' : value}</option>
                  ))}
                </select>
              </label>

              <label className="pilot-jobs-control-field">
                <span>Sort</span>
                <select value={filters.sort} onChange={handleFilterSelect('sort')}>
                  <option value="latest">Latest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title-asc">Title A → Z</option>
                  <option value="title-desc">Title Z → A</option>
                </select>
              </label>
            </div>

            <div className="pilot-jobs-controls-actions">
              <button type="submit" className="pilot-jobs-btn">Apply filters</button>
              <button type="button" className="pilot-jobs-btn pilot-jobs-btn-secondary" onClick={resetFilters}>Reset</button>
            </div>
          </form>

          <div className="pilot-jobs-status" aria-live="polite">{status}</div>

          {loading ? <div className="pilot-jobs-loading">Updating jobs...</div> : null}

          <div className="pilot-jobs-grid">
            {items.map((job) => (
              <article className="pilot-job-card" key={job.id || `${job.slug}-${job.title}`}>
                <div className="pilot-job-content">
                  <div className="pilot-job-top-row">
                    <span className="pilot-job-chip">{job.roleFamily || 'Pilot'}</span>
                    <span className="pilot-job-date">{formatDate(job.postedAt || job.firstSeenAt)}</span>
                  </div>

                  <h2 className="pilot-job-title">{job.title}</h2>
                  <p className="pilot-job-company">{job.company}</p>
                  <p className="pilot-job-location">{job.location}</p>
                  <p className="pilot-job-summary">{job.summary}</p>

                  <div className="pilot-job-actions">
                    <Link
                      className="pilot-job-link"
                      to={job.jobPath || (job.slug ? `/latest-pilot-jobs/${job.slug}` : '/latest-pilot-jobs')}
                    >
                      View details
                    </Link>
                    <a
                      className="pilot-job-apply"
                      href={job.applyUrl || job.sourceUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Apply
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="pilot-jobs-pagination">
            <button
              type="button"
              className="pilot-jobs-btn pilot-jobs-btn-secondary"
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <span>Page {pagination.page} / {pagination.totalPages}</span>
            <button
              type="button"
              className="pilot-jobs-btn"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

