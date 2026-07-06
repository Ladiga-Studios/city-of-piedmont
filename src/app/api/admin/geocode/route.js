// POST /api/admin/geocode
// Turns a street address into latitude/longitude using Google's Geocoding API.
// Staff-only. The Google key is read from a SERVER-ONLY env var and never
// reaches the browser. Returns { lat, lng, formatted } on success.
//
// Setup: add GOOGLE_MAPS_API_KEY to .env.local (a key with the Geocoding API
// enabled and billing turned on). If the key is missing we return a clear,
// actionable error instead of failing silently.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'Address lookup isn\u2019t configured yet. Add GOOGLE_MAPS_API_KEY to the server settings, or enter coordinates manually.' },
      { status: 503 }
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const address = (body.address || '').trim();
  if (!address) return NextResponse.json({ error: 'Enter an address first.' }, { status: 400 });

  // Bias results toward Piedmont, AL so a short address like "100 Center Ave"
  // resolves to the right town. Google still honors a full address if given.
  const params = new URLSearchParams({
    address,
    key,
    region: 'us',
    components: 'country:US',
  });

  let json;
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, {
      // Don't cache geocode lookups.
      cache: 'no-store',
    });
    json = await res.json();
  } catch {
    return NextResponse.json({ error: 'Couldn\u2019t reach the address service. Try again.' }, { status: 502 });
  }

  if (json.status === 'ZERO_RESULTS') {
    return NextResponse.json({ error: 'No match for that address. Check the spelling or enter coordinates manually.' }, { status: 404 });
  }
  if (json.status === 'REQUEST_DENIED') {
    return NextResponse.json({ error: 'Address service rejected the request. Check that the Geocoding API is enabled for the key.' }, { status: 502 });
  }
  if (json.status === 'OVER_QUERY_LIMIT') {
    return NextResponse.json({ error: 'Address service quota reached. Try again later.' }, { status: 429 });
  }
  if (json.status !== 'OK' || !json.results || !json.results.length) {
    return NextResponse.json({ error: `Address lookup failed (${json.status || 'unknown'}).` }, { status: 502 });
  }

  const top = json.results[0];
  const loc = top.geometry && top.geometry.location;
  if (!loc) return NextResponse.json({ error: 'No coordinates returned for that address.' }, { status: 502 });

  return NextResponse.json({
    lat: loc.lat,
    lng: loc.lng,
    formatted: top.formatted_address || address,
  });
}
