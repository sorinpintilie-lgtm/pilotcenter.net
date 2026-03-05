import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import './News.css';

const PAGE_SIZE = 9;

function buildNewsQuery({
  limit = PAGE_SIZE,
  page = 1,
  sort = 'latest',
  category = 'all',
  source = 'all',
  search = '',
  onlyNew = false,
  seen = []
} = {}) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('page', String(page));
  params.set('sort', sort);
  params.set('category', category);
  params.set('source', source);
  if (search.trim()) params.set('search', search.trim());
  if (onlyNew) params.set('onlyNew', '1');
  if (seen.length) params.set('seen', seen.join(','));
  return params.toString();
}

async function fetchCuratedNews(query) {
  const endpoints = [
    `/api/aviation-news?${query}`,
    `/.netlify/functions/aviation-news?${query}`
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error(`status ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data.items)) throw new Error('Invalid payload');

      return {
        items: data.items,
        stats: data.stats || null,
        pagination: data.pagination || null,
        filters: data.filters || null,
        facets: data.facets || { categories: [], sources: [] }
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to reach curated news endpoint');
}

function News() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false
  });
  const [facets, setFacets] = useState({ categories: [], sources: [] });
  const [filters, setFilters] = useState({
    category: 'all',
    source: 'all',
    sort: 'latest',
    search: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('Loading latest aviation updates...');
  const [loading, setLoading] = useState(false);
  const seenLinksRef = useRef(new Set());

  const queryString = useMemo(() => buildNewsQuery({
    limit: PAGE_SIZE,
    page,
    sort: filters.sort,
    category: filters.category,
    source: filters.source,
    search: filters.search
  }), [page, filters]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const payload = await fetchCuratedNews(queryString);

        if (!mounted) return;

        const feedItems = Array.isArray(payload.items) ? payload.items : [];

        setItems(feedItems);
        feedItems.forEach((item) => {
          if (item?.link) seenLinksRef.current.add(item.link);
        });

        if (payload.pagination) setPagination(payload.pagination);
        if (payload.facets) setFacets(payload.facets);

        if (!feedItems.length) {
          setStatus('No positive aviation items are available right now. Please check back soon.');
          return;
        }

        const pageInfo = payload.pagination || { page: 1, totalPages: 1, totalItems: feedItems.length };
        setStatus(`Showing ${feedItems.length} update${feedItems.length === 1 ? '' : 's'} · Page ${pageInfo.page} of ${pageInfo.totalPages} · ${pageInfo.totalItems} total`);
      } catch {
        if (!mounted) return;
        setItems([]);
        setStatus('Unable to load news right now. Please refresh in a moment.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [queryString]);

  const categoryOptions = ['all', ...(facets.categories || []).map((item) => item.toLowerCase())]
    .filter((value, index, self) => self.indexOf(value) === index);
  const sourceOptions = ['all', ...(facets.sources || []).map((item) => item.toLowerCase())]
    .filter((value, index, self) => self.indexOf(value) === index);

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setFilters((current) => ({ ...current, search: searchInput.trim() }));
  };

  const resetFilters = () => {
    setPage(1);
    setSearchInput('');
    setFilters({ category: 'all', source: 'all', sort: 'latest', search: '' });
  };

  const handleFilterSelect = (key) => (event) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: event.target.value }));
  };

  return (
    <div className="page-content">
      <section className="hero news-hero">
        <div className="wrapper">
          <div className="hero-grid">
            <div className="hero-content-wrapper">
              <div className="hero-text-content">
                <div className="hero-kicker">NEWS & RESOURCES</div>
                <h1 className="hero-title">Latest Aviation Updates</h1>
                <p className="hero-subtitle">
                  Timely aviation developments, summarized in a clear editorial format.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="news-section">
        <div className="wrapper">
          <form className="news-controls" onSubmit={applySearch}>
            <div className="news-controls-row">
              <label className="news-control-field">
                <span>Search</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search title, summary, source..."
                />
              </label>

              <label className="news-control-field">
                <span>Category</span>
                <select value={filters.category} onChange={handleFilterSelect('category')}>
                  {categoryOptions.map((value) => (
                    <option key={value} value={value}>{value === 'all' ? 'All categories' : value}</option>
                  ))}
                </select>
              </label>

              <label className="news-control-field">
                <span>Source</span>
                <select value={filters.source} onChange={handleFilterSelect('source')}>
                  {sourceOptions.map((value) => (
                    <option key={value} value={value}>{value === 'all' ? 'All sources' : value}</option>
                  ))}
                </select>
              </label>

              <label className="news-control-field">
                <span>Sort</span>
                <select value={filters.sort} onChange={handleFilterSelect('sort')}>
                  <option value="latest">Latest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title-asc">Title A → Z</option>
                  <option value="title-desc">Title Z → A</option>
                </select>
              </label>
            </div>

            <div className="news-controls-actions">
              <button type="submit" className="news-btn">Apply filters</button>
              <button type="button" className="news-btn news-btn-secondary" onClick={resetFilters}>Reset</button>
            </div>
          </form>

          <div className="news-status" aria-live="polite">{status}</div>

          {loading ? <div className="news-loading">Updating feed...</div> : null}

          <div className="news-grid">
            {items.map((article) => (
              <article className="news-card" key={`${article.slug || article.link}-${article.title}`}>
                <div className="news-media">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const next = e.currentTarget.nextSibling;
                        if (next) next.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="news-media-placeholder" style={{ display: article.image ? 'none' : 'flex' }}>✈️</div>
                </div>

                <div className="news-content">
                  <span className="news-chip">{article.category || 'Positive update'}</span>
                  <h2 className="news-card-title">{article.title}</h2>
                  <p className="news-card-summary">{article.summary}</p>
                  {article.excerpt ? <p className="news-card-excerpt">{article.excerpt}</p> : null}

                  <div className="news-meta">
                    <span>{article.date}</span>
                  </div>

                  <div className="news-actions">
                    <Link
                      className="news-source-link"
                      to={article.articlePath || (article.slug ? `/news-and-resources/${article.slug}` : '/news-and-resources')}
                    >
                      Read article
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="news-pagination">
            <button
              type="button"
              className="news-btn news-btn-secondary"
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              className="news-btn"
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

export default News;
