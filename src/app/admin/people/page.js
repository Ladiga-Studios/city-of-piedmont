'use client';

// /admin/people — manage everyone shown on the site: the Mayor and
// council members (council page) and department staff (department
// pages, Civic Center). Add, edit, or remove a person and the public
// pages update within a minute — no code changes needed.

import '../admin.css';
import './people-admin.css';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';
import ImageUploader from '@/components/ImageUploader';
import { DEPARTMENTS } from '@/lib/departments';

// Places a staff member can be assigned to. Departments come from the
// site's department list, plus the Civic Center.
const PLACES = [
  ...DEPARTMENTS.map((d) => ({ slug: d.slug, name: d.name })),
  { slug: 'civic-center', name: 'Clyde H. Pike Civic Center' },
];

// Departments whose page has sub-offices with their own staff lists
// (Public Safety → Police Department / Fire Department, etc.). A person
// can be placed in one of those instead of the department's main list.
const OFFICES = Object.fromEntries(
  DEPARTMENTS.filter((d) => d.offices?.length).map((d) => [d.slug, d.offices.map((o) => o.name)])
);

const EMPTY = {
  id: null,
  name: '',
  role: '',
  group_type: 'staff',
  department_slug: PLACES[0].slug,
  office: '',
  sort_order: 100,
  email: '',
  phone: '',
  bio: '',
  photo_url: '',
  featured: false,
};

