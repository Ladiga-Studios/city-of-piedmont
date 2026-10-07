// ============================================================
// Document sections — the named lists a city document can be
// posted into from /admin/documents. Shared by the admin console
// (client) and the public pages (server), so keep this file free
// of server-only imports.
//
// `heading` is what's stored in city_documents.group_heading and
// shown as the list title on the department page. `alsoOn` tells
// staff where else the document appears, so they know exactly
// what they're publishing to.
// ============================================================

export const DOCUMENT_SECTIONS = {
  'water-gas': [
    {
      heading: 'Service Forms & Applications',
      hint: 'Utility service application, standard service policy, gas safety notices',
      alsoOn: 'Residents page, “Start or Stop Service” card',
    },
    {
      heading: 'Water Quality Reports',
      hint: 'Annual drinking water quality reports, PFAS/PFOS results',
      alsoOn: 'Residents page, “Water Quality” card',
    },
  ],
  revenue: [
    { heading: 'Download Forms', hint: 'Sales tax forms, business license applications' },
  ],
  'building-inspection': [
    { heading: 'Downloads', hint: 'Permit applications, contractor lists, zoning documents' },
  ],
  administrative: [
    { heading: 'Forms & Documents', hint: 'General city forms and documents' },
  ],
};

export const DEFAULT_SECTION = 'Forms & Documents';

// Water & Gas section names used by the Residents page cards.
export const WATER_FORMS_SECTION = 'Service Forms & Applications';
export const WATER_QUALITY_SECTION = 'Water Quality Reports';

/** Preset sections for a department (falls back to one generic section). */
export function sectionsFor(slug) {
  return DOCUMENT_SECTIONS[slug] || [{ heading: DEFAULT_SECTION, hint: 'Forms and documents for this department' }];
}

/** Case/space-insensitive heading match. */
export function sameHeading(a = '', b = '') {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Anchor id for a section on the department page, e.g. #water-quality-reports */
export function headingId(heading = '') {
  return heading.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** File-type label for a link ("PDF", "DOCX"), or null. */
export function fileTypeLabel(href = '') {
  const m = /\.([a-z0-9]{2,5})(?:$|[?#])/i.exec(href);
  return m ? m[1].toUpperCase() : null;
}
