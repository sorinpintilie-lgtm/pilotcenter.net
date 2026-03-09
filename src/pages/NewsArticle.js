import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Home.css';
import './NewsArticle.css';

const SITE_URL = 'https://pilotcenter.net';
const DEFAULT_IMAGE = `${SITE_URL}/images/fulllogo_transparent.avif`;
const DEFAULT_ROBOTS = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

function toCanonicalUrl(path = '') {
  const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;
  return `${SITE_URL}${normalizedPath}`;
}

function toIsoDate(value = '', fallback = new Date().toISOString()) {
  const parsed = new Date(value || '');
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString();
}

function buildArticleKeywords(article = {}) {
  const category = String(article.category || 'aviation').toLowerCase();
  const title = String(article.title || '').toLowerCase();
  return [
    'aviation news',
    'pilot training updates',
    'airline industry trends',
    `${category} aviation`,
    `${title} news`
  ].join(', ');
}

function buildMetaDescription(article = {}) {
  const value = String(article.summary || article.excerpt || article.body || '').replace(/\s+/g, ' ').trim();
  if (!value) return 'Latest aviation update and analysis from PilotCenter.net.';
  return value.length > 158 ? `${value.slice(0, 155).trim()}...` : value;
}

function splitArticleParagraphs(value = '') {
  const normalized = String(value || '').replace(/\r\n?/g, '\n').trim();
  if (!normalized) return [];

  const fromBreaks = normalized
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (fromBreaks.length > 1) return fromBreaks;

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (sentences.length <= 3) return fromBreaks.length ? fromBreaks : [normalized];

  const chunks = [];
  for (let index = 0; index < sentences.length; index += 3) {
    const chunk = sentences.slice(index, index + 3).join(' ').trim();
    if (chunk) chunks.push(chunk);
  }

  return chunks;
}

