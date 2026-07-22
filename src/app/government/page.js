import '../pages.css';
import Link from 'next/link';

export const metadata = { title: 'City Government', description: 'Mayor, City Council, meeting minutes, ordinances, and public notices for the City of Piedmont, Alabama.' };

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const CardArrow = () => (
  <svg className="card-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export default function Government() {
  return (<>
    <section className="page-hero"><div className="container inner">
      <div className="hero-text-col">
        <nav className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Government</span></nav>
        <p className="eyebrow">City of Piedmont</p><h1>City Government</h1>
        <p>Piedmont operates under a Mayor–Council form of government. Find your representatives, read meeting minutes, and review public notices.</p>
      </div>
    </div></section>

    <section className="section"><div className="container">
      <div className="card-grid">
        <Link href="/government/council" className="info-card">
          <span className="card-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.4 1.4-4.4 3.5-5.2"/></svg></span>
          <h3>Mayor &amp; City Council</h3><p>Meet your elected officials and find contact information.</p>
          <CardArrow />
        </Link>
        <Link href="/government/minutes" className="info-card">
          <span className="card-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM9 13h6M9 17h6"/></svg></span>
          <h3>Council Meeting Minutes</h3><p>Read and download official records of council proceedings.</p>
          <CardArrow />
        </Link>
        <Link href="/government/notices" className="info-card">
          <span className="card-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h18M3 12h18M3 19h12M19 16l2 2-2 2"/></svg></span>
          <h3>Public Notices &amp; Bids</h3><p>Current public notices, bid requests, and legal announcements.</p>
          <CardArrow />
        </Link>
      </div>
    </div></section>

    {/* Mayor & Council feature */}
    <section className="section" style={{ paddingTop: 0 }}><div className="container">
      <div className="gov-feature">
        <div className="gf-media">
          <img src="/images/council/kevin-farmer.jpg" alt="Kevin Farmer, Mayor of Piedmont, Alabama" loading="lazy" />
        </div>
        <div className="gf-body">
          <p className="eyebrow">Your Elected Officials</p>
          <h2>Mayor Kevin Farmer &amp; the City Council</h2>
          <p>
            The Mayor and a seven-member City Council, elected by district, set policy and
            direct city services. Council meetings are open to the public, and minutes are
            posted after each meeting.
          </p>
          <Link href="/government/council" className="btn btn-primary">Meet the Mayor &amp; Council <Arrow /></Link>
        </div>
      </div>
    </div></section>
  </>);
}
