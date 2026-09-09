import '../../pages.css';
import './ordinances.css';
import Link from 'next/link';
import { ORDINANCES, fmtOrdinanceDate } from '@/lib/ordinances';

export const metadata = {
  title: 'City Ordinances',
  description:
    'Recently adopted City of Piedmont ordinances: short-term rentals, THC products, and brown bagging. Plain-language summaries with the signed PDF of each.',
  alternates: { canonical: 'https://www.piedmontcity.org/government/ordinances' },
  openGraph: {
    title: 'City Ordinances — City of Piedmont, Alabama',
    description:
      'Recently adopted City of Piedmont ordinances with plain-language summaries and the signed PDF of each.',
    url: 'https://www.piedmontcity.org/government/ordinances',
    type: 'website',
  },
};

const BASE = 'https://www.piedmontcity.org';

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
    </svg>
  );
}

// Schema.org Legislation entries so search engines can surface individual
// ordinances, plus a breadcrumb trail for the Government section.
function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Government', item: `${BASE}/government` },
          { '@type': 'ListItem', position: 3, name: 'Ordinances', item: `${BASE}/government/ordinances` },
        ],
      },
      ...ORDINANCES.map((o) => ({
        '@type': 'Legislation',
        name: `Ordinance No. ${o.number} — ${o.title}`,
        legislationIdentifier: `Ordinance No. ${o.number}`,
        legislationDate: o.adopted,
        legislationJurisdiction: 'City of Piedmont, Alabama',
        legislationPassedBy: {
          '@type': 'GovernmentOrganization',
          name: 'Piedmont City Council',
        },
        description: o.summary,
        url: `${BASE}/government/ordinances#${o.id}`,
        associatedMedia: {
          '@type': 'MediaObject',
          contentUrl: `${BASE}${o.file}`,
          encodingFormat: 'application/pdf',
        },
      })),
    ],
  };
}

export default function OrdinancesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
      />

      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/government">Government</Link><span aria-hidden="true">/</span>
            <span>Ordinances</span>
          </nav>
          <p className="eyebrow">City Government</p>
          <h1>City Ordinances</h1>
          <p>
            Recently adopted ordinances, with a plain-language summary of each and the
            signed PDF. The PDF is the official text. For questions about how an
            ordinance applies to you, call City Hall at{' '}
            <a href="tel:2564473560" style={{ color: 'var(--amber)', fontWeight: 600 }}>256-447-3560</a>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="ord-wrap">

            <nav className="ord-toc" aria-label="Jump to an ordinance">
              <span className="ord-toc-label" id="ord-jump">On this page</span>
              {ORDINANCES.map((o) => (
                <a key={o.id} href={`#${o.id}`}>No. {o.number} — {o.title}</a>
              ))}
            </nav>

            <ul className="ord-list">
              {ORDINANCES.map((o) => (
                <li key={o.id} id={o.id} className="ord-card">
                  <div className="ord-head">
                    <span className="ord-num" aria-hidden="true">
                      <small>Ordinance</small>
                      <b>{o.number}</b>
                    </span>
                    <div className="ord-headings">
                      <h2>
                        <span className="ord-sr">Ordinance No. {o.number}: </span>
                        {o.title}
                      </h2>
                      <p className="ord-meta">
                        <span>Adopted {fmtOrdinanceDate(o.adopted)}</span>
                        {o.effective && <span>Effective {o.effective}</span>}
                        {o.amends && <span>{o.amends}</span>}
                      </p>
                    </div>
                  </div>

                  <p className="ord-summary">{o.summary}</p>

                  <div className="ord-block">
                    <h3>Who it applies to</h3>
                    <p>{o.applies}</p>
                  </div>

                  <div className="ord-block">
                    <h3>What it requires</h3>
                    <ul>
                      {o.points.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>

                  {o.exceptions?.length > 0 && (
                    <div className="ord-block">
                      <h3>Exceptions</h3>
                      <ul>
                        {o.exceptions.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}

                  {o.penalty && (
                    <div className="ord-block penalty">
                      <h3>If it is violated</h3>
                      <p>{o.penalty}</p>
                    </div>
                  )}

                  <div className="ord-foot">
                    <a
                      href={o.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline ord-dl"
                      aria-label={`Download Ordinance No. ${o.number}, ${o.title} (PDF)`}
                    >
                      <DownloadIcon />
                      <span>Read Ordinance {o.number} (PDF)</span>
                    </a>
                    <p className="ord-foot-note">
                      Signed by the Mayor and Council on {fmtOrdinanceDate(o.adopted)}.
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="ord-related">
              <h2>Other city codes and documents</h2>
              <p>
                This page lists recently adopted ordinances only. It is not the complete
                Code of Ordinances. For any other section of the code, or for a certified
                copy of an ordinance, contact the City Clerk at City Hall,
                109 North Center Avenue.
              </p>
              <ul>
                <li>
                  <a href="/documents/zoning-ordinance-2004.pdf" target="_blank" rel="noopener noreferrer">
                    Zoning Ordinance (2004) (PDF) &rarr;
                  </a>
                </li>
                <li>
                  <a href="/documents/zoning-map.pdf" target="_blank" rel="noopener noreferrer">
                    Zoning map (PDF) &rarr;
                  </a>
                </li>
                <li>
                  <Link href="/government/notices">Public notices &amp; bid requests &rarr;</Link>
                </li>
                <li>
                  <Link href="/government/minutes">Council meeting minutes &rarr;</Link>
                </li>
                <li>
                  <Link href="/contact">Contact City Hall &rarr;</Link>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
