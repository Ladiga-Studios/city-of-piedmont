// Cloudflare Turnstile, checked server-side through the shared Ladiga
// verifier (it holds the secret, so nothing secret lives in this repo).
//
// Fails open: if the verifier is down, slow or returns something odd, the
// submission is allowed and a warning is logged. Only an explicit
// `success: false` rejects.

const TURNSTILE_SITEKEY = '0x4AAAAAAFS26njn_ycxBtBN';
const SITE = 'piedmontcity.org';

export async function checkTurnstile(token, ip) {
  try {
    const r = await fetch('https://ladigastudios.com/api/turnstile/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token || '', sitekey: TURNSTILE_SITEKEY, site: SITE, ip: ip || null }),
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    if (!r.ok) {
      console.warn('turnstile verifier returned', r.status, '- allowing');
      return true;
    }
    const j = await r.json();
    return j.success !== false;
  } catch (e) {
    console.warn('turnstile verifier unreachable, allowing', e && e.message);
    return true;
  }
}

/** Client IP on Vercel: x-real-ip, else the first x-forwarded-for hop. */
export function clientIp(request) {
  const h = request.headers;
  return (h.get('x-real-ip') || '').trim() || (h.get('x-forwarded-for') || '').split(',')[0].trim() || null;
}
