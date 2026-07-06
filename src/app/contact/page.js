import '../pages.css';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import ContactForm from '@/components/ContactForm';
import PageHeroPhoto from '@/components/PageHeroPhoto';
import LiveHoursBadge from '@/components/LiveHoursBadge';

export const metadata = { title: 'Contact', description: 'Contact the City of Piedmont, Alabama. City Hall address, phone, email, and hours.' };

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
    <section className="page-hero"><div className="container inner has-photo">
      <div className="hero-text-col">
        <nav className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Contact</span></nav>
        <p className="eyebrow">Get in Touch</p><h1>Contact the City</h1>
        <p>Questions, requests, or feedback? Reach City Hall directly or send a message below.</p>
      </div>
      <PageHeroPhoto src="/images/photos/eubanks-welcome-center.jpg" webp="/images/photos/eubanks-welcome-center.webp" alt="The Eubanks Welcome Center in Piedmont with its red railroad caboose" />
    </div></section>

    <section className="section"><div className="container contact-grid">
      <div className="contact-cards">
        <div className="cc-card">
          <Ico d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
          <div className="cc-body">
            <h3>City Hall</h3>
            <p>{SITE.address}<br />{SITE.cityState}</p>
            <p className="cc-note"><a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">Get directions →</a></p>
          </div>
        </div>

        <div className="cc-card">
          <Ico d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z" />
          <div className="cc-body">
            <h3>Phone</h3>
            <p><a href={SITE.phoneHref}>{SITE.phone}</a></p>
            <p className="cc-note">For emergencies, always dial 911.</p>
          </div>
        </div>

        <div className="cc-card">
          <Ico d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM3 7l9 6 9-6" />
          <div className="cc-body">
            <h3>Email</h3>
            <p><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
          </div>
        </div>

        <div className="cc-card">
          <Ico d="M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2" />
          <div className="cc-body">
            <h3>Hours</h3>
            <p>Monday – Thursday: 7:30 AM – 4:30 PM<br />Friday: 7:30 AM – 11:30 AM</p>
            <LiveHoursBadge />
          </div>
        </div>
      </div>
      <ContactForm />
    </div></section>
  </>);
}
