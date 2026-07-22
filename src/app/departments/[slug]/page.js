import '../../pages.css';
import '../departments.css';
import './department.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DEPARTMENTS, getDepartment } from '@/lib/departments';
import ParkMap from '@/components/ParkMap';

export function generateStaticParams() {
  return DEPARTMENTS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }) {
  const d = getDepartment(params.slug);
  if (!d) return {};
  return {
    title: `${d.name}, City of Piedmont`,
    description: d.intro,
  };
}

function telHref(phone) {
  return `tel:${(phone || '').replace(/[^0-9]/g, '')}`;
}

function StaffList({ staff }) {
  if (!staff || staff.length === 0) return null;
  return (
    <ul className="dd-staff">
      {staff.map((p, i) => (
        <li key={i} className="dd-staff-item">
          <span className="dd-staff-name">{p.name}</span>
          {p.role && <span className="dd-staff-role">{p.role}</span>}
          <span className="dd-staff-contacts">
            {p.email && (
              <a href={`mailto:${p.email}`} className="dd-staff-link">{p.email}</a>
            )}
            {p.phone && (
              <a href={telHref(p.phone)} className="dd-staff-link">{p.phone}</a>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DownloadLink({ label, href }) {
  const isExternalDoc = /\.(pdf|doc|docx)$/i.test(href);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="dd-download">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
      </svg>
      <span>{label}</span>
      {isExternalDoc && <span className="dd-download-type">{href.split('.').pop().toUpperCase()}</span>}
    </a>
  );
}

export default function DepartmentPage({ params }) {
  const d = getDepartment(params.slug);
  if (!d) notFound();

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`;
  const aboutParas = d.about && d.about.length ? d.about : [d.intro];

  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/departments">Departments</Link><span aria-hidden="true">/</span>
            <span>{d.name}</span>
          </nav>
          <p className="eyebrow">City Services</p>
          <h1>{d.name}</h1>
          <p>{d.short}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">

          {/* 1: Intro, photo beside text (text-only if no photo or photo is card-only) */}
          <div className={`dd-intro${d.img && !d.cardImgOnly ? '' : ' no-photo'}`}>
            {d.img && !d.cardImgOnly && (
              <figure className="dd-intro-media">
                <picture>
                  <source srcSet={`${d.img}.webp`} type="image/webp" />
                  <img src={`${d.img}.jpg`} alt={d.alt} loading="lazy" width="1400" height="933" />
                </picture>
              </figure>
            )}
            <div className="dd-intro-text">
              {aboutParas.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>

          {/* 2: Mission (Administrative, Power & Light) */}
          {d.mission && d.mission.length > 0 && (
            <div className="dd-block">
              <h2>{d.missionHeading || 'Our Mission'}</h2>
              {d.missionIntro && <p className="dd-block-intro">{d.missionIntro}</p>}
              <ul className="dd-bullets">
                {d.mission.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}

          {/* 3: Free-form body paragraphs (memberships, etc.) */}
          {d.body && d.body.length > 0 && (
            <div className="dd-block dd-body">
              {d.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}

          {/* 4: Duties / What We Do (Power & Light, Public Works) */}
          {d.duties && d.duties.length > 0 && (
            <div className="dd-block">
              <h2>{d.dutiesHeading || 'Department Duties'}</h2>
              <ul className="dd-bullets dd-bullets-cols">
                {d.duties.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}

          {/* 5: Services */}
          {d.services && d.services.length > 0 && (
            <div className="dd-services">
              <h2>Services</h2>
              <ul className="dd-services-list">
                {d.services.map((s) => (
                  <li key={s}>
                    <svg className="dd-tick" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 6: Staff */}
          {d.staff && d.staff.length > 0 && (
            <div className="dd-block">
              <h2>Staff</h2>
              <StaffList staff={d.staff} />
            </div>
          )}

          {/* 7: Divisions / sub-offices (Police & Fire, Filtration Plant, County Annex) */}
          {d.offices && d.offices.map((o, i) => (
            <div className={`dd-block dd-office${o.img ? ' has-photo' : ''}`} key={i}>
              <div className="dd-office-body">
                <h2>{o.name}</h2>
                {o.note && <p className="dd-block-intro">{o.note}</p>}
                {o.staff && <StaffList staff={o.staff} />}
                <div className="dd-office-meta">
                {o.lines && o.lines.length > 0 && (
                  <div className="dd-row"><span className="dd-label">Address</span><span>{o.lines.join(', ')}</span></div>
                )}
                {o.phones && o.phones.map((ph, j) => (
                  <div className="dd-row" key={j}>
                    <span className="dd-label">{ph.label || 'Phone'}</span>
                    <a href={telHref(ph.number)}>{ph.number}</a>
                  </div>
                ))}
                {o.hours && (
                  <div className="dd-row"><span className="dd-label">Hours</span><span>{o.hours}</span></div>
                )}
                {o.links && o.links.map((l, j) => (
                  <div className="dd-row" key={`l${j}`}>
                    <span className="dd-label">Link</span>
                    <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                  </div>
                ))}
                </div>
              </div>
              {o.img && (
                <figure className="dd-office-media">
                  <picture>
                    <source srcSet={`${o.img}.webp`} type="image/webp" />
                    <img src={`${o.img}.jpg`} alt={o.alt || o.name} loading="lazy" width="378" height="203" />
                  </picture>
                </figure>
              )}
            </div>
          ))}

          {/* 8: Notice callout (outage reporting, court schedule) */}
          {d.notice && (
            <div className="dd-notice">
              <h3>{d.notice.heading}</h3>
              {d.notice.lines.map((l, i) => <p key={i}>{l}</p>)}
            </div>
          )}

          {/* 9: Downloads (flat list) */}
          {d.downloads && d.downloads.length > 0 && (
            <div className="dd-block">
              <h2>Forms &amp; Documents</h2>
              <div className="dd-downloads">
                {d.downloads.map((dl, i) => <DownloadLink key={i} {...dl} />)}
              </div>
            </div>
          )}

          {/* 10: Download groups (Water Quality Reports, Revenue forms, Building downloads) */}
          {d.downloadGroups && d.downloadGroups.map((g, i) => (
            <div className="dd-block" key={i}>
              <h2>{g.heading}</h2>
              <div className="dd-downloads">
                {g.items.map((dl, j) => <DownloadLink key={j} {...dl} />)}
              </div>
            </div>
          ))}

          {/* 11: Related links */}
          {d.links && d.links.length > 0 && (
            <div className="dd-block">
              <h2>Links</h2>
              <ul className="dd-links">
                {d.links.map((l, i) => (
                  <li key={i}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label} &rarr;</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 12: Contact and map, full-width band */}
          <div className="dd-contact-band">
            <div className="dd-card">
              <h2>Contact</h2>
              {d.contact.contactName && (
                <div className="dd-row">
                  <span className="dd-label">Contact</span>
                  {d.contact.contactEmail
                    ? <a href={`mailto:${d.contact.contactEmail}`}>{d.contact.contactName}</a>
                    : <span>{d.contact.contactName}</span>}
                </div>
              )}
              <div className="dd-row"><span className="dd-label">Address</span><span>{d.contact.address}</span></div>
              <div className="dd-row">
                <span className="dd-label">Phone</span>
                <a href={telHref(d.contact.phone)}>{d.contact.phone}</a>
              </div>
              {d.contact.altPhone && (
                <div className="dd-row">
                  <span className="dd-label">{d.contact.altPhoneLabel || 'Phone'}</span>
                  {d.contact.altPhoneLabel === 'Fax'
                    ? <span>{d.contact.altPhone}</span>
                    : <a href={telHref(d.contact.altPhone)}>{d.contact.altPhone}</a>}
                </div>
              )}
              {d.contact.customerEmail && (
                <div className="dd-row">
                  <span className="dd-label">Email</span>
                  <a href={`mailto:${d.contact.customerEmail}`}>{d.contact.customerEmail}</a>
                </div>
              )}
              <h3 className="dd-sub">Hours</h3>
              <ul className="dd-hours">
                {d.hours.map((h) => (
                  <li key={h.d}><span>{h.d}</span><span>{h.h}</span></li>
                ))}
              </ul>
            </div>

            {d.noMap ? (
              <div className="dd-map dd-call-card">
                <div className="dd-call-inner">
                  <h3>Need to reach {d.name}?</h3>
                  <p>Call City Hall and ask for the {d.name} Department.</p>
                  <a href="tel:+12564473560" className="dd-call-btn">Call 256-447-3560</a>
                </div>
              </div>
            ) : (
              <div className="dd-map">
                <ParkMap lat={d.lat} lng={d.lng} label={`${d.name}, Piedmont, AL`} />
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="dd-directions">
                  Get directions &rarr;
                </a>
              </div>
            )}
          </div>

          {d.closing && <p className="dd-closing">{d.closing}</p>}

          <Link href="/departments" className="dd-back">&larr; Back to Departments</Link>
        </div>
      </section>
    </>
  );
}
