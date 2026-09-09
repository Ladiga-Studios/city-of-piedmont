import '../pages.css';
import './residents.css';
import Link from 'next/link';

export const metadata = {
  title: 'Residents',
  description:
    'Everyday city services for Piedmont, Alabama residents: pay your utility bill, water/gas/sewer service, trash and brush pickup, building permits, police and fire, severe weather, schools, library, and voting.',
};

const PAY_BILL = 'https://piedmontcity.payacp.com/home';

export default function Residents() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <div className="hero-text-col">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <span>Residents</span>
            </nav>
            <p className="eyebrow">Residents</p>
            <h1>Living in Piedmont</h1>
            <p>
              The everyday services you need as a resident: paying your city bill, starting
              or stopping utilities, trash and brush pickup, permits, public safety, schools,
              and voting. City Hall is at 109 North Center Ave, Piedmont, AL 36272.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="rp-lead">
            <p>
              Most of what residents need from the City runs through a few departments,
              all reachable at City Hall: 256‑447‑3560. Start with the quick actions below,
              or jump to a service area.
            </p>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rp-actions">
            <a className="rp-action" href={PAY_BILL} target="_blank" rel="noopener noreferrer">
              <span className="rp-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </span>
              <span>
                <h3>Pay My Bill</h3>
                <p>Pay your water, gas, sewer, and electric bill online.</p>
                <span className="rp-action-cta">Open payment portal &rarr;</span>
              </span>
            </a>

            <a className="rp-action" href="#report">
              <span className="rp-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <span>
                <h3>Report a Problem</h3>
                <p>Potholes, drainage, brush, streetlights, and code concerns.</p>
                <span className="rp-action-cta">How to report &rarr;</span>
              </span>
            </a>

            <a className="rp-action" href="#permits">
              <span className="rp-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </span>
              <span>
                <h3>Permits &amp; Licensing</h3>
                <p>Building permits, zoning, and contractor lists.</p>
                <span className="rp-action-cta">Get a permit &rarr;</span>
              </span>
            </a>

            <a className="rp-action" href="#safety">
              <span className="rp-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span>
                <h3>Public Safety</h3>
                <p>Police, fire, and severe-weather information.</p>
                <span className="rp-action-cta">Safety info &rarr;</span>
              </span>
            </a>
          </div>

          {/* UTILITIES & TRASH */}
          <div className="rp-section" id="utilities">
            <div className="rp-section-head">
              <p className="eyebrow">Utilities &amp; Sanitation</p>
              <h2>Water, Gas, Sewer &amp; Trash</h2>
              <p>
                The City provides water, natural gas, and sewer service. Set up or stop
                service at the Water &amp; Gas office, and pay all city utilities through
                one online portal.
              </p>
            </div>

            <div className="rp-grid">
              <div className="rp-card">
                <h3>Start or Stop Service</h3>
                <p>New residents apply for water, gas, and sewer at the Water Works office. Bring a photo ID; a deposit may be required.</p>
                <ul>
                  <li><span className="rp-k">Office</span><span className="rp-v">128 South Center Ave</span></li>
                  <li><span className="rp-k">Hours</span><span className="rp-v">Mon–Fri, 8am–5pm</span></li>
                  <li><span className="rp-k">Phone</span><span className="rp-v"><a href="tel:2564473560">256-447-3560</a></span></li>
                </ul>
                <div className="rp-card-links">
                  <a href="https://www.piedmontcity.org/wp-content/uploads/2021/05/application_for_util.pdf" target="_blank" rel="noopener noreferrer">Residential service application (PDF) &rarr;</a>
                  <a href="https://www.piedmontcity.org/wp-content/uploads/2021/05/city_of_piedmont_uti.pdf" target="_blank" rel="noopener noreferrer">Standard service policy (PDF) &rarr;</a>
                </div>
              </div>

              <div className="rp-card">
                <h3>Pay Your Bill</h3>
                <p>Pay water, gas, sewer, and electric online, or in person at the utility office at 128 South Center Ave. Bills are issued monthly.</p>
                <ul>
                  <li><span className="rp-k">Online</span><span className="rp-v"><a href={PAY_BILL} target="_blank" rel="noopener noreferrer">payACP portal</a></span></li>
                  <li><span className="rp-k">In person</span><span className="rp-v">128 South Center Ave</span></li>
                  <li><span className="rp-k">Billing</span><span className="rp-v"><a href="tel:2564473560">256-447-3560</a></span></li>
                </ul>
                <div className="rp-card-links">
                  <a href={PAY_BILL} target="_blank" rel="noopener noreferrer">Pay my bill online &rarr;</a>
                </div>
              </div>

              <div className="rp-card">
                <h3>Trash &amp; Brush Pickup</h3>
                <p>Public Works handles curbside brush and trash pickup, leaf collection, and limb removal. Call to confirm your day or schedule a large-item pickup.</p>
                <ul>
                  <li><span className="rp-k">Supervisor</span><span className="rp-v">Tim Frost</span></li>
                  <li><span className="rp-k">Public Works</span><span className="rp-v"><a href="tel:2564473572">256-447-3572</a></span></li>
                  <li><span className="rp-k">City Hall</span><span className="rp-v"><a href="tel:2564473560">256-447-3560</a></span></li>
                  <li><span className="rp-k">Pickup day</span><span className="rp-v">Call to confirm <span className="rp-placeholder">verify</span></span></li>
                </ul>
              </div>

              <div className="rp-card">
                <h3>Water Quality</h3>
                <p>Piedmont publishes an annual drinking water quality report and PFAS/PFOS testing results from the city filtration plant.</p>
                <ul>
                  <li><span className="rp-k">Plant</span><span className="rp-v">1739 US Hwy 278 E</span></li>
                  <li><span className="rp-k">Phone</span><span className="rp-v"><a href="tel:2564476656">256-447-6656</a></span></li>
                </ul>
                <div className="rp-card-links">
                  <a href="https://www.piedmontcity.org/wp-content/uploads/2025/06/PIEDMONT-2024-ANNUAL-DRINKING-WATER-QUALITY-REPORT.pdf" target="_blank" rel="noopener noreferrer">2024 Water Quality Report (PDF) &rarr;</a>
                  <a href="https://www.piedmontcity.org/wp-content/uploads/2025/06/PIEDMONT-PFAS-PFOS-RESULTS.pdf" target="_blank" rel="noopener noreferrer">PFAS/PFOS results (PDF) &rarr;</a>
                </div>
              </div>
            </div>
          </div>

          {/* PERMITS & REPORT */}
          <div className="rp-section" id="permits">
            <div className="rp-section-head">
              <p className="eyebrow">Building &amp; Code</p>
              <h2>Permits, Zoning &amp; Code Enforcement</h2>
              <p>
                Building, remodeling, or running a business in town usually needs a permit
                or license. The Building Inspection office handles permits, inspections,
                zoning, and code enforcement at City Hall.
              </p>
            </div>

            <div className="rp-grid">
              <div className="rp-card">
                <h3>Building Permits</h3>
                <p>Download the permit application, and use the contractor lists for residential or commercial work. Inspections are scheduled through the inspector.</p>
                <ul>
                  <li><span className="rp-k">Inspector</span><span className="rp-v">Ben Singleton</span></li>
                  <li><span className="rp-k">Phone</span><span className="rp-v"><a href="tel:2564473582">256-447-3582</a></span></li>
                  <li><span className="rp-k">Office</span><span className="rp-v">109 N Center Ave</span></li>
                </ul>
                <div className="rp-card-links">
                  <a href="/documents/building-permit-application.pdf" target="_blank" rel="noopener noreferrer">Building permit application (PDF) &rarr;</a>
                  <a href="/documents/residential-sub-contractor-list.pdf" target="_blank" rel="noopener noreferrer">Residential sub-contractor list (PDF) &rarr;</a>
                  <a href="/documents/commercial-sub-contractor-list.pdf" target="_blank" rel="noopener noreferrer">Commercial sub-contractor list (PDF) &rarr;</a>
                </div>
              </div>

              <div className="rp-card">
                <h3>Zoning</h3>
                <p>Check the zoning map and ordinance before building, dividing a lot, or changing how a property is used.</p>
                <ul>
                  <li><span className="rp-k">Contact</span><span className="rp-v">Building Inspection</span></li>
                  <li><span className="rp-k">Phone</span><span className="rp-v"><a href="tel:2564473582">256-447-3582</a></span></li>
                </ul>
                <div className="rp-card-links">
                  <a href="/documents/zoning-map.pdf" target="_blank" rel="noopener noreferrer">Zoning map (PDF) &rarr;</a>
                  <a href="/documents/zoning-ordinance-2004.pdf" target="_blank" rel="noopener noreferrer">Zoning ordinance (PDF) &rarr;</a>
                  <a href="/government/ordinances">Recently adopted ordinances &rarr;</a>
                </div>
              </div>

              <div className="rp-card" id="report">
                <h3>Report a Problem</h3>
                <p>Report potholes, drainage issues, brush, downed limbs, or code concerns to the right department.</p>
                <ul>
                  <li><span className="rp-k">Streets &amp; drainage</span><span className="rp-v"><a href="tel:2564473572">256-447-3572</a></span></li>
                  <li><span className="rp-k">Code enforcement</span><span className="rp-v">Charles McDonald</span></li>
                  <li><span className="rp-k">Code phone</span><span className="rp-v"><a href="tel:2564473562">256-447-3562</a></span></li>
                  <li><span className="rp-k">General</span><span className="rp-v"><a href="tel:2564473560">256-447-3560</a></span></li>
                </ul>
                <div className="rp-card-links">
                  <a href="/contact">City contact page &rarr;</a>
                </div>
              </div>

              <div className="rp-card">
                <h3>Business License</h3>
                <p>Businesses operating in Piedmont need a city business license through the Revenue department.</p>
                <ul>
                  <li><span className="rp-k">Contact</span><span className="rp-v">Amy Rawson, Revenue</span></li>
                  <li><span className="rp-k">Phone</span><span className="rp-v"><a href="tel:2564473564">256-447-3564</a></span></li>
                  <li><span className="rp-k">Details</span><span className="rp-v">Confirm fees <span className="rp-placeholder">verify</span></span></li>
                </ul>
                <div className="rp-card-links">
                  <a href="/documents/business-license-application.pdf" target="_blank" rel="noopener noreferrer">Business license application (PDF) &rarr;</a>
                  <a href="/departments/revenue">Revenue department &rarr;</a>
                  <a href="/government/ordinances#ordinance-639">Ordinance 639: prohibited products &rarr;</a>
                </div>
              </div>

              <div className="rp-card">
                <h3>Short-Term Rentals</h3>
                <p>Renting a house or room for less than 30 days requires a city STR license under Ordinance 636. Get licensed before you list.</p>
                <ul>
                  <li><span className="rp-k">License</span><span className="rp-v">Annual, per unit, up to $100</span></li>
                  <li><span className="rp-k">Insurance</span><span className="rp-v">$500,000 general liability minimum</span></li>
                  <li><span className="rp-k">Contact required</span><span className="rp-v">24/7, on site within 12 hours</span></li>
                  <li><span className="rp-k">Occupancy</span><span className="rp-v">Two per bedroom, plus two</span></li>
                  <li><span className="rp-k">Apply</span><span className="rp-v">Business License Division, <a href="tel:2564473564">256-447-3564</a></span></li>
                </ul>
                <div className="rp-card-links">
                  <a href="/government/ordinances#ordinance-636">Ordinance 636: short-term rentals &rarr;</a>
                  <a href="/documents/ordinance-636-short-term-rentals.pdf" target="_blank" rel="noopener noreferrer">Full ordinance (PDF) &rarr;</a>
                </div>
              </div>
            </div>
          </div>

          {/* PUBLIC SAFETY & SEVERE WEATHER */}
          <div className="rp-section" id="safety">
            <div className="rp-section-head">
              <p className="eyebrow">Public Safety</p>
              <h2>Police, Fire &amp; Severe Weather</h2>
              <p>
                For any emergency, call 911. The numbers below are for non-emergency
                business and for staying informed during Alabama’s storm season.
              </p>
            </div>

            <div className="rp-911">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>In an emergency, call <strong>911</strong></span>
            </div>

            <div className="rp-grid">
              <div className="rp-card">
                <h3>Police Department</h3>
                <p>Non-emergency police business, reports, and questions.</p>
                <ul>
                  <li><span className="rp-k">Chief</span><span className="rp-v">Nathan Johnson</span></li>
                  <li><span className="rp-k">Phone</span><span className="rp-v"><a href="tel:2564479091">256-447-9091</a></span></li>
                  <li><span className="rp-k">Address</span><span className="rp-v">121 West Ladiga St</span></li>
                </ul>
              </div>

              <div className="rp-card">
                <h3>Fire Department</h3>
                <p>Non-emergency fire business and questions. For a fire emergency, call 911.</p>
                <ul>
                  <li><span className="rp-k">Chief</span><span className="rp-v">Todd Kirkland</span></li>
                  <li><span className="rp-k">Business</span><span className="rp-v"><a href="tel:2564473364">256-447-3364</a></span></li>
                  <li><span className="rp-k">Fire calls</span><span className="rp-v"><a href="tel:2564479011">256-447-9011</a></span></li>
                  <li><span className="rp-k">Address</span><span className="rp-v">312 North Center Ave</span></li>
                </ul>
              </div>

              <div className="rp-card rp-alert">
                <h3>Severe Weather</h3>
                <p>Northeast Alabama sees severe storms and tornadoes, mainly in spring and fall. Have more than one way to get warnings. When the City issues an advisory, it appears in the alert banner at the top of every page on this site.</p>
                <ul>
                  <li><span className="rp-k">County alerts</span><span className="rp-v">Calhoun County EMA</span></li>
                  <li><span className="rp-k">Watch vs warning</span><span className="rp-v">Warning = take cover now</span></li>
                </ul>
                <div className="rp-card-links">
                  <a href="https://www.weather.gov/bmx/" target="_blank" rel="noopener noreferrer">NWS Birmingham forecast &rarr;</a>
                  <a href="https://calhounema.org/" target="_blank" rel="noopener noreferrer">Calhoun County EMA &rarr;</a>
                </div>
              </div>
            </div>
          </div>

          {/* SCHOOLS, LIBRARY, ELECTIONS */}
          <div className="rp-section" id="community">
            <div className="rp-section-head">
              <p className="eyebrow">Community</p>
              <h2>Schools, Library &amp; Voting</h2>
              <p>
                Piedmont City Schools serve the city, the public library sits downtown,
                and county and state offices handle voter registration and elections.
              </p>
            </div>

            <div className="rp-grid">
              <div className="rp-card">
                <h3>Piedmont City Schools</h3>
                <p>Piedmont operates its own city school system: an elementary, middle, and high school.</p>
                <div className="rp-card-links">
                  <a href="http://www.piedmontelementary.org/" target="_blank" rel="noopener noreferrer">Piedmont Elementary &rarr;</a>
                  <a href="http://www.piedmontmiddle.org/" target="_blank" rel="noopener noreferrer">Piedmont Middle &rarr;</a>
                  <a href="http://www.piedmonthigh.org/" target="_blank" rel="noopener noreferrer">Piedmont High &rarr;</a>
                </div>
              </div>

              <div className="rp-card">
                <h3>Public Library</h3>
                <p>The Piedmont Public Library offers books, computers, and community programs downtown.</p>
                <ul>
                  <li><span className="rp-k">Hours</span><span className="rp-v">Confirm with library <span className="rp-placeholder">verify</span></span></li>
                </ul>
                <div className="rp-card-links">
                  <a href="https://www.piedmontcity.org/departments/library/" target="_blank" rel="noopener noreferrer">Library page &rarr;</a>
                </div>
              </div>

              <div className="rp-card">
                <h3>Voting &amp; Elections</h3>
                <p>Piedmont is in Calhoun County. Register to vote and find your polling place through the county and state.</p>
                <ul>
                  <li><span className="rp-k">County</span><span className="rp-v">Calhoun County</span></li>
                </ul>
                <div className="rp-card-links">
                  <a href="https://www.sos.alabama.gov/alabama-votes" target="_blank" rel="noopener noreferrer">Alabama Votes (register / check status) &rarr;</a>
                  <a href="https://www.calhouncounty.org/" target="_blank" rel="noopener noreferrer">Calhoun County &rarr;</a>
                </div>
              </div>

              <div className="rp-card">
                <h3>Shop Local</h3>
                <p>Browse locally owned restaurants, retail, and services in town through the city business directory.</p>
                <div className="rp-card-links">
                  <Link href="/business">Local business directory &rarr;</Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
