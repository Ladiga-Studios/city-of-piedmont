// ============================================================
// City of Piedmont - Council Minutes summarizer
// Server-only. Sends a meeting-minutes PDF to Claude (Sonnet)
// and returns a structured, plain-language summary.
//
// Used by:
//   - the admin upload route (summarize on upload)
//   - the backfill script (summarize the 59 existing minutes)
//
// NEVER import this into client code - it uses the secret API key.
// ============================================================

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6'; // fast + capable; ideal for summarization

const SYSTEM_PROMPT = `You summarize official City Council meeting minutes for the City of Piedmont, Alabama, so residents can quickly understand what happened without reading the full document.

Write for a general public audience: plain, factual, neighborly language. No jargon, no filler, no editorializing. Never invent details that are not in the document. If the minutes are sparse or a section has nothing, return an empty array for it rather than padding.

You must respond with ONLY a valid JSON object (no markdown, no backticks, no preamble) in exactly this shape:
{
  "summary": "2-3 sentence plain-language overview of what the council did at this meeting.",
  "decisions": ["Each notable decision, vote, ordinance, resolution, or approval as a short factual sentence."],
  "action_items": ["Each action item, assignment, follow-up, deadline, or note about the next meeting as a short factual sentence."]
}

Keep each array item to one sentence. Aim for 2-6 decisions and 0-5 action items depending on the meeting. If a vote count or who-moved/seconded is stated, you may include it briefly.`;

/**
 * Summarize a minutes PDF.
 * @param {Buffer|Uint8Array} pdfBuffer  raw PDF bytes
 * @param {object} meta  { title, meeting_date } for context
 * @param {string} apiKey  Anthropic API key (server-side only)
 * @returns {Promise<{summary:string, decisions:string[], action_items:string[]}>}
 */
export async function summarizeMinutesPdf(pdfBuffer, meta, apiKey) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');

  const base64 = Buffer.from(pdfBuffer).toString('base64');

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text: `These are the minutes for "${meta.title}" (meeting date ${meta.meeting_date}). Summarize them as instructed, responding with only the JSON object.`,
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

  // Pull the text out of the content blocks (ignore any non-text blocks).
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return parseSummary(text);
}

/** Parse the model's JSON response defensively (strip stray fences, validate shape). */
export function parseSummary(text) {
  let clean = text.replace(/```json|```/g, '').trim();

  // If the model wrapped anything around the JSON, grab the outermost object.
  const first = clean.indexOf('{');
  const last = clean.lastIndexOf('}');
  if (first !== -1 && last !== -1) clean = clean.slice(first, last + 1);

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Could not parse summary JSON from model response');
  }

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
    decisions: Array.isArray(parsed.decisions)
      ? parsed.decisions.filter((d) => typeof d === 'string' && d.trim()).map((d) => d.trim())
      : [],
    action_items: Array.isArray(parsed.action_items)
      ? parsed.action_items.filter((a) => typeof a === 'string' && a.trim()).map((a) => a.trim())
      : [],
  };
}
