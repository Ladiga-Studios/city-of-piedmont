// ============================================================
// City of Piedmont - Job announcement reader
// Server-only. Sends a job announcement (PDF or image of a flyer) to
// Claude and returns the fields the Careers page needs, in the same
// plain style as the existing postings. Staff review and edit before
// anything is published.
//
// NEVER import this into client code - it uses the secret API key.
// ============================================================

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You read official job announcements from the City of Piedmont, Alabama and turn them into a short, factual posting for the city website's Careers page.

Write for a busy job seeker: plain language, no marketing filler, no editorializing. Use only what the announcement actually says. If something is not stated, leave that field empty ("" or []) rather than guessing.

Respond with ONLY a valid JSON object (no markdown, no backticks, no preamble) in exactly this shape:
{
  "title": "Job title exactly as posted, e.g. Recreation Coordinator",
  "department": "City department or office, e.g. Parks & Recreation. Empty string if not stated.",
  "deadline_date": "YYYY-MM-DD of the application deadline, or empty string if none is stated.",
  "deadline_text": "The deadline as a person would say it, e.g. Friday, September 4, 2026 at 5:00 PM. Empty string if none.",
  "summary": "2-3 sentences: what this person does day to day. Start with the work, not with 'The City of Piedmont is seeking'.",
  "duties": ["4-6 of the most important duties, each one short line, most important first."],
  "benefits": "One line listing benefits if stated (retirement, insurance, leave). Empty string if none.",
  "pay": "Pay or pay range if stated, e.g. $18.50/hour or $42,000-$48,000/year. Empty string if none.",
  "apply_text": "1-2 sentences on how and where to apply: location, hours, email, phone, or link, as stated. Empty string if none."
}

Keep the summary under 60 words. Keep every duty under 15 words. Do not include the EEO statement or the deadline inside the summary.`;

/**
 * @param {Buffer|Uint8Array} bytes   the announcement file
 * @param {string} mime               'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
 * @param {object} hints              { filename, today } for context
 * @param {string} [apiKey]
 */
export async function analyzeJobAnnouncement(bytes, mime, hints = {}, apiKey) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');

  const base64 = Buffer.from(bytes).toString('base64');
  const isPdf = mime === 'application/pdf';
  const fileBlock = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } };

  const today = hints.today || new Date().toISOString().slice(0, 10);

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            fileBlock,
            {
              type: 'text',
              text: `This is a job announcement${hints.filename ? ` (file: ${hints.filename})` : ''}. Today's date is ${today}; if the deadline only gives a month and day, assume the next occurrence on or after today. Extract the posting as instructed, responding with only the JSON object.`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Anthropic API ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return parseJob(text);
}

/** Defensive parse: strip fences, grab the outer object, normalize types. */
export function parseJob(text) {
  let clean = text.replace(/```json|```/g, '').trim();
  const first = clean.indexOf('{');
  const last = clean.lastIndexOf('}');
  if (first !== -1 && last !== -1) clean = clean.slice(first, last + 1);

  let p;
  try { p = JSON.parse(clean); }
  catch { throw new Error('Could not read the announcement — try a clearer scan or fill the fields in by hand.'); }

  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const date = str(p.deadline_date);
  return {
    title: str(p.title),
    department: str(p.department),
    deadline_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '',
    deadline_text: str(p.deadline_text),
    summary: str(p.summary),
    duties: Array.isArray(p.duties) ? p.duties.filter((d) => typeof d === 'string' && d.trim()).map((d) => d.trim()).slice(0, 8) : [],
    benefits: str(p.benefits),
    pay: str(p.pay),
    apply_text: str(p.apply_text),
  };
}
