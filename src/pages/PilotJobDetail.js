import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Home.css';
import './PilotJobDetail.css';

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

async function fetchPilotJobBySlug(slug) {
  const query = new URLSearchParams({ slug }).toString();
  const endpoints = [
    `/api/pilot-jobs?${query}`,
    `/.netlify/functions/pilot-jobs?${query}`
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = await response.json();
      if (!data?.item) throw new Error('Missing job payload');
      return data.item;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to load pilot job');
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

export default function PilotJobDetail() {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState('Loading job details...');
  const isNotFoundState = !job && status && !status.toLowerCase().includes('loading');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const item = await fetchPilotJobBySlug(slug || '');
        if (!mounted) return;
        setJob(item);
        setStatus('');
      } catch {
        if (!mounted) return;
        setJob(null);
        setStatus('Job not found or temporarily unavailable.');
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <div className="page-content">
      {job ? (
        <Helmet prioritizeSeoTags>
          <title>{`${job.title} | Pilot Jobs | PilotCenter.net`}</title>
          <meta
            name="description"
            content={job.summary || `Apply for ${job.title} at ${job.company}.`}
          />
          <meta name="robots" content={DEFAULT_ROBOTS} />
          <link rel="canonical" href={toCanonicalUrl(job.jobPath || `/latest-pilot-jobs/${slug}`)} />
          <meta property="og:type" content="article" />
          <meta property="og:site_name" content="PilotCenter.net" />
          <meta property="og:locale" content="en_US" />
          <meta property="og:title" content={`${job.title} | Pilot Jobs | PilotCenter.net`} />
          <meta property="og:description" content={job.summary || `Apply for ${job.title} at ${job.company}.`} />
          <meta property="og:url" content={toCanonicalUrl(job.jobPath || `/latest-pilot-jobs/${slug}`)} />
          <meta property="og:image" content={DEFAULT_IMAGE} />
          <meta property="og:image:alt" content={job.title || 'Pilot job listing'} />
          <meta property="article:published_time" content={toIsoDate(job.postedAt || job.firstSeenAt)} />
          <meta property="article:modified_time" content={toIsoDate(job.updatedAt || job.firstSeenAt || job.postedAt)} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${job.title} | Pilot Jobs | PilotCenter.net`} />
          <meta name="twitter:description" content={job.summary || `Apply for ${job.title} at ${job.company}.`} />
          <meta name="twitter:image" content={DEFAULT_IMAGE} />

          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JobPosting',
              title: job.title,
              description: job.description || job.summary || '',
              datePosted: toIsoDate(job.postedAt || job.firstSeenAt),
              validThrough: toIsoDate(job.expiresAt, toIsoDate(job.postedAt || job.firstSeenAt)),
              employmentType: job.employmentType || undefined,
              hiringOrganization: {
                '@type': 'Organization',
                name: job.company
              },
              jobLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: job.location,
                  addressCountry: job.country || undefined
                }
              },
              applicantLocationRequirements: job.country ? {
                '@type': 'Country',
                name: job.country
              } : undefined,
              directApply: true,
              url: toCanonicalUrl(job.jobPath || `/latest-pilot-jobs/${slug}`),
              sameAs: job.applyUrl || job.sourceUrl || undefined
            })}
          </script>
        </Helmet>
      ) : isNotFoundState ? (
        <Helmet prioritizeSeoTags>
          <title>Job Not Found | PilotCenter.net</title>
          <meta name="description" content="This pilot job listing is not available right now." />
          <meta name="robots" content="noindex,follow" />
          <link rel="canonical" href={toCanonicalUrl(`/latest-pilot-jobs/${slug || ''}`)} />
        </Helmet>
      ) : null}

      <section className="hero pilot-job-detail-hero">
        <div className="wrapper">
          <div className="hero-grid">
            <div className="hero-content-wrapper">
              <div className="hero-text-content">
                <div className="hero-kicker">PILOT JOB DETAIL</div>
                <h1 className="hero-title">{job?.title || 'Pilot Job'}</h1>
                <p className="hero-subtitle">{job?.summary || 'Real-time aviation job from verified sources.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pilot-job-detail-section">
        <div className="wrapper">
          {status ? <div className="pilot-job-detail-status">{status}</div> : null}

          {job ? (
            <article className="pilot-job-detail-card">
              <div className="pilot-job-detail-meta-grid">
                <div><strong>Company:</strong> {job.company}</div>
                <div><strong>Location:</strong> {job.location}</div>
                <div><strong>Role family:</strong> {job.roleFamily || 'Pilot'}</div>
                <div><strong>Posted:</strong> {formatDate(job.postedAt || job.firstSeenAt)}</div>
                <div><strong>Expires:</strong> {formatDate(job.expiresAt)}</div>
                <div><strong>Source:</strong> {job.sourceName || 'External source'}</div>
              </div>

              <div className="pilot-job-detail-body">
                {(String(job.description || '').trim() || String(job.summary || '').trim())
                  .split(/\n\n+/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={`${job.id || slug}-paragraph-${index}`}>{paragraph}</p>
                  ))}
              </div>

              <div className="pilot-job-detail-actions">
                <Link to="/latest-pilot-jobs" className="pilot-job-detail-back">Back to all jobs</Link>
                <a
                  href={job.applyUrl || job.sourceUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="pilot-job-detail-apply"
                >
                  Apply on source site
                </a>
              </div>
            </article>
          ) : null}
        </div>
      </section>
    </div>
  );
}

