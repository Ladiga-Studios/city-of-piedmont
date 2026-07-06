'use client';

// Live Piedmont weather via Open-Meteo (https://open-meteo.com).
// Free for non-commercial/government use, no API key, CORS-enabled.
// One fetch is shared across every component on the page (module-level cache)
// and refreshed at most every 15 minutes.

import { useEffect, useState } from 'react';

const LAT = 33.9243;
const LON = -85.6111;
const REFRESH_MS = 15 * 60 * 1000;

const URL =
  'https://api.open-meteo.com/v1/forecast' +
  `?latitude=${LAT}&longitude=${LON}` +
  '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
  '&temperature_unit=fahrenheit&wind_speed_unit=mph' +
  '&timezone=America%2FChicago&forecast_days=4';

// ---- WMO weather-code → { label, icon key } ----------------------------
const CODES = [
  [[0], 'Clear', 'sun'],
  [[1], 'Mostly clear', 'sun'],
  [[2], 'Partly cloudy', 'partly'],
  [[3], 'Overcast', 'cloud'],
  [[45, 48], 'Foggy', 'fog'],
  [[51, 53, 55, 56, 57], 'Drizzle', 'rain'],
  [[61, 63, 65, 66, 67], 'Rain', 'rain'],
  [[71, 73, 75, 77], 'Snow', 'snow'],
  [[80, 81, 82], 'Rain showers', 'rain'],
  [[85, 86], 'Snow showers', 'snow'],
  [[95, 96, 99], 'Thunderstorms', 'storm'],
];

export function describeCode(code) {
  for (const [codes, label, icon] of CODES) {
    if (codes.includes(code)) return { label, icon };
  }
  return { label: 'Weather', icon: 'cloud' };
}

// ---- shared cache -------------------------------------------------------
let cache = null; // { at: number, data: shaped }
let inflight = null;

function shape(json) {
  const c = json.current || {};
  const d = json.daily || {};
  const days = (d.time || []).map((iso, i) => ({
    iso,
    // "Wed" style label from the ISO date, interpreted as a plain date.
    day: new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    hi: Math.round(d.temperature_2m_max?.[i]),
    lo: Math.round(d.temperature_2m_min?.[i]),
    rain: d.precipitation_probability_max?.[i] ?? null,
    ...describeCode(d.weather_code?.[i]),
  }));
  return {
    temp: Math.round(c.temperature_2m),
    feels: Math.round(c.apparent_temperature),
    wind: Math.round(c.wind_speed_10m),
    isDay: c.is_day !== 0,
    ...describeCode(c.weather_code),
    days,
  };
}

async function fetchWeather() {
  if (cache && Date.now() - cache.at < REFRESH_MS) return cache.data;
  if (!inflight) {
    inflight = fetch(URL)
      .then((r) => {
        if (!r.ok) throw new Error('weather ' + r.status);
        return r.json();
      })
      .then((json) => {
        cache = { at: Date.now(), data: shape(json) };
        return cache.data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * useWeather() → { weather | null, error: boolean }
 * `weather` stays null while loading; components should render a stable
 * placeholder (or nothing) until it arrives, and hide gracefully on error.
 */
export function useWeather() {
  const [weather, setWeather] = useState(cache?.data ?? null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchWeather()
      .then((w) => alive && setWeather(w))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  return { weather, error };
}

// ---- tiny inline icon set (stroke style matches the rest of the site) ----
export function WeatherGlyph({ icon, size = 18, night = false }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (icon === 'sun' && night) {
    return (
      <svg {...common}>
        <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
      </svg>
    );
  }
  switch (icon) {
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case 'partly':
      return (
        <svg {...common}>
          <path d="M8 5v1.5M3.5 9.5H5M5.2 6.2l1 1M12.5 6a3.5 3.5 0 00-3.4 2.7" />
          <path d="M7 18h10a4 4 0 000-8 5.5 5.5 0 00-10.4 1.6A3.2 3.2 0 007 18z" />
        </svg>
      );
    case 'fog':
      return (
        <svg {...common}>
          <path d="M4 10h16M3 14h18M5 18h14" />
        </svg>
      );
    case 'rain':
      return (
        <svg {...common}>
          <path d="M7 15h10a4 4 0 000-8 5.5 5.5 0 00-10.4 1.6A3.2 3.2 0 007 15z" />
          <path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5" />
        </svg>
      );
    case 'snow':
      return (
        <svg {...common}>
          <path d="M7 15h10a4 4 0 000-8 5.5 5.5 0 00-10.4 1.6A3.2 3.2 0 007 15z" />
          <path d="M8 18.5h.01M12 20h.01M16 18.5h.01" strokeWidth="2.4" />
        </svg>
      );
    case 'storm':
      return (
        <svg {...common}>
          <path d="M7 14h10a4 4 0 000-8 5.5 5.5 0 00-10.4 1.6A3.2 3.2 0 007 14z" />
          <path d="M12.5 14l-2.5 4h3l-2 4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M7 18h10a4 4 0 000-8 5.5 5.5 0 00-10.4 1.6A3.2 3.2 0 007 18z" />
        </svg>
      );
  }
}
