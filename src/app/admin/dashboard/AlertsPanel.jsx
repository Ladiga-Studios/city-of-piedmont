'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';

const SEVERITIES = [
  { value: 'emergency', label: 'Emergency (red)' },
  { value: 'advisory',  label: 'Advisory (amber)' },
  { value: 'info',      label: 'Notice (blue)' },
];

export default function AlertsPanel() {
  const supabase = createClient();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [severity, setSeverity] = useState('info');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [posting, setPosting] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    setAlerts(data || []);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function post(e) {
    e.preventDefault();
    if (!title.trim()) { toast('Missing title', 'Give the alert a short title.', 'error'); return; }
    setPosting(true);
    try {
      const { error } = await supabase.from('notices').insert({
        title: title.trim(),
        body: body.trim() || null,
        severity,
        is_active: true,
        link_url: linkUrl.trim() || null,
        link_label: linkLabel.trim() || null,
      });
      if (error) throw error;
      toast('Alert posted', 'It\u2019s now showing at the top of the site.', 'success');
      setTitle(''); setBody(''); setSeverity('info'); setLinkUrl(''); setLinkLabel('');
      load();
    } catch (err) {
      toast('Could not post', err.message, 'error');
    } finally {
      setPosting(false);
    }
  }

  async function toggleActive(a) {
    const { error } = await supabase.from('notices').update({ is_active: !a.is_active }).eq('id', a.id);
    if (error) { toast('Update failed', error.message, 'error'); return; }
    toast(a.is_active ? 'Alert hidden' : 'Alert shown', a.is_active ? 'No longer on the site.' : 'Now visible on the site.', 'success');
    load();
  }

  async function confirmDelete() {
    const a = toDelete; setToDelete(null);
    if (!a) return;
    const { error } = await supabase.from('notices').delete().eq('id', a.id);
    if (error) { toast('Delete failed', error.message, 'error'); return; }
    toast('Deleted', 'Alert removed.', 'success');
    load();
  }

  const activeCount = alerts.filter((a) => a.is_active).length;

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Site Alerts</h2>
        <span className="count-pill">{activeCount} active</span>
      </div>
      <p className="panel-note">
        Posts a banner to the top of the whole site for closures, advisories,
        and emergencies. Hide it when it&rsquo;s over (or delete it).
      </p>

      <form onSubmit={post}>
        <div className="field">
          <label htmlFor="al-sev">Type</label>
          <select id="al-sev" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="al-title">Title</label>
          <input id="al-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Boil-water advisory in effect" />
        </div>
        <div className="field">
          <label htmlFor="al-body">Details (optional)</label>
          <input id="al-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Affecting North Center Ave until further notice." />
        </div>
        <div className="field">
          <label htmlFor="al-url">Link (optional)</label>
          <input id="al-url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
        </div>
        <button className="btn btn-primary" type="submit" disabled={posting} style={{ width: '100%' }}>
          {posting ? 'Posting\u2026' : 'Post Alert'}
        </button>
      </form>

      {alerts.length > 0 && (
        <div className="alert-list" style={{ marginTop: 'var(--s3)' }}>
          {alerts.map((a) => (
            <div key={a.id} className={`al-item ${a.is_active ? '' : 'inactive'}`}>
              <div className="al-main">
                <span className={`al-dot al-${a.severity}`} aria-hidden="true" />
                <div>
                  <strong>{a.title}</strong>
                  <div className="al-meta">{a.is_active ? 'Showing on site' : 'Hidden'}</div>
                </div>
              </div>
              <div className="al-actions">
                <button className="am-btn" onClick={() => toggleActive(a)}>
                  {a.is_active ? 'Hide' : 'Show'}
                </button>
                <button className="am-del" onClick={() => setToDelete(a)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this alert?">
        <p style={{ color: 'var(--ink-2)', marginBottom: '1.4rem' }}>
          Permanently remove <strong>{toDelete?.title}</strong>?
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
