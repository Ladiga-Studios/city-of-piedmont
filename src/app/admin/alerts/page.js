'use client';

import AlertsPanel from '../dashboard/AlertsPanel';

export default function AlertsPage() {
  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>Site Alerts</h1>
        <p>Post banners to the top of the whole site for closures, advisories, and emergencies.</p>
      </header>
      <div style={{ maxWidth: 640 }}>
        <AlertsPanel />
      </div>
    </div>
  );
}
