'use client';

import '../admin.css';
import './businesses-admin.css';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';
import ImageUploader from '@/components/ImageUploader';
import ImageCropper from '@/components/ImageCropper';
import { BUSINESS_CATEGORIES, slugify } from '@/lib/business';

const BLANK = {
  name: '', slug: '', category: 'Dining', tagline: '', description: '',
  address: '', phone: '', email: '', website: '', facebook: '', instagram: '',
  lat: '', lng: '', image_url: '', image_crop: null, gallery: [], hours: [], approved: false, featured: false,
};

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function BusinessesAdmin() {
  const supabase = createClient();
  const toast = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);  // the business object being edited, or null
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geoMsg, setGeoMsg] = useState(null); // { ok, text }

  const load = useCallback(async () => {
    const { data } = await supabase.from('businesses').select('*').order('name');
    setList(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function startNew() {
    setEditing('new');
    setForm({ ...BLANK, hours: DAYS.map((d) => ({ day: d, open: '', close: '', note: '' })) });
  }
  function startEdit(b) {
    setEditing(b.id);
    // Supabase returns null for empty columns; coerce nullable text fields to '' so inputs stay controlled
    const s = (v) => v ?? '';
    setForm({
      ...BLANK, ...b,
      tagline: s(b.tagline), description: s(b.description), address: s(b.address),
      phone: s(b.phone), email: s(b.email), website: s(b.website),
      facebook: s(b.facebook), instagram: s(b.instagram), slug: s(b.slug),
      lat: b.lat ?? '', lng: b.lng ?? '',
      gallery: Array.isArray(b.gallery) ? b.gallery : [],
      image_crop: b.image_crop || null,
      hours: Array.isArray(b.hours) && b.hours.length ? b.hours : DAYS.map((d) => ({ day: d, open: '', close: '', note: '' })),
    });
  }
  function cancel() { setEditing(null); setForm(BLANK); }

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function findOnMap() {
    const address = (form.address || '').trim();
    if (!address) { setGeoMsg({ ok: false, text: 'Enter an address first.' }); return; }
    setGeocoding(true);
    setGeoMsg(null);
    try {
      const res = await fetch('/api/admin/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lookup failed');
      setForm((f) => ({
        ...f,
        lat: String(data.lat),
        lng: String(data.lng),
        // If the typed address was partial, upgrade it to Google's clean version.
        address: data.formatted || f.address,
      }));
      setGeoMsg({ ok: true, text: 'Found it! Map pin set. Adjust the address above if needed.' });
      toast('Location found', 'Map coordinates filled in.', 'success');
    } catch (err) {
      setGeoMsg({ ok: false, text: err.message });
    } finally {
      setGeocoding(false);
    }
  }
  function setHour(i, k, v) {
    setForm((f) => ({ ...f, hours: f.hours.map((h, idx) => idx === i ? { ...h, [k]: v } : h) }));
  }

  async function uploadGallery(files) {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const urls = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('slug', form.slug || slugify(form.name) || 'biz');
        const res = await fetch('/api/admin/upload-business-photo', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        urls.push(data.url);
      }
      set('gallery', [...form.gallery, ...urls]);
      toast('Photos added', `${urls.length} added to gallery.`, 'success');
    } catch (err) { toast('Upload failed', err.message, 'error'); }
    finally { setUploadingGallery(false); }
  }

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast('Missing name', 'Business name is required.', 'error'); return; }
    setSaving(true);
    const t = (v) => (typeof v === 'string' ? v.trim() : '');  // safe trim: handles null/undefined
    const slug = t(form.slug) || slugify(form.name);
    // strip empty hour rows
    const hours = form.hours.filter((h) => h.open || h.close || h.note);
    const payload = {
      name: form.name.trim(), slug, category: form.category,
      tagline: t(form.tagline) || null, description: t(form.description) || null,
      address: t(form.address) || null, phone: t(form.phone) || null,
      email: t(form.email) || null, website: t(form.website) || null,
      facebook: t(form.facebook) || null, instagram: t(form.instagram) || null,
      lat: form.lat === '' ? null : parseFloat(form.lat),
      lng: form.lng === '' ? null : parseFloat(form.lng),
      image_url: form.image_url || null, image_crop: form.image_url ? (form.image_crop || null) : null, gallery: form.gallery, hours,
      approved: form.approved, featured: form.featured,
    };
    try {
      const doSave = (data) =>
        editing === 'new'
          ? supabase.from('businesses').insert(data)
          : supabase.from('businesses').update(data).eq('id', editing);

      let { error } = await doSave(payload);
      // If the image_crop column hasn't been added to the DB yet, retry without
      // it so saving still works - just without the custom card crop.
      if (error && /image_crop/.test(error.message || '')) {
        const { image_crop, ...rest } = payload;
        ({ error } = await doSave(rest));
        if (!error) toast('Saved (crop skipped)', 'Add the image_crop column to enable card cropping.', 'success');
        else throw error;
      } else if (error) {
        throw error;
      } else {
        toast('Saved', `${form.name} ${editing === 'new' ? 'added' : 'updated'}.`, 'success');
      }
      cancel();
      load();
    } catch (err) {
      toast('Save failed', err.message.includes('duplicate') ? 'That URL slug is already used.' : err.message, 'error');
    } finally { setSaving(false); }
  }

  async function confirmDelete() {
    const b = toDelete; setToDelete(null);
    if (!b) return;
    const { error } = await supabase.from('businesses').delete().eq('id', b.id);
    if (error) { toast('Delete failed', error.message, 'error'); return; }
    toast('Deleted', `${b.name} removed.`, 'success');
    load();
  }

  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>Businesses</h1>
        <p>Manage the local business directory. Drafts stay hidden until published.</p>
      </header>
      <div>
        {!editing ? (
          <div className="panel">
              <div className="panel-head">
                <h2>Business Directory</h2>
                <button className="btn btn-primary" style={{ padding: '.5rem 1.1rem' }} onClick={startNew}>+ Add business</button>
              </div>
              {loading ? <p className="muted-note">Loading&hellip;</p>
                : list.length === 0 ? <p className="muted-note">No businesses yet. Add your first one.</p>
                : (
                  <div className="biz-admin-list">
                    {list.map((b) => (
                      <div key={b.id} className="ba-item">
                        <div className="ba-thumb">
                          {b.image_url ? <img src={b.image_url} alt="" /> : <span>{b.name.charAt(0)}</span>}
                        </div>
                        <div className="ba-main">
                          <strong>{b.name}</strong>
                          <div className="ba-meta">
                            <span>{b.category}</span>
                            <span className={`ba-badge ${b.approved ? 'on' : 'off'}`}>{b.approved ? 'Published' : 'Draft'}</span>
                            {b.featured && <span className="ba-badge feat">Featured</span>}
                          </div>
                        </div>
                        <div className="ba-actions">
                          <button className="am-btn" onClick={() => startEdit(b)}>Edit</button>
                          <button className="am-del" onClick={() => setToDelete(b)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ) : (
            <div className="panel">
              <div className="panel-head">
                <h2>{editing === 'new' ? 'Add Business' : 'Edit Business'}</h2>
                <button className="am-btn" onClick={cancel}>← Back to list</button>
              </div>
              <form onSubmit={save} className="biz-form">
                <div className="bf-grid">
                  <div className="field">
                    <label>Business name *</label>
                    <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Joe's Diner" />
                  </div>
                  <div className="field">
                    <label>Category</label>
                    <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                      {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>URL slug <span className="bf-hint">(auto from name if blank; this is the web address: /business/<b>{form.slug || slugify(form.name) || 'your-slug'}</b>)</span></label>
                  <input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder={slugify(form.name) || 'joes-diner'} />
                </div>

                <div className="field">
                  <label>Tagline <span className="bf-hint">(one line, shows on the directory card)</span></label>
                  <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Home cooking on Center Avenue since 1985." />
                </div>

                <div className="field">
                  <label>Description <span className="bf-hint">(full text for their page; use blank lines for paragraphs)</span></label>
                  <textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} />
                </div>

                {/* main photo */}
                <div className="field">
                  <label>Main photo</label>
                  <ImageUploader
                    value={form.image_url}
                    onChange={(url) => setForm((f) => ({ ...f, image_url: url, image_crop: null }))}
                    endpoint="/api/admin/upload-business-photo"
                    extra={{ slug: form.slug || slugify(form.name) || 'biz' }}
                    label="Shown on the directory card and at the top of the business page."
                    hidePreview
                  />
                  {form.image_url && (
                    <div className="bf-crop">
                      <span className="bf-crop-label">Position &amp; crop for the directory card</span>
                      <ImageCropper
                        src={form.image_url}
                        value={form.image_crop}
                        onChange={(crop) => set('image_crop', crop)}
                      />
                    </div>
                  )}
                </div>

                <div className="bf-grid">
                  <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="256-447-0000" /></div>
                  <div className="field"><label>Email</label><input value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
                </div>
                <div className="field">
                  <label>Address</label>
                  <div className="bf-addr-row">
                    <input value={form.address} onChange={(e) => { set('address', e.target.value); setGeoMsg(null); }} placeholder="123 N Center Ave, Piedmont, AL 36272" />
                    <button type="button" className="btn btn-outline bf-find" onClick={findOnMap} disabled={geocoding}>
                      {geocoding ? 'Finding\u2026' : 'Find on map'}
                    </button>
                  </div>
                  <span className="field-help">
                    Type the street address and click &ldquo;Find on map&rdquo; and the map pin is set automatically.
                  </span>
                  {geoMsg && <span className={geoMsg.ok ? 'bf-geo-ok' : 'bf-geo-err'}>{geoMsg.text}</span>}
                </div>

                {/* Map pin status + preview */}
                <div className="field">
                  <label>Map pin</label>
                  {form.lat !== '' && form.lng !== '' ? (
                    <div className="bf-pin">
                      <div className="bf-pin-state">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>
                        <span>Pinned at {Number(form.lat).toFixed(5)}, {Number(form.lng).toFixed(5)}</span>
                        <button type="button" className="bf-pin-clear" onClick={() => { set('lat', ''); set('lng', ''); setGeoMsg(null); }}>Clear</button>
                      </div>
                      <div className="bf-pin-map">
                        <iframe
                          title="Map preview"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${form.lat},${form.lng}&z=16&output=embed`}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="bf-pin-empty">No pin yet. Use &ldquo;Find on map&rdquo; above, or enter coordinates manually below.</p>
                  )}

                  <details className="bf-manual">
                    <summary>Enter coordinates manually</summary>
                    <div className="bf-grid" style={{ marginTop: '.7rem' }}>
                      <div className="field"><label>Latitude</label><input value={form.lat} onChange={(e) => set('lat', e.target.value)} placeholder="33.9246" /></div>
                      <div className="field"><label>Longitude</label><input value={form.lng} onChange={(e) => set('lng', e.target.value)} placeholder="-85.6097" /></div>
                    </div>
                  </details>
                </div>

                <div className="bf-grid">
                  <div className="field"><label>Website</label><input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="joesdiner.com" /></div>
                  <div className="field"><label>Facebook</label><input value={form.facebook} onChange={(e) => set('facebook', e.target.value)} placeholder="facebook.com/joesdiner" /></div>
                </div>
                <div className="bf-grid">
                  <div className="field"><label>Instagram</label><input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@joesdiner" /></div>
                  <div className="field"></div>
                </div>

                {/* hours */}
                <div className="field">
                  <label>Hours</label>
                  <div className="bf-hours">
                    {form.hours.map((h, i) => (
                      <div key={i} className="bf-hour-row">
                        <span className="bf-day">{h.day}</span>
                        <input placeholder="9:00 AM" value={h.open} onChange={(e) => setHour(i, 'open', e.target.value)} />
                        <span>–</span>
                        <input placeholder="5:00 PM" value={h.close} onChange={(e) => setHour(i, 'close', e.target.value)} />
                        <input className="bf-note" placeholder="or note (Closed)" value={h.note} onChange={(e) => setHour(i, 'note', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* gallery */}
                <div className="field">
                  <label>Photo gallery</label>
                  {form.gallery.length > 0 && (
                    <div className="bf-gallery">
                      {form.gallery.map((src, i) => (
                        <div key={i} className="bf-gphoto">
                          <img src={src} alt="" />
                          <button type="button" onClick={() => set('gallery', form.gallery.filter((_, idx) => idx !== i))}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="file" accept="image/*" multiple onChange={(e) => uploadGallery(e.target.files)} disabled={uploadingGallery} />
                  {uploadingGallery && <span className="bf-hint">Uploading&hellip;</span>}
                </div>

                <div className="bf-toggles">
                  <label className="check-row">
                    <input type="checkbox" checked={form.approved} onChange={(e) => set('approved', e.target.checked)} />
                    <span>Published <span className="bf-hint">(visible on the public site)</span></span>
                  </label>
                  <label className="check-row">
                    <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
                    <span>Featured <span className="bf-hint">(pinned to top of directory)</span></span>
                  </label>
                </div>

                <div className="modal-actions" style={{ marginTop: 'var(--s3)' }}>
                  <button type="button" className="btn btn-cancel" onClick={cancel}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving\u2026' : 'Save business'}</button>
                </div>
              </form>
            </div>
          )}
        </div>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this business?">
        <p style={{ color: 'var(--ink-2)', marginBottom: '1.4rem' }}>
          Permanently remove <strong>{toDelete?.name}</strong> from the directory?
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
