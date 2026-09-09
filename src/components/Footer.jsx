import Link from 'next/link';
import { SITE } from '@/lib/site';
import Seal from './Seal';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-grid">
          {/* Brand + contact + socials */}
          <div className="foot-brand">
            <div className="fb-row">
              <Seal size={64} light />
              <div>
                <div className="name">City of Piedmont</div>
                <div className="tag">{SITE.tagline}</div>
              </div>
            </div>
            <p>
              {SITE.address}<br />
              {SITE.cityState}<br />
              <a href={SITE.phoneHref}>{SITE.phone}</a><br />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            <div className="socials">
              <a href={SITE.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z" /></svg>
              </a>
            </div>
          </div>

          <div className="foot-col">
            <h4>Government</h4>
            <ul>
              <li><Link href="/government/council">Mayor &amp; Council</Link></li>
              <li><Link href="/government/minutes">Agendas &amp; Minutes</Link></li>
              <li><Link href="/government/ordinances">City Ordinances</Link></li>
              <li><Link href="/government/notices">Public Notices &amp; Bids</Link></li>
              <li><Link href="/departments">Departments</Link></li>
            </ul>
          </div>

          <div className="foot-col">
            <h4>Residents</h4>
            <ul>
              <li><Link href="/residents">City Services</Link></li>
              <li><Link href="/residents#utilities">Utilities &amp; Trash</Link></li>
              <li><Link href="/residents#permits">Permits &amp; Licenses</Link></li>
              <li><Link href="/residents#report">Report an Issue</Link></li>
            </ul>
          </div>

          <div className="foot-col">
            <h4>Visitors</h4>
            <ul>
              <li><Link href="/visitors">Things to Do</Link></li>
              <li><Link href="/business">Local Businesses</Link></li>
              <li><Link href="/parks">Parks &amp; Trails</Link></li>
              <li><Link href="/events">Events Calendar</Link></li>
            </ul>
          </div>

          <div className="foot-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href={SITE.payBillUrl} target="_blank" rel="noopener noreferrer">Pay My Bill</a></li>
              <li><Link href="/careers">Jobs &amp; Careers</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/search">Search the Site</Link></li>
            </ul>
          </div>

          <div className="foot-col">
            <h4>Hours</h4>
            <ul>
              <li>Monday – Friday</li>
              <li className="foot-dim">8:00 AM – 5:00 PM</li>
              <li style={{ marginTop: '.6rem' }}>City Hall</li>
              <li className="foot-dim">{SITE.address}</li>
              <li className="foot-dim">{SITE.cityState}</li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© {year} City of Piedmont, Alabama. All rights reserved.</span>
          <span>
            <Link href="/privacy">Privacy Policy</Link> · <Link href="/terms">Terms &amp; Conditions</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
