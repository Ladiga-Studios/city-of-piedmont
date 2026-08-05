'use client';

// Small live open/closed badge for City Hall - reuses the shared hours logic.
// Renders nothing until mounted (SSR-safe), then refreshes every minute.

import { useEffect, useState } from 'react';
import { cityHallStatus } from '@/lib/city-hours';

export default function LiveHoursBadge() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const update = () => setStatus(cityHallStatus());
    update();
    const id = setInterval(update, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!status) return null;
  return (
    <span className={`cc-live ${status.open ? 'is-open' : 'is-closed'}`}>
      <span className={`tb-dot ${status.open ? 'dot-open' : 'dot-closed'}`} aria-hidden="true" />
      {status.open ? 'Open now' : 'Closed now'} · {status.detail}
    </span>
  );
}
