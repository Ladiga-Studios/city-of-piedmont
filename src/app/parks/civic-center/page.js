import '../../pages.css';
import './civic-center.css';
import Link from 'next/link';
import ParkMap from '@/components/ParkMap';

export const metadata = {
  title: 'Clyde H. Pike Civic Center',
  description:
    'The Clyde H. Pike Civic Center in Piedmont, Alabama: fitness center, gymnasium, walking track, tanning, and rentals. Memberships, hours, and rates.',
};

// 500 Mill St, Piedmont, AL 36272
const LAT = 33.9241877;
const LNG = -85.6020848;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;

export default function CivicCenter() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/parks">Parks &amp; Recreation</Link><span aria-hidden="true">/</span>
            <span>Clyde H. Pike Civic Center</span>
          </nav>
          <p className="eyebrow">Recreation</p>
          <h1>Clyde H. Pike Civic Center</h1>
          <p>Fitness center, gymnasium, walking track, and rental space. Piedmont&rsquo;s hub for recreation and community events.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Intro: photo + text side by side */}
          <div className="cc-intro">
            <figure className="cc-intro-media">
              <picture>
                <source srcSet="/images/photos/civic-center-building.webp" type="image/webp" />
                <img src="/images/photos/civic-center-building.jpg" alt="The Clyde H. Pike Civic Center in Piedmont, Alabama, a two-story brick building with white columns and the Civic Center sign out front" loading="lazy" width="998" height="737" />
              </picture>
            </figure>
            <div className="cc-intro-text">
              <p>
                The Civic Center is named after Clyde H. Pike, an employee at the center for 37 years.
                A dedication ceremony on April 16, 2005 recognized Mr. Pike for his decades of service
                and the influence he had on the many children he helped raise.
              </p>
              <p>
                Today the center offers a full fitness room, a gymnasium, a walking track, a ladies&rsquo;
                fitness area, and a tanning bed, along with rental space for events.
              </p>
            </div>
          </div>

          <div className="cc-grid">
            <div className="cc-block">
              <h2>Visit</h2>
              <div className="cc-row"><span className="cc-label">Address</span><span>500 Mill St, Piedmont, AL 36272</span></div>
              <div className="cc-row"><span className="cc-label">Phone</span><a href="tel:2564473367">(256) 447-3367</a></div>
              <div className="cc-row"><span className="cc-label">Fax</span><span>(256) 447-2497</span></div>
              <div className="cc-row"><span className="cc-label">Membership</span><span>Brittany Humphrey, Membership Coordinator</span></div>
              <h3 className="cc-sub">Hours</h3>
              <ul className="cc-hours">
                <li><span>Mon to Thu</span><span>6:00 AM to 8:00 PM</span></li>
                <li><span>Friday</span><span>6:00 AM to 6:00 PM</span></li>
                <li><span>Saturday</span><span>6:00 AM to 2:00 PM</span></li>
                <li><span>Sunday</span><span>Closed</span></li>
              </ul>

              <div className="cc-map">
                <ParkMap lat={LAT} lng={LNG} label="Clyde H. Pike Civic Center, 500 Mill St, Piedmont, AL" />
                <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="cc-directions">
                  Get directions &rarr;
                </a>
              </div>
            </div>

            <div className="cc-block">
              <h2>Membership Rates</h2>
              <ul className="cc-rates">
                <li><span>Single Membership</span><span>$110 / year</span></li>
                <li><span>Family Membership</span><span>$180 / year</span></li>
                <li><span>Ladies Fitness Center</span><span>$80 / year</span></li>
                <li><span>Student Membership</span><span>$75 / year</span></li>
                <li><span>Walking Track Membership</span><span>$50 / year</span></li>
                <li><span>Day Pass</span><span>$5</span></li>
                <li><span>Room Rental</span><span>$75</span></li>
                <li><span>Gym Rental</span><span>$100</span></li>
                <li><span>Cleaning Deposit</span><span>$50</span></li>
              </ul>
              <h3 className="cc-sub">Tanning Bed</h3>
              <ul className="cc-rates">
                <li><span>Per Visit</span><span>$3.00</span></li>
                <li><span>Members (monthly, unlimited)</span><span>$30.00</span></li>
                <li><span>Non-Members (monthly, unlimited)</span><span>$35.00</span></li>
              </ul>
            </div>
          </div>

          <div className="cc-gallery">
            <img src="/images/photos/civic-center-gym.webp" alt="The gymnasium with a wood basketball court at the Civic Center" loading="lazy" />
            <img src="/images/photos/civic-center-fitness-2.webp" alt="Free weights and benches in the Civic Center fitness room" loading="lazy" />
            <img src="/images/photos/civic-center-fitness-3.webp" alt="Strength machines in the Civic Center fitness room" loading="lazy" />
          </div>

          <div style={{ marginTop: 'var(--s5)' }}>
            <Link href="/parks" className="link">&larr; Back to Parks &amp; Recreation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
