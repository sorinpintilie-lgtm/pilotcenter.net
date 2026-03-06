import React, { useEffect, useMemo, useState } from 'react';
import './Home.css';
import './PilotJobs.css';

function toTitleCase(value = '') {
  const text = String(value || '').trim();
  if (!text) return 'Unknown';
  return text
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatStamp(value = '') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'Unknown time';
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

function logDebug(step = '', meta = {}) {
  try {
    // eslint-disable-next-line no-console
    console.log(`[PilotJobsLogs] ${step}`, meta);
  } catch {
    // ignore logging failures
  }
}

function maskToken(value = '') {
  const text = String(value || '');
  if (text.length <= 6) return '***';
  return `${text.slice(0, 3)}***${text.slice(-2)}`;
}

async function fetchLogsFeed(token = '', limit = 240) {
  const params = new URLSearchParams({
    action: 'logs-feed',
    token,
    limit: String(limit)
  });

  const endpoints = [
    `/api/pilot-jobs?${params.toString()}`,
    `/.netlify/functions/pilot-jobs?${params.toString()}`
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const payload = await response.json();
      if (!payload?.ok || !Array.isArray(payload.logs)) throw new Error('Invalid logs payload');
      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to fetch logs feed');
}

function logFingerprint(entries = []) {
  const first = Array.isArray(entries) && entries.length ? entries[0] : null;
  if (!first) return 'empty';
  return `${String(first.at || '')}|${String(first.event || '')}|${String(first.message || '')}`;
}

async function probeLogsProgress(token = '', previousFingerprint = '', startedAfterMs = 0, attempts = 3, waitMs = 2200) {
  for (let i = 0; i < attempts; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    try {
      const payload = await fetchLogsFeed(token, 280);
      const currentFingerprint = logFingerprint(payload.logs || []);
      const hasFreshSyncStart = Array.isArray(payload.logs) && payload.logs.some((entry) => {
        const event = String(entry?.event || '').toLowerCase();
        if (event !== 'sync:start') return false;
        const atMs = new Date(entry?.at || '').getTime();
        return Number.isFinite(atMs) && atMs >= startedAfterMs - 5000;
      });

      if (currentFingerprint !== previousFingerprint || hasFreshSyncStart) {
        return {
          progressed: true,
          payload
        };
      }
    } catch {
      // keep probing
    }
  }

  return {
    progressed: false,
    payload: null
  };
}

export default function PilotJobsLogs() {
  const [token, setToken] = useState('');
  const [pendingToken, setPendingToken] = useState('');
  const [logs, setLogs] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [status, setStatus] = useState('Enter admin token to inspect crawler activity.');
  const [loading, setLoading] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [triggerStatus, setTriggerStatus] = useState('');
  const [triggerLoading, setTriggerLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const payload = await fetchLogsFeed(token, 280);
        if (!mounted) return;

        setLogs(Array.isArray(payload.logs) ? payload.logs : []);
        setStoreInfo(payload.store || null);
        setLastUpdatedAt(new Date().toISOString());
        setStatus(`Loaded ${payload.logs.length} log entries. Generated at ${formatStamp(payload.generatedAt)}.`);
      } catch {
        if (!mounted) return;
        setLogs([]);
        setStoreInfo(null);
        setStatus('Unable to load logs. Verify the admin token and try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const timer = setInterval(() => {
      load();
    }, 4500);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [token]);

  const submitToken = (event) => {
    event.preventDefault();
    setToken(pendingToken.trim());
  };

  const triggerCrawlNow = async () => {
    if (!token.trim()) {
      setTriggerStatus('Add admin token first.');
      return;
    }

    setTriggerLoading(true);
    setTriggerStatus('Submitting Perplexity-first crawl request...');

    const options = {
      sourceLimit: 20,
      maxPagesPerSource: 80,
      maxDepth: 4,
      perplexityBudgetPerSource: 220,
      perplexityMinConfidence: 0.72,
      logToConsole: true,
      forcePerplexityStrict: true
    };

    const tokenValue = token.trim();
    const previousFingerprint = logFingerprint(logs);
    const startedAtMs = Date.now();
    const tokenQuery = `token=${encodeURIComponent(tokenValue)}`;

    logDebug('trigger:start', {
      token: maskToken(tokenValue),
      options,
      previousFingerprint,
      startedAt: new Date(startedAtMs).toISOString()
    });

    const requestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenValue}`,
        'X-Pilot-Jobs-Token': tokenValue
      },
      body: JSON.stringify({ options })
    };

    const endpoints = [
      `/api/pilot-jobs-sync-background?${tokenQuery}`,
      `/.netlify/functions/pilot-jobs-sync-background?${tokenQuery}`
    ];

    let success = false;
    let failureDetails = '';

    for (const endpoint of endpoints) {
      try {
        logDebug('trigger:request', { endpoint, method: requestInit.method });
        const response = await fetch(endpoint, requestInit);
        const text = await response.text();
        logDebug('trigger:response', {
          endpoint,
          status: response.status,
          ok: response.ok,
          bodyPreview: String(text || '').slice(0, 280)
        });

        let payload = null;
        try {
          payload = JSON.parse(text);
        } catch {
          payload = null;
          logDebug('trigger:response-json-parse-failed', { endpoint });
        }

        if (response.status === 202) {
          logDebug('trigger:background-accepted', { endpoint });
          const probe = await probeLogsProgress(tokenValue, previousFingerprint, startedAtMs, 4, 2200);
          logDebug('trigger:probe-result', {
            endpoint,
            progressed: probe.progressed,
            logsCount: Array.isArray(probe?.payload?.logs) ? probe.payload.logs.length : 0
          });

          if (probe.progressed) {
            setLogs(Array.isArray(probe.payload?.logs) ? probe.payload.logs : []);
            setStoreInfo(probe.payload?.store || null);
            setLastUpdatedAt(new Date().toISOString());
            success = true;
            setTriggerStatus(`Background crawl confirmed via ${endpoint}. New logs are streaming below.`);
            break;
          }

          const directFallbackEndpoints = [
            `/api/pilot-jobs?${tokenQuery}`,
            `/.netlify/functions/pilot-jobs?${tokenQuery}`
          ];

          let fallbackTriggered = false;
          for (const fallbackEndpoint of directFallbackEndpoints) {
            try {
              logDebug('trigger:fallback-request', {
                endpoint: fallbackEndpoint,
                method: 'POST',
                action: 'sync'
              });

              const fallbackResponse = await fetch(fallbackEndpoint, {
                method: 'POST',
                headers: requestInit.headers,
                body: JSON.stringify({
                  action: 'sync',
                  options: {
                    ...options,
                    sourceLimit: 1,
                    maxPagesPerSource: 8,
                    maxDepth: 2,
                    perplexityBudgetPerSource: 18
                  }
                })
              });

              const fallbackText = await fallbackResponse.text();
              logDebug('trigger:fallback-response', {
                endpoint: fallbackEndpoint,
                status: fallbackResponse.status,
                ok: fallbackResponse.ok,
                bodyPreview: String(fallbackText || '').slice(0, 280)
              });

              let fallbackPayload = null;
              try {
                fallbackPayload = JSON.parse(fallbackText);
              } catch {
                fallbackPayload = null;
                logDebug('trigger:fallback-json-parse-failed', { endpoint: fallbackEndpoint });
              }

              if (fallbackResponse.ok && fallbackPayload?.ok) {
                fallbackTriggered = true;
                const refreshed = await fetchLogsFeed(tokenValue, 280).catch(() => null);
                if (refreshed?.logs) {
                  setLogs(refreshed.logs);
                  setStoreInfo(refreshed.store || null);
                  setLastUpdatedAt(new Date().toISOString());
                }
                setTriggerStatus(`Background queue was accepted but inactive; direct sync fallback started via ${fallbackEndpoint}.`);
                logDebug('trigger:fallback-started', {
                  endpoint: fallbackEndpoint,
                  refreshedLogs: Array.isArray(refreshed?.logs) ? refreshed.logs.length : 0
                });
                break;
              }

              failureDetails = fallbackPayload?.details
                || fallbackPayload?.error
                || `Fallback ${fallbackEndpoint} returned ${fallbackResponse.status}.`;
              logDebug('trigger:fallback-failed', {
                endpoint: fallbackEndpoint,
                failureDetails
              });
            } catch {
              failureDetails = `Fallback network failure calling ${fallbackEndpoint}.`;
              logDebug('trigger:fallback-network-failure', {
                endpoint: fallbackEndpoint,
                failureDetails
              });
            }
          }

          if (fallbackTriggered) {
            success = true;
            break;
          }

          failureDetails = 'Background request accepted but no crawler activity was detected.';
          continue;
        }

        if (!response.ok) {
          failureDetails = payload?.details
            || payload?.error
            || (text ? `Endpoint ${endpoint} returned ${response.status}: ${text.slice(0, 220)}` : `Endpoint ${endpoint} returned ${response.status}.`);
          logDebug('trigger:failed-response', { endpoint, failureDetails });
          continue;
        }

        if (payload && payload.ok === false) {
          failureDetails = payload.details || payload.error || `Endpoint ${endpoint} returned a failure payload.`;
          logDebug('trigger:failed-payload', { endpoint, failureDetails });
          continue;
        }

        success = true;
        setTriggerStatus(`Crawl started via ${endpoint}. Watch live logs below as jobs are found and stored.`);
        logDebug('trigger:success', { endpoint });
        break;
      } catch {
        failureDetails = `Network failure calling ${endpoint}.`;
        logDebug('trigger:network-failure', { endpoint, failureDetails });
      }
    }

    if (!success) {
      setTriggerStatus(`Unable to trigger crawl. ${failureDetails || 'No valid endpoint response.'}`);
      logDebug('trigger:final-failure', { failureDetails });
    } else {
      logDebug('trigger:final-success');
    }

    setTriggerLoading(false);
  };

  const sourceOptions = useMemo(() => {
    const values = logs
      .map((entry) => String(entry.sourceName || '').trim())
      .filter(Boolean);
    return ['all', ...Array.from(new Set(values))];
  }, [logs]);

  const filteredLogs = useMemo(() => logs.filter((entry) => {
    if (levelFilter !== 'all' && String(entry.level || '').toLowerCase() !== levelFilter) return false;
    if (sourceFilter !== 'all' && String(entry.sourceName || '') !== sourceFilter) return false;
    return true;
  }), [logs, levelFilter, sourceFilter]);

  return (
    <div className="page-content">
      <section className="hero pilot-jobs-hero">
        <div className="wrapper">
          <div className="hero-grid">
            <div className="hero-content-wrapper">
              <div className="hero-text-content">
                <div className="hero-kicker">PILOT JOBS LOGS</div>
                <h1 className="hero-title">Crawler & Perplexity Activity Feed</h1>
                <p className="hero-subtitle">
                  Human-readable operational logs for crawling, curation, and storage state.
                </p>
                <div className="pilot-jobs-hero-meta">
                  <span>Total entries: <strong>{logs.length}</strong></span>
                  <span>Visible entries: <strong>{filteredLogs.length}</strong></span>
                  <span>
                    Store: <strong>{storeInfo?.backend || 'unknown'}</strong>
                  </span>
                  <span>
                    Blobs: <strong>{storeInfo?.blobsConfigured ? 'configured' : 'not configured'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pilot-jobs-section">
        <div className="wrapper">
          <form className="pilot-jobs-controls" onSubmit={submitToken}>
            <div className="pilot-jobs-controls-row pilot-jobs-logs-controls-row">
              <label className="pilot-jobs-control-field">
                <span>Admin token</span>
                <input
                  type="password"
                  value={pendingToken}
                  onChange={(event) => setPendingToken(event.target.value)}
                  placeholder="Enter PILOT_JOBS_ADMIN_TOKEN"
                />
              </label>

              <label className="pilot-jobs-control-field">
                <span>Level</span>
                <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
                  <option value="all">All levels</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </label>

              <label className="pilot-jobs-control-field">
                <span>Source</span>
                <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
                  {sourceOptions.map((value) => (
                    <option key={value} value={value}>{value === 'all' ? 'All sources' : value}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="pilot-jobs-controls-actions">
              <button type="submit" className="pilot-jobs-btn">Load logs</button>
              {token ? (
                <button
                  type="button"
                  className="pilot-jobs-btn"
                  onClick={triggerCrawlNow}
                  disabled={triggerLoading}
                >
                  {triggerLoading ? 'Starting crawl...' : 'Start Perplexity Crawl'}
                </button>
              ) : null}
              {token ? (
                <button
                  type="button"
                  className="pilot-jobs-btn pilot-jobs-btn-secondary"
                  onClick={() => setToken((current) => current)}
                >
                  Refresh now
                </button>
              ) : null}
            </div>
          </form>

          {triggerStatus ? <div className="pilot-jobs-status" aria-live="polite">{triggerStatus}</div> : null}

          <div className="pilot-jobs-status" aria-live="polite">{status}</div>
          {lastUpdatedAt ? (
            <div className="pilot-jobs-loading">Auto-refresh every ~4.5s · Last update: {formatStamp(lastUpdatedAt)}</div>
          ) : null}

          {loading ? <div className="pilot-jobs-loading">Loading logs feed...</div> : null}

          <div className="pilot-jobs-logs-list">
            {filteredLogs.map((entry, index) => (
              <article className={`pilot-jobs-log-card pilot-jobs-log-${String(entry.level || 'info').toLowerCase()}`} key={`${entry.at}-${entry.event}-${index}`}>
                <header className="pilot-jobs-log-header">
                  <div className="pilot-jobs-log-pill-wrap">
                    <span className="pilot-jobs-log-pill">{toTitleCase(entry.level)}</span>
                    <span className="pilot-jobs-log-pill pilot-jobs-log-pill-event">{entry.event || 'unknown'}</span>
                  </div>
                  <div className="pilot-jobs-log-time">{formatStamp(entry.at)}</div>
                </header>

                <h2 className="pilot-jobs-log-message">{entry.message || 'No details provided'}</h2>
                <p className="pilot-jobs-log-readable">{entry.readable || ''}</p>

                <div className="pilot-jobs-log-source">Source: {entry.sourceName || 'Global sync'}</div>

                {entry.meta && Object.keys(entry.meta).length ? (
                  <pre className="pilot-jobs-log-meta">{JSON.stringify(entry.meta, null, 2)}</pre>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

