// ============================================================
// POST   /api/admin/save-job   -> create or update a job posting
// DELETE /api/admin/save-job   -> delete a posting (+ its news article and file)
// Staff-only. JSON body.
//
// Keeps the optional News article in sync: same deadline, so both
// expire together; deleting the posting deletes the article.
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { newsSlugify } from '@/lib/news-events';
import { newsSha256, tryAnchorRecord, newsPayload } from '@/lib/fangorn-anchor';

export const runtime = 'nodejs';

const str = (v) => (typeof v === 'string' ? v.trim() : '');

/** End of the deadline day, Central time — mirrors the DB trigger. */
function expiresAtFor(deadlineDate) {
  return new Date(`${deadlineDate}T23:59:59-05:00`).toISOString();
}

function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** Build the news article fields from a posting. */
function newsFrom(job) {
  const deadline = job.deadline_text || longDate(job.deadline_date);
  const lines = [];
  if (job.duties?.length) lines.push(`What you’ll do: ${job.duties.join('; ')}.`);
  if (job.pay) lines.push(`Pay: ${job.pay}.`);
  if (job.benefits) lines.push(`Benefits: ${job.benefits}.`);
  if (job.apply_text) lines.push(job.apply_text);
  lines.push(`Deadline to apply is ${deadline}. See the full announcement and all current openings on the Careers page.`);
  const isImage = job.file_kind === 'image' && job.file_url;
  return {
    title: `Now Hiring: ${job.title}`,
    body: `${job.summary} Apply by ${deadline}.`.trim(),
    content: lines.join('\n'),
    image_url: isImage ? job.file_url : null,
    image_alt: isImage ? `${job.title} job announcement` : null,
    expires_at: expiresAtFor(job.deadline_date),
    is_sample: false,
  };
}

async function requireUser(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request) {
  const supabase = createClient();
  if (!(await requireUser(supabase))) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const job = {
    title: str(body.title),
    department: str(body.department) || null,
    deadline_date: str(body.deadline_date),
    deadline_text: str(body.deadline_text) || null,
    summary: str(body.summary),
    duties: Array.isArray(body.duties) ? body.duties.map(str).filter(Boolean) : [],
    benefits: str(body.benefits) || null,
    pay: str(body.pay) || null,
    apply_text: str(body.apply_text) || null,
    file_url: str(body.file_url) || null,
    file_path: str(body.file_path) || null,
    file_kind: ['pdf', 'image'].includes(body.file_kind) ? body.file_kind : null,
    published: body.published !== false,
  };
  if (!job.title || !job.summary || !/^\d{4}-\d{2}-\d{2}$/.test(job.deadline_date)) {
    return NextResponse.json({ error: 'A title, an overview, and a deadline date are required.' }, { status: 400 });
  }

  const postNews = body.post_news !== false;
  const id = body.id || null;

  // Existing linkage (on edit)
  let existing = null;
  if (id) {
    const { data } = await supabase.from('job_postings').select('id, news_id').eq('id', id).maybeSingle();
    if (!data) return NextResponse.json({ error: 'Posting not found' }, { status: 404 });
    existing = data;
  }

  // ---- news article: create / update / remove ----
  let newsId = existing?.news_id || null;
  let newsWarning = null;
  if (postNews) {
    const n = newsFrom(job);
    n.sha256 = newsSha256(n);
    let res;
    if (newsId) {
      res = await supabase.from('news').update(n).eq('id', newsId).select().single();
      if (res.error) { newsId = null; }               // article was deleted by hand — recreate below
    }
    if (!newsId) {
      n.slug = newsSlugify(`now-hiring-${job.title}-${job.deadline_date.slice(0, 4)}`);
      n.published_at = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
      res = await supabase.from('news').insert(n).select().single();
    }
    if (res.error) {
      newsWarning = `Posting saved, but the news article could not be ${newsId ? 'updated' : 'created'}: ${res.error.message}`;
    } else {
      newsId = res.data.id;
      // Permanent-record anchoring, same as the News console (never fails the save).
      const a = await tryAnchorRecord(supabase, 'news', 'news', res.data, newsPayload(res.data)).catch(() => ({}));
      if (a?.error) newsWarning = a.error;
    }
  } else if (newsId) {
    await supabase.from('news').delete().eq('id', newsId);
    newsId = null;
  }

  const row = { ...job, news_id: newsId };
  const result = id
    ? await supabase.from('job_postings').update(row).eq('id', id).select().single()
    : await supabase.from('job_postings').insert(row).select().single();
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });

  return NextResponse.json({ job: result.data, newsWarning });
}

export async function DELETE(request) {
  const supabase = createClient();
  if (!(await requireUser(supabase))) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { data: job } = await supabase.from('job_postings').select('id, news_id, file_path').eq('id', body.id).maybeSingle();
  if (!job) return NextResponse.json({ error: 'Posting not found' }, { status: 404 });

  if (job.news_id) await supabase.from('news').delete().eq('id', job.news_id);
  if (job.file_path) await supabase.storage.from('careers').remove([job.file_path]);
  const { error } = await supabase.from('job_postings').delete().eq('id', job.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
