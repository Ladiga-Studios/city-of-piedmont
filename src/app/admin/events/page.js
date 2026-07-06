'use client';

import '../admin.css';
import './ne-admin.css';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';
import {
  EVENT_CATEGORIES, eventLongDate, eventTimeRange, parseEventDate,
} from '@/lib/news-events';

const BLANK = {
  title: '', event_date: '', end_date: '', location: '',
  description: '', category: 'community', url: '', all_day: false,
};

// Turn a stored timestamp into the value a <input type="datetime-local"> wants.
function toLocalInput(value) {
  const d = parseEventDate(value);
  if (!d) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventsAdmin() {
  const supabase = createClient();
  const toast = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // 'new' | id | null
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    setList(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function startNew() { setEditing('new'); setForm(BLANK); }
  function startEdit(e) {
    setEditing(e.id);
    setForm({
      title: e.title || '',
      event_date: toLocalInput(e.event_date),
      end_date: e.end_date ? toLocalInput(e.end_date) : '',
      location: e.location || '',
      description: e.description || '',
      category: e.category || 'community',
      url: e.url || '',
      all_day: !!e.all_day,
    });
  }
  function cancel() { setEditing(null); setForm(BLANK); }
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function save(ev) {
    ev.preventDefault();
    if (!form.title.trim() || !form.event_date) {
      toast('Missing info', 'A title and start date are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing && editing !== 'new') payload.id = editing;
      const res = await fetch('/api/admin/save-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast('Saved', `Event ${editing === 'new' ? 'added' : 'updated'}.`, 'success');
      cancel();
      load();
    } catch (err) {
      toast('Save failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const e = toDelete;
    setToDelete(null);
    if (!e) return;
    try {
      const res = await fetch('/api/admin/save-event', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: e.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      toast('Deleted', `Removed \u201C${e.title}\u201D.`, 'success');
      load();
    } catch (err) {
      toast('Delete failed', err.message, 'error');
    }
  }

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const isPast = (e) => {
    const end = parseEventDate(e.end_date || e.event_date);
    return end && end < now;
  };
  const upcoming = list.filter((e) => !isPast(e));
  const past = list.filter(isPast);

  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>Events</h1>
        <p>Add and manage events shown on the public calendar and the homepage. Council meetings, festivals, and community happenings all live here.</p>
      </header>

      <div className="admin-grid">
        {/* form */}
        <div className="panel">
          <div className="panel-head">
            <h2>{editing && editing !== 'new' ? 'Edit Event' : 'Add Event'}</h2>
            {editing && <button className="am-btn" onClick={cancel}>Cancel</button>}
          </div>

          {!editing ? (
            <>
              <p className="panel-note">Create a new event, or pick one from the list to edit.</p>
              <button className="btn btn-primary" onClick={startNew} style={{ width: '100%' }}>New Event</button>
            </>
          ) : (
            <form onSubmit={save}>
              <div className="field">
                <label htmlFor="e-title">Title</label>
                <input id="e-title" type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Movies in the Park" />
              </div>

              <div className="field">
                <label htmlFor="e-cat">Category</label>
                <select id="e-cat" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {EVENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <label className="ne-check">
                <input type="checkbox" checked={form.all_day} onChange={(e) => set('all_day', e.target.checked)} />
                <span>All-day event (hide the start/end time)</span>
              </label>

              <div className="field">
                <label htmlFor="e-start">Start {form.all_day ? 'date' : 'date & time'}</label>
                <input id="e-start" type="datetime-local" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} />
              </div>

              <div className="field">
                <label htmlFor="e-end">End <span className="opt">(optional)</span></label>
                <input id="e-end" type="datetime-local" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} />
              </div>

              <div className="field">
                <label htmlFor="e-loc">Location</label>
                <input id="e-loc" type="text" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Piedmont Sports Complex" />
              </div>

              <div className="field">
                <label htmlFor="e-desc">Description</label>
                <textarea id="e-desc" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="A short description shown on the calendar." />
              </div>

              <div className="field">
                <label htmlFor="e-url">More-info link <span className="opt">(optional)</span></label>
                <input id="e-url" type="url" value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://..." />
              </div>

              <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
                {saving ? 'Saving\u2026' : (editing === 'new' ? 'Add Event' : 'Save Changes')}
              </button>
            </form>
          )}
        </div>

        {/* list */}
        <div className="panel">
          <div className="panel-head">
            <h2>Events</h2>
            <span className="count-pill">{upcoming.length} upcoming &middot; {past.length} past</span>
          </div>

          {loading ? (
            <p className="muted-note">Loading&hellip;</p>
          ) : list.length === 0 ? (
            <p className="muted-note">No events yet. Add your first one.</p>
          ) : (
            <div className="ne-groups">
              <EventGroup heading="Upcoming" rows={upcoming} onEdit={startEdit} onDelete={setToDelete} editingId={editing} />
              {past.length > 0 && <EventGroup heading="Past" rows={past} onEdit={startEdit} onDelete={setToDelete} editingId={editing} dim />}
            </div>
          )}
        </div>
      </div>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this event?">
        <p style={{ color: 'var(--ink-2)', marginBottom: '1.4rem' }}>
          This permanently removes <strong>{toDelete?.title}</strong>. This can&rsquo;t be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function EventGroup({ heading, rows, onEdit, onDelete, editingId, dim }) {
  return (
    <div className="ne-group">
      <h3 className="ne-group-label">{heading} <span>{rows.length}</span></h3>
      <div className={`ne-items${dim ? ' ne-dim' : ''}`}>
        {rows.map((e) => (
          <div key={e.id} className={`ne-item${editingId === e.id ? ' editing' : ''}`}>
            <div className="ne-main">
              <strong>{e.title}</strong>
              <div className="ne-meta">
                <span>{eventLongDate(e.event_date)}</span>
                <span>&middot;</span>
                <span>{eventTimeRange(e.event_date, e.end_date, e.all_day)}</span>
                {e.location && <><span>&middot;</span><span>{e.location}</span></>}
                {e.is_sample && <span className="ne-tag">Sample</span>}
              </div>
            </div>
            <div className="ne-actions">
              <button className="na-btn" onClick={() => onEdit(e)}>Edit</button>
              <button className="am-del" onClick={() => onDelete(e)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
