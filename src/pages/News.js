import React, { useEffect, useRef, useState } from 'react';
import './Home.css';
import './News.css';

async function fetchCuratedNews({ limit = 18, onlyNew = false, seen = [] } = {}) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (onlyNew) params.set('onlyNew', '1');
  if (seen.length) params.set('seen', seen.join(','));

  const query = params.toString();
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
        stats: data.stats || null
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to reach curated news endpoint');
}

function News() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('Loading AI-curated aviation updates...');
  const seenLinksRef = useRef(new Set());

  useEffect(() => {
    let mounted = true;
    let pollTimer = null;

    const rememberLinks = (nextItems) => {
      nextItems.forEach((item) => {
        if (item?.link) seenLinksRef.current.add(item.link);
      });
    };

    const load = async ({ onlyNew = false } = {}) => {
      try {
        const seen = Array.from(seenLinksRef.current).slice(0, 60);
        const payload = await fetchCuratedNews({
          limit: 18,
          onlyNew,
          seen
        });

        if (!mounted) return;

        const feedItems = Array.isArray(payload.items) ? payload.items : [];

        if (!onlyNew) {
          setItems(feedItems);
          rememberLinks(feedItems);
        } else if (feedItems.length) {
          setItems((current) => {
            const currentLinks = new Set(current.map((item) => item.link));
            const uniqueIncoming = feedItems.filter((item) => item.link && !currentLinks.has(item.link));
            if (!uniqueIncoming.length) return current;
            rememberLinks(uniqueIncoming);
            return [...uniqueIncoming, ...current].slice(0, 30);
          });
        }

        if (!feedItems.length && !onlyNew) {
          setStatus('No positive aviation items are available right now. Please check back soon.');
          return;
        }

        if (!feedItems.length && onlyNew) {
          return;
        }

        const filteredCount = payload?.stats?.deduped && payload?.stats?.safe
          ? Math.max(payload.stats.deduped - payload.stats.safe, 0)
          : null;

        const rewrittenNow = payload?.stats?.rewrittenNow;

        setStatus(
          onlyNew
            ? `New feed check complete: ${feedItems.length} new AI-rewritten article${feedItems.length === 1 ? '' : 's'} added.`
            : filteredCount && filteredCount > 0
              ? `Showing ${feedItems.length} AI-rewritten positive updates (${filteredCount} filtered out, ${rewrittenNow || 0} newly rewritten this cycle).`
              : `Showing ${feedItems.length} AI-rewritten positive aviation updates (${rewrittenNow || 0} newly rewritten this cycle).`
        );
      } catch {
        if (!mounted) return;
        if (!onlyNew) {
          setItems([]);
          setStatus('Unable to load AI-curated news right now. Please refresh in a moment.');
        }
      }
    };

    load({ onlyNew: false });
    pollTimer = setInterval(() => {
      load({ onlyNew: true });
    }, 120000);

    return () => {
      mounted = false;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  return (
    <div className="page-content">
      <section className="hero news-hero">
        <div className="wrapper">
          <div className="hero-grid">
            <div className="hero-content-wrapper">
              <div className="hero-text-content">
                <div className="hero-kicker">NEWS & RESOURCES</div>
                <h1 className="hero-title">Positive Aviation Updates, Automatically Curated</h1>
                <p className="hero-subtitle">
                  Live RSS feed with server-side AI rewriting and strict filtering (no war/crash topics).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="news-section">
        <div className="wrapper">
          <div className="news-status" aria-live="polite">{status}</div>

          <div className="news-grid">
            {items.map((article) => (
              <article className="news-card" key={`${article.link}-${article.title}`}>
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
                    <span>Source: {article.source}</span>
                    <span>{article.date}</span>
                  </div>

                  <div className="news-actions">
                    <a
                      className="news-source-link"
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      Read original article
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default News;
