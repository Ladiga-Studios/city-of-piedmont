'use client';

// "Today in Piedmont" — a live civic snapshot on the homepage:
// current conditions + 3-day outlook (Open-Meteo, keyless), the live
// City Hall open/closed status, and the next event on the calendar.
// Renders a stable skeleton while loading and degrades gracefully:
// if the weather fetch fails, the panel still shows hours + next event.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cityHallStatus } from '@/lib/city-hours';
import { useWeather, WeatherGlyph } from '@/lib/use-weather';

export default function TodayPanel({ nextEvent }) {
  const { weather, error } = useWeather();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const update = () => setStatus(cityHallStatus());
    update();
    const id = setInterval(update, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="today" aria-label="Today in Piedmont">
      <div className="container">
        <div className="today-panel">
          <div className="today-title">
            <span className="today-eyebrow">Today in Piedmont</span>
          </div>

          {/* Current conditions */}
          <div className="today-now" aria-live="polite">
            {weather ? (
              <>
                <span className="today-ico"><WeatherGlyph icon={weather.icon} night={!weather.isDay} size={34} /></span>
                <span className="today-temp">{weather.temp}°</span>
                <span className="today-cond">
                  {weather.label}
                  <small>Feels {weather.feels}° · Wind {weather.wind} mph</small>
                </span>
              </>
            ) : (
              <span className="today-cond">
                {error ? 'Weather unavailable' : 'Loading conditions…'}
                <small>Piedmont, Alabama</small>
              </span>
            )}
          </div>

          {/* 3-day outlook (skip today = index 0) */}
          {weather?.days?.length > 1 && (
            <div className="today-days">
              {weather.days.slice(1, 4).map((d) => (
                <div key={d.iso} className="today-day" title={`${d.label}${d.rain != null ? ` · ${d.rain}% rain` : ''}`}>
                  <span className="td-name">{d.day}</span>
                  <WeatherGlyph icon={d.icon} size={20} />
                  <span className="td-temps">{d.hi}°<em>/{d.lo}°</em></span>
                </div>
              ))}
            </div>
          )}

          <div className="today-divider" aria-hidden="true" />

          {/* City Hall status */}
          <div className="today-hall">
            <span className={`tb-dot ${status?.open ? 'dot-open' : 'dot-closed'}`} aria-hidden="true" />
            <div>
              <strong>{status ? status.label : 'City Hall hours'}</strong>
              <small>{status ? status.detail : 'Mon–Thu 7:30–4:30 · Fri 7:30–11:30'}</small>
            </div>
          </div>

          {/* Next event */}
          <div className="today-next">
            {nextEvent ? (
              <Link href="/events" className="today-next-link">
                <span className="tn-label">Next event</span>
                <strong>{nextEvent.title}</strong>
                <small>{nextEvent.m} {nextEvent.d}{nextEvent.where ? ` · ${nextEvent.where}` : ''}</small>
              </Link>
            ) : (
              <Link href="/parks/chief-ladiga-trail" className="today-next-link">
                <span className="tn-label">Great day for a ride?</span>
                <strong>Chief Ladiga Trail</strong>
                <small>Plan your trip →</small>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