export default function PeopleAdmin() {
  const supabase = createClient();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setInput = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('group_type', { ascending: true })
      .order('department_slug', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) {
      setTableMissing(true);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const council = useMemo(() => items.filter((p) => p.group_type === 'council'), [items]);
  const staffByPlace = useMemo(() => {
    const map = new Map();
    for (const p of items.filter((x) => x.group_type === 'staff')) {
      const key = p.office ? `${p.department_slug || 'unassigned'}::${p.office}` : (p.department_slug || 'unassigned');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    return map;
  }, [items]);

  function placeName(key) {
    const [slug, office] = String(key).split('::');
    const name = PLACES.find((p) => p.slug === slug)?.name || slug || 'Unassigned';
    return office ? `${name} · ${office}` : name;
  }

  function startEdit(p) {
    setForm({
      id: p.id,
      name: p.name || '',
      role: p.role || '',
      group_type: p.group_type || 'staff',
      department_slug: p.department_slug || PLACES[0].slug,
      office: p.office || '',
      sort_order: p.sort_order ?? 100,
      email: p.email || '',
      phone: p.phone || '',
      bio: p.bio || '',
      photo_url: p.photo_url || '',
      featured: !!p.featured,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm(EMPTY);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      toast('Missing info', 'A name and a role/title are both required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const row = {
        name: form.name.trim(),
        role: form.role.trim(),
        group_type: form.group_type,
        department_slug: form.group_type === 'staff' ? form.department_slug : null,
        office: form.group_type === 'staff' && OFFICES[form.department_slug]?.includes(form.office) ? form.office : null,
        sort_order: Number(form.sort_order) || 100,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null,
        photo_url: form.photo_url || null,
        featured: form.group_type === 'council' ? form.featured : false,
      };
      const q = form.id
        ? supabase.from('people').update(row).eq('id', form.id)
        : supabase.from('people').insert(row);
      const { error } = await q;
      if (error) throw error;
      toast(form.id ? 'Saved' : 'Added', `${row.name} is now live on the site.`, 'success');
      resetForm();
      load();
    } catch (err) {
      toast('Save failed', err.message || 'Could not save.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const p = toDelete;
    setToDelete(null);
    if (!p) return;
    try {
      const { error } = await supabase.from('people').delete().eq('id', p.id);
      if (error) throw error;
      if (form.id === p.id) resetForm();
      toast('Removed', `${p.name} no longer appears on the site.`, 'success');
      load();
    } catch (err) {
      toast('Delete failed', err.message || 'Could not delete.', 'error');
    }
  }

  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>People</h1>
        <p>
          Everyone shown on the site — the Mayor and council on the Council page, and staff on each
          department page. Changes go live within a minute.
        </p>
      </header>

      {tableMissing && (
        <div className="pa-setup">
          <strong>One-time setup needed.</strong> The people table hasn&rsquo;t been created yet — run
          <code> supabase-add-people-documents.sql</code> in the Supabase SQL editor, then reload this page.
        </div>
      )}

      <div className="admin-grid">
        {/* ---------- Add / edit panel ---------- */}
        <div className="panel">
          <div className="panel-head">
            <h2>{form.id ? 'Edit person' : 'Add a person'}</h2>
            {form.id && (
              <button type="button" className="pa-clear" onClick={resetForm}>+ New person instead</button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className="field">
              <label>Where they appear</label>
              <div className="upload-tabs" role="tablist" aria-label="Council or department staff">
                <button
                  type="button" role="tab"
                  aria-selected={form.group_type === 'staff'}
                  className={`upload-tab ${form.group_type === 'staff' ? 'active' : ''}`}
                  onClick={() => set('group_type')('staff')}
                >Department Staff</button>
                <button
                  type="button" role="tab"
                  aria-selected={form.group_type === 'council'}
                  className={`upload-tab ${form.group_type === 'council' ? 'active' : ''}`}
                  onClick={() => set('group_type')('council')}
                >Mayor &amp; Council</button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="p-name">Name</label>
              <input id="p-name" type="text" value={form.name} onChange={setInput('name')} placeholder="e.g. Patti Byers" />
            </div>

            <div className="field">
              <label htmlFor="p-role">Role / title</label>
              <input
                id="p-role" type="text" value={form.role} onChange={setInput('role')}
                placeholder={form.group_type === 'council' ? 'e.g. District 3' : 'e.g. Utility Clerk'}
              />
            </div>

            {form.group_type === 'staff' ? (
              <div className="field">
                <label htmlFor="p-dept">Department</label>
                <select id="p-dept" value={form.department_slug} onChange={setInput('department_slug')}>
                  {PLACES.map((pl) => <option key={pl.slug} value={pl.slug}>{pl.name}</option>)}
                </select>
                <span className="field-help">They&rsquo;ll show in the Staff list on this department&rsquo;s page.</span>
              </div>
            ) : null}

            {form.group_type === 'staff' && OFFICES[form.department_slug] ? (
              <div className="field">
                <label htmlFor="p-office">Office on that page</label>
                <select id="p-office" value={form.office} onChange={setInput('office')}>
                  <option value="">Main staff list</option>
                  {OFFICES[form.department_slug].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <span className="field-help">Public Safety, for example, lists the Police and Fire departments separately.</span>
              </div>
            ) : form.group_type === 'staff' ? null : (
              <div className="field">
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => set('featured')(e.target.checked)}
                  />
                  This is the Mayor (featured card at the top)
                </label>
              </div>
            )}

            <div className="pa-two">
              <div className="field">
                <label htmlFor="p-email">Email <span className="opt">(optional)</span></label>
                <input id="p-email" type="email" value={form.email} onChange={setInput('email')} placeholder="name@piedmontcity.org" />
              </div>
              <div className="field">
                <label htmlFor="p-phone">Phone <span className="opt">(optional)</span></label>
                <input id="p-phone" type="text" value={form.phone} onChange={setInput('phone')} placeholder="(256) 447-3560" />
              </div>
            </div>

            {form.group_type === 'council' && (
              <div className="field">
                <label htmlFor="p-bio">Short bio <span className="opt">(optional)</span></label>
                <textarea
                  id="p-bio" rows={4} value={form.bio} onChange={setInput('bio')}
                  placeholder="A paragraph or two so residents can get to know them. Shows under their photo on the Council page."
                />
              </div>
            )}

            <div className="field">
              <label>Photo <span className="opt">(optional)</span></label>
              <ImageUploader
                value={form.photo_url}
                onChange={set('photo_url')}
                endpoint="/api/admin/upload-person-photo"
                extra={{ name: form.name || 'person' }}
                label="Headshot, roughly portrait orientation. JPG or PNG."
              />
            </div>

            <div className="field">
              <label htmlFor="p-sort">List position <span className="opt">(lower = earlier)</span></label>
              <input id="p-sort" type="number" value={form.sort_order} onChange={setInput('sort_order')} />
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
              {saving ? 'Saving\u2026' : form.id ? 'Save changes' : 'Add person'}
            </button>
          </form>
        </div>

        {/* ---------- Current people ---------- */}
        <div className="panel">
          <div className="panel-head">
            <h2>On the site now</h2>
            <span className="count-pill">{items.length} people</span>
          </div>

          {loading ? (
            <p className="muted-note">Loading&hellip;</p>
          ) : items.length === 0 ? (
            <p className="muted-note">
              No one yet. The public pages are showing their built-in lists — add people here to take over.
            </p>
          ) : (
            <div className="na-groups">
              <PaGroup
                heading="Mayor & Council"
                rows={council}
                onEdit={startEdit}
                onDelete={setToDelete}
              />
              {[...staffByPlace.entries()].map(([slug, rows]) => (
                <PaGroup
                  key={slug}
                  heading={placeName(slug)}
                  rows={rows}
                  onEdit={startEdit}
                  onDelete={setToDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Delete confirmation ---------- */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Remove this person?">
        <p style={{ color: 'var(--ink-2)', marginBottom: '1.4rem' }}>
          <strong>{toDelete?.name}</strong> ({toDelete?.role}) will be removed from the public site.
          This can&rsquo;t be undone, but you can always add them back.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete}>Remove</button>
        </div>
      </Modal>
    </div>
  );
}

function PaGroup({ heading, rows, onEdit, onDelete }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="na-group">
      <h3 className="na-group-label">{heading} <span>{rows.length}</span></h3>
      <div className="na-items">
        {rows.map((p) => (
          <div key={p.id} className="na-item">
            <div className="pa-person">
              {p.photo_url
                ? <img className="pa-avatar" src={p.photo_url} alt="" />
                : <span className="pa-avatar pa-avatar-empty" aria-hidden="true">{(p.name || '?').slice(0, 1)}</span>}
              <div className="na-main">
                <strong>{p.name}{p.featured ? ' \u2605' : ''}</strong>
                <div className="na-meta">
                  <span>{p.role}</span>
                  {p.email && <span>{p.email}</span>}
                  {p.phone && <span>{p.phone}</span>}
                  {p.group_type === 'council' && p.bio && <span className="na-tag open">Bio added</span>}
                </div>
              </div>
            </div>
            <div className="na-actions">
              <button className="na-btn" onClick={() => onEdit(p)}>Edit</button>
              <button className="am-del" onClick={() => onDelete(p)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
