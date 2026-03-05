import React, { useMemo, useState } from 'react';
import './AdminNewsDashboard.css';

const POSTS_PAGE_SIZE = 14;

async function adminRequest({ password, method = 'GET', body = null, action = '' }) {
  const query = action ? `?action=${encodeURIComponent(action)}` : '';
  const response = await fetch(`/api/news-admin${query}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${password}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return payload;
}

function emptyPostForm() {
  return {
    title: '',
    summary: '',
    excerpt: '',
    body: '',
    category: 'General',
    image: '',
    source: 'PilotCenter.net',
    sourceLink: ''
  };
}

function toTimestamp(post) {
  return new Date(post?.publishedAt || post?.updatedAt || post?.date || 0).getTime() || 0;
}

export default function AdminNewsDashboard() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [state, setState] = useState({ hiddenSlugs: [], manualPosts: [], adminLogs: [], updatedAt: null });
  const [postForm, setPostForm] = useState(emptyPostForm());
  const [hideSlug, setHideSlug] = useState('');
  const [status, setStatus] = useState('Login required.');
  const [busy, setBusy] = useState(false);
  const [rewrites, setRewrites] = useState([]);
  const [telemetry, setTelemetry] = useState({ counters: {}, logs: [] });
  const [editor, setEditor] = useState(null);

  const [postSearch, setPostSearch] = useState('');
  const [postType, setPostType] = useState('all');
  const [postSort, setPostSort] = useState('newest');
  const [postPage, setPostPage] = useState(1);

  const [logType, setLogType] = useState('all');

  const loadState = async (pass) => {
    const payload = await adminRequest({ password: pass, method: 'GET', action: 'dashboard' });
    setState(payload.state || { hiddenSlugs: [], manualPosts: [], adminLogs: [], updatedAt: null });
    setRewrites(Array.isArray(payload.rewrites) ? payload.rewrites : []);
    setTelemetry(payload.telemetry || { counters: {}, logs: [] });
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await loadState(password);
      setAuthed(true);
      setStatus('Admin dashboard connected.');
    } catch (error) {
      setAuthed(false);
      setStatus(error.message || 'Login failed.');
    } finally {
      setBusy(false);
    }
  };

  const submitManualPost = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = await adminRequest({
        password,
        method: 'POST',
        body: {
          action: 'create-manual',
          post: postForm
        }
      });
      setState(payload.state || state);
      setPostForm(emptyPostForm());
      setPostPage(1);
      setStatus('Manual post published.');
      await loadState(password);
    } catch (error) {
      setStatus(error.message || 'Failed to create manual post.');
    } finally {
      setBusy(false);
    }
  };

  const hideArticle = async (slug) => {
    const finalSlug = (slug || hideSlug).trim();
    if (!finalSlug) return;
    setBusy(true);
    try {
      const payload = await adminRequest({
        password,
        method: 'POST',
        body: {
          action: 'hide-slug',
          slug: finalSlug
        }
      });
      setState(payload.state || state);
      setHideSlug('');
      setStatus(`Slug hidden: ${finalSlug}`);
    } catch (error) {
      setStatus(error.message || 'Failed to hide slug.');
    } finally {
      setBusy(false);
    }
  };

  const unhideArticle = async (slug) => {
    setBusy(true);
    try {
      const payload = await adminRequest({
        password,
        method: 'POST',
        body: {
          action: 'unhide-slug',
          slug
        }
      });
      setState(payload.state || state);
      setStatus(`Slug restored: ${slug}`);
    } catch (error) {
      setStatus(error.message || 'Failed to restore slug.');
    } finally {
      setBusy(false);
    }
  };

  const deletePost = async (slug) => {
    setBusy(true);
    try {
      const payload = await adminRequest({
        password,
        method: 'DELETE',
        body: { slug }
      });
      setState(payload.state || state);
      setStatus(`Post deleted: ${slug}`);
      await loadState(password);
    } catch (error) {
      setStatus(error.message || 'Failed to delete post.');
    } finally {
      setBusy(false);
    }
  };

  const openEditor = (post) => {
    setEditor({
      slug: post.slug,
      title: post.title || '',
      summary: post.summary || '',
      excerpt: post.excerpt || '',
      body: post.body || '',
      category: post.category || 'General',
      image: post.image || '',
      source: post.source || 'PilotCenter.net',
      sourceLink: post.sourceLink || ''
    });
  };

  const saveEdit = async () => {
    if (!editor?.slug) return;
    setBusy(true);
    try {
      await adminRequest({
        password,
        method: 'POST',
        body: {
          action: 'update-post',
          post: editor
        }
      });
      await loadState(password);
      setEditor(null);
      setStatus(`Post updated: ${editor.slug}`);
    } catch (error) {
      setStatus(error.message || 'Failed to update post.');
    } finally {
      setBusy(false);
    }
  };

  const resetHidden = async () => {
    setBusy(true);
    try {
      const payload = await adminRequest({
        password,
        method: 'POST',
        body: { action: 'reset-hidden' }
      });
      setState(payload.state || state);
      setStatus('Hidden list reset.');
    } catch (error) {
      setStatus(error.message || 'Failed to reset hidden list.');
    } finally {
      setBusy(false);
    }
  };

  const clearAdminLogs = async () => {
    setBusy(true);
    try {
      const payload = await adminRequest({
        password,
        method: 'POST',
        body: { action: 'clear-admin-logs' }
      });
      setState(payload.state || state);
      setStatus('Admin activity logs cleared.');
    } catch (error) {
      setStatus(error.message || 'Failed to clear admin logs.');
    } finally {
      setBusy(false);
    }
  };

  const allPosts = useMemo(() => {
    const map = new Map();
    const manualSlugs = new Set((state.manualPosts || []).map((item) => item.slug));

    (rewrites || []).forEach((item) => {
      if (!item?.slug) return;
      map.set(item.slug, {
        ...item,
        postType: manualSlugs.has(item.slug) || item.rewriteMode === 'manual' ? 'manual' : 'rewrite'
      });
    });

    (state.manualPosts || []).forEach((item) => {
      if (!item?.slug) return;
      map.set(item.slug, {
        ...item,
        postType: 'manual'
      });
    });

    return Array.from(map.values());
  }, [rewrites, state.manualPosts]);

  const filteredPosts = useMemo(() => {
    const q = postSearch.trim().toLowerCase();
    let list = allPosts.filter((post) => {
      if (postType !== 'all' && post.postType !== postType) return false;
      if (!q) return true;

      const haystack = [
        post.title,
        post.slug,
        post.category,
        post.source,
        post.summary,
        post.excerpt,
        post.body
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });

    list = list.slice();
    list.sort((a, b) => {
      if (postSort === 'title-asc') return String(a.title || '').localeCompare(String(b.title || ''));
      if (postSort === 'title-desc') return String(b.title || '').localeCompare(String(a.title || ''));
      if (postSort === 'oldest') return toTimestamp(a) - toTimestamp(b);
      return toTimestamp(b) - toTimestamp(a);
    });

    return list;
  }, [allPosts, postSearch, postType, postSort]);

  const postTotalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PAGE_SIZE));
  const postCurrentPage = Math.min(postPage, postTotalPages);
  const visiblePosts = filteredPosts.slice((postCurrentPage - 1) * POSTS_PAGE_SIZE, postCurrentPage * POSTS_PAGE_SIZE);

  const adminLogs = useMemo(() => {
    const logs = Array.isArray(state.adminLogs) ? state.adminLogs : [];
    if (logType === 'all') return logs;
    return logs.filter((item) => String(item.event || '').toLowerCase().includes(logType));
  }, [state.adminLogs, logType]);

  return (
    <div className="admin-news-page">
      <div className="admin-news-wrapper">
        <h1>News Admin Dashboard</h1>
        <p className="admin-news-status">{status}</p>

        {!authed ? (
          <form className="admin-login-card" onSubmit={onLogin}>
            <label htmlFor="adminPassword">Admin password</label>
            <input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter dashboard password"
              required
            />
            <button type="submit" disabled={busy}>{busy ? 'Checking...' : 'Login'}</button>
          </form>
        ) : (
          <div className="admin-grid">
            <section className="admin-card">
              <h2>Add manual post</h2>
              <form onSubmit={submitManualPost} className="admin-form">
                <input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} placeholder="Title" required />
                <input value={postForm.summary} onChange={(e) => setPostForm({ ...postForm, summary: e.target.value })} placeholder="Summary" required />
                <textarea value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} placeholder="Excerpt" rows={3} />
                <textarea value={postForm.body} onChange={(e) => setPostForm({ ...postForm, body: e.target.value })} placeholder="Body (supports paragraphs)" rows={7} required />
                <input value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} placeholder="Category" />
                <input value={postForm.image} onChange={(e) => setPostForm({ ...postForm, image: e.target.value })} placeholder="Image URL" />
                <input value={postForm.source} onChange={(e) => setPostForm({ ...postForm, source: e.target.value })} placeholder="Source" />
                <input value={postForm.sourceLink} onChange={(e) => setPostForm({ ...postForm, sourceLink: e.target.value })} placeholder="Optional source URL" />
                <button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Publish post'}</button>
              </form>
            </section>

            <section className="admin-card">
              <h2>Moderation</h2>
              <div className="admin-inline">
                <input value={hideSlug} onChange={(e) => setHideSlug(e.target.value)} placeholder="article-slug" />
                <button type="button" onClick={() => hideArticle()} disabled={busy}>Hide</button>
              </div>

              <div className="admin-stack-buttons">
                <button type="button" className="admin-reset" onClick={resetHidden} disabled={busy}>Reset hidden list</button>
                <button type="button" className="admin-reset" onClick={() => loadState(password)} disabled={busy}>Refresh dashboard data</button>
              </div>

              <h3>Hidden slugs</h3>
              <ul className="admin-list">
                {(state.hiddenSlugs || []).map((slug) => (
                  <li key={slug}>
                    <code>{slug}</code>
                    <button type="button" onClick={() => unhideArticle(slug)} disabled={busy}>Unhide</button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="admin-card admin-card-wide">
              <h2>Posts</h2>
              <p className="admin-muted">Updated: {state.updatedAt || 'n/a'}</p>

              <div className="admin-toolbar">
                <input
                  value={postSearch}
                  onChange={(e) => {
                    setPostSearch(e.target.value);
                    setPostPage(1);
                  }}
                  placeholder="Search by title, slug, source, category..."
                />
                <select
                  value={postType}
                  onChange={(e) => {
                    setPostType(e.target.value);
                    setPostPage(1);
                  }}
                >
                  <option value="all">All types</option>
                  <option value="manual">Manual posts</option>
                  <option value="rewrite">Auto rewritten posts</option>
                </select>
                <select
                  value={postSort}
                  onChange={(e) => {
                    setPostSort(e.target.value);
                    setPostPage(1);
                  }}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title-asc">Title A → Z</option>
                  <option value="title-desc">Title Z → A</option>
                </select>
              </div>

              <div className="admin-post-summary">
                Showing {visiblePosts.length} of {filteredPosts.length} matching posts ({allPosts.length} total)
              </div>

              <ul className="admin-list admin-post-list">
                {visiblePosts.map((post) => (
                  <li key={post.slug}>
                    <div className="admin-post-meta">
                      <strong>{post.title}</strong>
                      <p><code>{post.slug}</code></p>
                      <p>
                        Type: <strong>{post.postType}</strong> · Mode: {post.rewriteMode || 'unknown'} · Category: {post.category || 'General'}
                      </p>
                      <p>Source: {post.source || 'Unknown'} · Date: {post.date || 'n/a'}</p>
                      <a href={post.articlePath || `/news-and-resources/${post.slug}`} target="_blank" rel="noreferrer">Open article</a>
                    </div>
                    <div className="admin-actions">
                      <button type="button" onClick={() => openEditor(post)} disabled={busy}>Edit</button>
                      <button type="button" onClick={() => hideArticle(post.slug)} disabled={busy}>Hide</button>
                      <button type="button" onClick={() => deletePost(post.slug)} disabled={busy}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="admin-pagination">
                <button
                  type="button"
                  onClick={() => setPostPage((current) => Math.max(1, current - 1))}
                  disabled={busy || postCurrentPage <= 1}
                >
                  Prev
                </button>
                <span>Page {postCurrentPage} / {postTotalPages}</span>
                <button
                  type="button"
                  onClick={() => setPostPage((current) => Math.min(postTotalPages, current + 1))}
                  disabled={busy || postCurrentPage >= postTotalPages}
                >
                  Next
                </button>
              </div>
            </section>

            <section className="admin-card admin-card-wide">
              <h2>Telemetry</h2>
              <div className="admin-kv-grid">
                {Object.entries(telemetry.counters || {}).map(([key, value]) => (
                  <div className="admin-kv" key={key}>
                    <span>{key}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))}
              </div>

              <h3>Pipeline logs</h3>
              <ul className="admin-log-list">
                {(telemetry.logs || []).map((item, index) => (
                  <li key={`${item.at || 'time'}-${index}`}>
                    <code>{item.at}</code>
                    <span>{item.event}</span>
                    <small>{JSON.stringify(item)}</small>
                  </li>
                ))}
              </ul>
            </section>

            <section className="admin-card admin-card-wide">
              <div className="admin-card-head-row">
                <h2>Admin activity logs</h2>
                <button type="button" className="admin-reset" onClick={clearAdminLogs} disabled={busy}>Clear logs</button>
              </div>

              <div className="admin-toolbar admin-toolbar-compact">
                <select value={logType} onChange={(e) => setLogType(e.target.value)}>
                  <option value="all">All events</option>
                  <option value="manual">Manual post events</option>
                  <option value="slug">Slug moderation events</option>
                  <option value="delete">Delete events</option>
                </select>
              </div>

              <ul className="admin-log-list">
                {adminLogs.map((item, index) => (
                  <li key={`${item.at || 'time'}-${index}`}>
                    <code>{item.at}</code>
                    <span>{item.event}</span>
                    <small>{item.message}</small>
                    {item.meta ? <small>{JSON.stringify(item.meta)}</small> : null}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {editor ? (
          <div className="admin-editor-overlay">
            <div className="admin-editor-card">
              <h2>Edit post</h2>
              <p className="admin-muted">{editor.slug}</p>
              <div className="admin-form">
                <input value={editor.title} onChange={(e) => setEditor({ ...editor, title: e.target.value })} placeholder="Title" />
                <input value={editor.summary} onChange={(e) => setEditor({ ...editor, summary: e.target.value })} placeholder="Summary" />
                <textarea value={editor.excerpt} onChange={(e) => setEditor({ ...editor, excerpt: e.target.value })} rows={3} placeholder="Excerpt" />
                <textarea value={editor.body} onChange={(e) => setEditor({ ...editor, body: e.target.value })} rows={8} placeholder="Body" />
                <input value={editor.category} onChange={(e) => setEditor({ ...editor, category: e.target.value })} placeholder="Category" />
                <input value={editor.image} onChange={(e) => setEditor({ ...editor, image: e.target.value })} placeholder="Image URL" />
                <input value={editor.source} onChange={(e) => setEditor({ ...editor, source: e.target.value })} placeholder="Source" />
                <input value={editor.sourceLink} onChange={(e) => setEditor({ ...editor, sourceLink: e.target.value })} placeholder="Source URL" />
              </div>

              <div className="admin-actions">
                <button type="button" onClick={saveEdit} disabled={busy}>Save changes</button>
                <button type="button" onClick={() => setEditor(null)} disabled={busy}>Cancel</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