function buildRichArticleBlocks(article = {}) {
  const baseText = String(article.body || article.excerpt || article.summary || '').trim();
  const paragraphs = splitArticleParagraphs(baseText);
  if (!paragraphs.length) return [];

  const hasNativeQuote = paragraphs.some((paragraph) => /^\s*(>|"|“|').+/.test(paragraph));
  const blocks = [];

  paragraphs.forEach((paragraph, index) => {
    const cleaned = paragraph.replace(/^>\s*/, '').trim();
    if (!cleaned) return;

    const isQuote = /^(["“']).+(["”'])$/.test(cleaned) || /^according to\b/i.test(cleaned);
    const isSubheading = cleaned.length <= 72 && !/[.!?]$/.test(cleaned) && /^[A-Z0-9]/.test(cleaned);

    if (isSubheading) {
      blocks.push({ type: 'heading', text: cleaned });
      return;
    }

    blocks.push({
      type: isQuote ? 'quote' : 'paragraph',
      text: cleaned,
      lead: index === 0
    });
  });

  if (!hasNativeQuote && article.summary) {
    const summaryQuote = String(article.summary || '').trim();
    if (summaryQuote.length > 60) {
      blocks.splice(Math.min(1, blocks.length), 0, {
        type: 'quote',
        text: summaryQuote
      });
    }
  }

  return blocks;
}

function estimateReadTime(article = {}) {
  const text = [article.body, article.excerpt, article.summary]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

async function fetchArticleBySlug(slug) {
  const params = new URLSearchParams({ slug, refresh: '1', limit: '60' });
  const query = params.toString();
  const endpoints = [
    `/api/aviation-news?${query}`,
    `/.netlify/functions/aviation-news?${query}`
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = await response.json();
      const item = data?.item || (Array.isArray(data?.items) ? data.items[0] : null);
      if (!item) throw new Error('Article missing in payload');
      return item;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to load article');
}

export default function NewsArticle() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [status, setStatus] = useState('Loading article...');
  const isNotFoundState = !article && status && !status.toLowerCase().includes('loading');
  const canonicalPath = article?.articlePath || `/news-and-resources/${slug || ''}`;
  const canonicalUrl = toCanonicalUrl(canonicalPath);
  const metaDescription = buildMetaDescription(article || {});
  const bodyBlocks = buildRichArticleBlocks(article || {});
  const readingMinutes = estimateReadTime(article || {});

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const item = await fetchArticleBySlug(slug || '');
        if (!mounted) return;
        setArticle(item);
        setStatus('');
      } catch {
        if (!mounted) return;
        setArticle(null);
        setStatus('Article not found or temporarily unavailable.');
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <div className="page-content">
      {article ? (
        <Helmet prioritizeSeoTags>
          <title>{`${article.title} | PilotCenter.net News`}</title>
          <meta name="description" content={metaDescription} />
          <meta name="keywords" content={buildArticleKeywords(article)} />
          <meta name="robots" content={DEFAULT_ROBOTS} />
          <link rel="canonical" href={canonicalUrl} />

          <meta property="og:type" content="article" />
          <meta property="og:site_name" content="PilotCenter.net" />
          <meta property="og:locale" content="en_US" />
          <meta property="og:title" content={`${article.title} | PilotCenter.net News`} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={article.image || DEFAULT_IMAGE} />
          <meta property="og:image:alt" content={article.title || 'PilotCenter.net News'} />
          <meta property="article:published_time" content={toIsoDate(article.publishedAt || article.date)} />
          <meta property="article:modified_time" content={toIsoDate(article.updatedAt || article.publishedAt || article.date)} />
          <meta property="article:section" content={article.category || 'Aviation News'} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@pilotcenternet" />
          <meta name="twitter:title" content={`${article.title} | PilotCenter.net News`} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:image" content={article.image || DEFAULT_IMAGE} />

          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: article.title,
              description: article.summary || '',
              datePublished: toIsoDate(article.publishedAt || article.date),
              dateModified: toIsoDate(article.updatedAt || article.publishedAt || article.date),
              author: {
                '@type': 'Organization',
                name: 'PilotCenter.net'
              },
              publisher: {
                '@type': 'Organization',
                name: 'PilotCenter.net',
                logo: {
                  '@type': 'ImageObject',
                  url: `${SITE_URL}/images/fulllogo_transparent.avif`
                }
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': canonicalUrl
              },
              image: [article.image || `${SITE_URL}/images/fulllogo_transparent.avif`],
              articleSection: article.category || 'Aviation News',
              keywords: buildArticleKeywords(article),
              url: canonicalUrl,
              isAccessibleForFree: true,
              wordCount: [article.body, article.excerpt, article.summary].join(' ').split(/\s+/).filter(Boolean).length,
              timeRequired: `PT${readingMinutes}M`
            })}
          </script>
        </Helmet>
      ) : isNotFoundState ? (
        <Helmet prioritizeSeoTags>
          <title>Article Not Found | PilotCenter.net</title>
          <meta name="description" content="This news article is not available right now." />
          <meta name="robots" content="noindex,follow" />
          <link rel="canonical" href={toCanonicalUrl(`/news-and-resources/${slug || ''}`)} />
        </Helmet>
      ) : null}

      <section className="hero news-hero news-article-hero">
        <div className="wrapper">
          <div className="hero-grid">
            <div className="hero-content-wrapper">
              <div className="hero-text-content">
                <div className="hero-kicker">NEWS & RESOURCES</div>
                <h1 className="hero-title">{article?.title || 'Aviation Article'}</h1>
                <p className="hero-subtitle">{article?.summary || 'Current developments from the aviation industry.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="news-article-section">
        <div className="wrapper">
          {status ? <div className="news-article-status">{status}</div> : null}

          {article ? (
            <article className="news-article-card">
              {article.image ? (
                <div className="news-article-media">
                  <img src={article.image} alt={article.title} loading="eager" referrerPolicy="no-referrer" />
                </div>
              ) : null}

              <div className="news-article-content">
                <div className="news-article-meta">
                  <span>{article.category || 'General'}</span>
                  <span>{article.date}</span>
                  <span>{`${readingMinutes} min read`}</span>
                </div>

                {bodyBlocks.map((block, index) => {
                  if (block.type === 'heading') {
                    return (
                      <h2 className="news-article-subheading" key={`${slug}-heading-${index}`}>
                        {block.text}
                      </h2>
                    );
                  }

                  if (block.type === 'quote') {
                    return (
                      <blockquote className="news-article-quote" key={`${slug}-quote-${index}`}>
                        <p>{block.text}</p>
                        <cite>{article.source || 'PilotCenter.net Editorial Desk'}</cite>
                      </blockquote>
                    );
                  }

                  return (
                    <p
                      className={`news-article-paragraph${block.lead ? ' is-lede' : ''}`}
                      key={`${slug}-paragraph-${index}`}
                    >
                      {block.text}
                    </p>
                  );
                })}

                {!bodyBlocks.length ? <p className="news-article-paragraph is-lede">{article.excerpt || article.summary}</p> : null}

                {article.sourceLink ? (
                  <a className="news-article-source" href={article.sourceLink} target="_blank" rel="noreferrer noopener">
                    Source publication
                  </a>
                ) : null}

                <div className="news-article-actions">
                  <Link className="news-article-back" to="/news-and-resources">Back to all updates</Link>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </section>
    </div>
  );
}

