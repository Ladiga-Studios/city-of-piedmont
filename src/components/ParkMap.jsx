'use client';

import { useEffect, useRef } from 'react';

/**
 * A small OpenStreetMap map rendered with Leaflet (loaded from CDN on demand).
 * Shows only the required "© OpenStreetMap contributors" attribution -
 * no donation prompt or extra links like the default OSM iframe embed.
 *
 * Props:
 *   lat, lng, label (single-marker mode), zoom (optional), height (px, optional)
 *   points (optional) - [{ lat, lng, label }] renders multiple markers with
 *   popups and auto-fits the map view to show all of them.
 */
export default function ParkMap({ lat, lng, label = 'Location', zoom = 16, points = null, height = 240 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  // Stable dependency for the effect - a new array literal each render
  // would otherwise tear the map down and rebuild it.
  const pointsKey = points ? JSON.stringify(points) : '';

  useEffect(() => {
    let cancelled = false;

    // Load Leaflet's CSS once.
    const CSS_ID = 'leaflet-css';
    if (!document.getElementById(CSS_ID)) {
      const link = document.createElement('link');
      link.id = CSS_ID;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Load Leaflet's JS once, then init the map.
    function init() {
      if (cancelled || !elRef.current || mapRef.current) return;
      const L = window.L;
      if (!L) return;

      const markers = points && points.length ? points : [{ lat, lng, label }];

      const map = L.map(elRef.current, {
        center: [markers[0].lat, markers[0].lng],
        zoom,
        scrollWheelZoom: false,
        attributionControl: false,
      });
      mapRef.current = map;

      // Add an attribution control with the Leaflet prefix turned OFF, so the
      // little "Leaflet" flag/link never shows - only the OSM credit appears.
      const attribution = L.control.attribution({ prefix: false });
      attribution.addTo(map);
      attribution.setPrefix(false); // belt-and-suspenders: force-clear the prefix

      // OSM tiles. This plain-text string is the only attribution shown.
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Default Leaflet marker icons resolve from the CDN path.
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      markers.forEach((p) => {
        const m = L.marker([p.lat, p.lng], { icon, title: p.label || label }).addTo(map);
        if (p.label) m.bindPopup(p.label);
      });

      // With multiple points, zoom the view out to fit every marker.
      if (markers.length > 1) {
        const bounds = L.latLngBounds(markers.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [28, 28] });
      }
    }

    const JS_ID = 'leaflet-js';
    const existing = document.getElementById(JS_ID);
    if (window.L) {
      init();
    } else if (existing) {
      existing.addEventListener('load', init);
    } else {
      const script = document.createElement('script');
      script.id = JS_ID;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.addEventListener('load', init);
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, zoom, label, pointsKey]);

  return (
    <div
      ref={elRef}
      role="img"
      aria-label={`Map showing ${label}`}
      style={{ width: '100%', height: `${height}px` }}
    />
  );
}
