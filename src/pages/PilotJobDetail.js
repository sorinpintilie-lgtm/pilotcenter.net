import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Home.css';
import './PilotJobDetail.css';

const SITE_URL = 'https://pilotcenter.net';

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
        <Helmet>
          <title>{`${job.title} | Pilot Jobs | PilotCenter.net`}</title>
          <meta
            name="description"
            content={job.summary || `Apply for ${job.title} at ${job.company}.`}
          />
          <link rel="canonical" href={`${SITE_URL}${job.jobPath || `/latest-pilot-jobs/${slug}`}`} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={`${job.title} | Pilot Jobs | PilotCenter.net`} />
          <meta property="og:description" content={job.summary || `Apply for ${job.title} at ${job.company}.`} />
          <meta property="og:url" content={`${SITE_URL}${job.jobPath || `/latest-pilot-jobs/${slug}`}`} />

          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JobPosting',
              title: job.title,
              description: job.description || job.summary || '',
              datePosted: job.postedAt || job.firstSeenAt,
              validThrough: job.expiresAt,
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
              directApply: true,
              url: job.applyUrl || job.sourceUrl
            })}
          </script>
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

