import '../pages.css';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import LiveHoursBadge from '@/components/LiveHoursBadge';
import { DEPARTMENTS } from '@/lib/departments';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: "Contact City Hall",
  description:
    "Contact the City of Piedmont, Alabama: City Hall address, main phone, email and office hours, plus the phone number and location of each city department.",
  path: "/contact",
});

const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${SITE.address}, ${SITE.cityState}`
)}`;

function Ico({ d }) {
  return (
    <span className="cc-ico" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
    </span>
  );
}

export default function Contact() {
  return (<>
    <section className="page-hero"><div className="container inner">
      <div className="hero-text-col">
        <nav className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Contact</span></nav>
        <p className="eyebrow">Get in Touch</p><h1>Contact the City</h1>
        <p>Questions, requests, or feedback? Call, email, or visit City Hall — every way to reach the city is below.</p>
      </div>
    </div></section>

    <section className="section"><div className="container contact-grid contact-grid-solo">
      <div className="contact-cards">
        <div className="cc-card">
          <Ico d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
          <div className="cc-body">
            <h2>City Hall</h2>
            <p>{SITE.address}<br />{SITE.cityState}</p>
            <p className="cc-note"><a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">Get directions →</a></p>
          </div>
        </div>

        <div className="cc-card">
          <Ico d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z" />
          <div className="cc-body">
            <h2>Phone</h2>
            <p><a href={SITE.phoneHref}>{SITE.phone}</a></p>
            <p className="cc-note">For emergencies, always dial 911.</p>
          </div>
        </div>

        <div className="cc-card">
          <Ico d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM3 7l9 6 9-6" />
          <div className="cc-body">
            <h2>Email</h2>
            <p><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
          </div>
        </div>

        <div className="cc-card">
          <Ico d="M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2" />
          <div className="cc-body">
            <h2>Hours</h2>
            <p>Monday – Friday: 8:00 AM – 5:00 PM</p>
            <LiveHoursBadge />
          </div>
        </div>
      </div>
      {/* Contact form temporarily removed until email sending (Resend) is
          configured. To restore: re-add
            import ContactForm from '@/components/ContactForm';
          at the top and <ContactForm /> here, and change the grid class
          below back from "contact-grid contact-grid-solo" to "contact-grid". */}
    </div></section>

    {/* DEPARTMENT DIRECTORY: who to call for what, from the same data as the
        department pages (lib/departments.js), so it never drifts from them. */}
    <section className="section" style={{ background: 'var(--paper-2)' }}>
      <div className="container">
        <div className="section-head" style={{ marginBottom: 'var(--s4)' }}>
          <div><p className="eyebrow">Department Directory</p><h2>Reach the Right Office</h2></div>
        </div>
        <p style={{ maxWidth: '68ch', marginBottom: 'var(--s4)', color: 'var(--ink-2)' }}>
          City Hall&rsquo;s main line, {SITE.phone}, can route any call. If you already know which
          department handles your question, the direct number, location, and office hours for each
          one are listed below. Each department page has staff contacts, services, and forms.
        </p>
        <div className="card-grid">
          {DEPARTMENTS.map((d) => (
            <div key={d.slug} className="info-card">
              <h3><Link href={`/departments/${d.slug}`}>{d.name}</Link></h3>
              <p>{d.short}</p>
              {d.contact?.phone && <p><strong>Phone:</strong> {d.contact.phone}</p>}
              {d.contact?.address && <p><strong>Location:</strong> {d.contact.address}</p>}
              {d.hours?.[0] && <p><strong>Hours:</strong> {d.hours[0].d}, {d.hours[0].h}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  </>);
}
