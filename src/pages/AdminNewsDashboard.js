import React, { useMemo, useState } from 'react';
import './AdminNewsDashboard.css';

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

export default function AdminNewsDashboard() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [state, setState] = useState({ hiddenSlugs: [], manualPosts: [], updatedAt: null });
  const [postForm, setPostForm] = useState(emptyPostForm());
  const [hideSlug, setHideSlug] = useState('');
  const [status, setStatus] = useState('Login required.');
  const [busy, setBusy] = useState(false);
  const [rewrites, setRewrites] = useState([]);
  const [telemetry, setTelemetry] = useState({ counters: {}, logs: [] });
  const [editor, setEditor] = useState(null);

  const manualPosts = useMemo(() => Array.isArray(state.manualPosts) ? state.manualPosts : [], [state.manualPosts]);

  const loadState = async (pass) => {
    const payload = await adminRequest({ password: pass, method: 'GET', action: 'dashboard' });
    setState(payload.state || { hiddenSlugs: [], manualPosts: [], updatedAt: null });
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
      setStatus('Manual post published.');
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

  const deleteManualPost = async (slug) => {
    setBusy(true);
    try {
      const payload = await adminRequest({
        password,
        method: 'DELETE',
        body: { slug }
      });
      setState(payload.state || state);
      setStatus(`Manual post deleted: ${slug}`);
    } catch (error) {
      setStatus(error.message || 'Failed to delete manual post.');
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
              <h2>Hide article slug</h2>
              <div className="admin-inline">
                <input value={hideSlug} onChange={(e) => setHideSlug(e.target.value)} placeholder="article-slug" />
                <button type="button" onClick={() => hideArticle()} disabled={busy}>Hide</button>
              </div>
              <button type="button" className="admin-reset" onClick={resetHidden} disabled={busy}>Reset hidden list</button>

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
              <h2>All rewritten posts</h2>
              <p className="admin-muted">Updated: {state.updatedAt || 'n/a'}</p>
              <ul className="admin-list">
                {rewrites.map((post) => (
                  <li key={post.slug}>
                    <div>
                      <strong>{post.title}</strong>
                      <p>{post.slug}</p>
                      <p>Mode: {post.rewriteMode || 'unknown'}</p>
                    </div>
                    <div className="admin-actions">
                      <button type="button" onClick={() => openEditor(post)} disabled={busy}>Edit</button>
                      <button type="button" onClick={() => hideArticle(post.slug)} disabled={busy}>Hide</button>
                      <button type="button" onClick={() => deleteManualPost(post.slug)} disabled={busy}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
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

              <h3>Recent logs</h3>
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

