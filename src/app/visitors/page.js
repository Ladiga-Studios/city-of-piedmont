import '../pages.css';
import './visitors.css';
import Link from 'next/link';
import ParkMap from '@/components/ParkMap';

export const metadata = {
  title: 'Visitors',
  description:
    'Plan a visit to Piedmont, Alabama: the Chief Ladiga Trail, Terrapin Creek, Dugger Mountain, historic downtown, Veterans Memorial Park, and family recreation, all at the foot of the Appalachians.',
};

// Eubanks Welcome Center
const WC_LAT = 33.9226414;
const WC_LNG = -85.6071317;
const WC_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${WC_LAT},${WC_LNG}`;

const THINGS = [
  {
    title: 'Chief Ladiga Trail',
    desc: '33 miles of paved rail-trail for walking, running, and cycling. Alabama’s first rails-to-trails project, connecting to Georgia’s Silver Comet Trail.',
    img: '/images/photos/trail-fall',
    alt: 'A cyclist on the Chief Ladiga Trail under fall foliage near Piedmont',
    href: '/parks/chief-ladiga-trail',
    link: 'Trail details',
  },
  {
    title: 'Terrapin Creek',
    desc: 'Clear, gentle water for kayaking, canoeing, and fishing. One of the most popular floats in northeast Alabama, with local outfitters and shuttles.',
    img: '/images/photos/terrapin-creek',
    alt: 'Terrapin Creek winding through wooded banks near Piedmont',
    href: '/parks/terrapin-creek',
    link: 'About the creek',
  },
  {
    title: 'Dugger Mountain',
    desc: 'Alabama’s second-highest peak, in the nearby Dugger Mountain Wilderness, with hiking along the Pinhoti Trail through the Appalachian foothills.',
    img: '/images/photos/dugger-mountain',
    alt: 'Dugger Mountain in the Appalachian foothills near Piedmont',
  },
  {
    title: 'Aquatic Center',
    desc: 'Seasonal swimming, lap lanes, a water slide, and a kids’ splash area. A favorite for families in the warmer months.',
    img: '/images/photos/aquatic-overview',
    alt: 'The Piedmont Aquatic Center pool and water slide',
    href: '/parks/aquatic-center',
    link: 'Visit the Aquatic Center',
  },
  {
    title: 'Fagan’s Park',
    desc: 'A family-friendly park with a playground, pickleball and basketball courts, a covered picnic pavilion, and a walking track.',
    img: '/images/photos/fagans-park-courts',
    alt: 'The courts at Fagan’s Park in Piedmont',
    href: '/parks/fagans-park',
    link: 'Visit Fagan’s Park',
  },
];

export default function Visitors() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <span>Visitors</span>
          </nav>
          <p className="eyebrow">Visitors</p>
          <h1>Visit Piedmont</h1>
          <p>At the foot of the Appalachians on the Chief Ladiga Trail, Piedmont is a base for hiking, paddling, and small-town downtown days.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* HERO PHOTO */}
          <figure className="vp-hero">
            <picture>
              <source srcSet="/images/photos/visit-hero.webp" type="image/webp" />
              <img src="/images/photos/visit-hero.jpg" alt="Dugger Mountain in fall color rising above an open field near Piedmont, Alabama" width="2200" height="825" />
            </picture>
            <figcaption>Dugger Mountain, in the Appalachian foothills just outside Piedmont.</figcaption>
          </figure>

          {/* LEAD */}
          <div className="vp-lead">
            <p>Piedmont packs a lot into a small footprint: a nationally known rail-trail, clear-water paddling, mountain hiking, a walkable historic downtown, and easy family recreation. Here’s what to see and do while you’re here.</p>
          </div>

          {/* THINGS TO DO GRID */}
          <div className="vp-head">
            <p className="eyebrow">Things to Do</p>
            <h2>Get Outside &amp; Explore</h2>
          </div>
          <div className="vp-grid">
            {THINGS.map((t) => {
              const inner = (
                <>
                  <div className="vp-card-img">
                    <picture>
                      <source srcSet={`${t.img}.webp`} type="image/webp" />
                      <img src={`${t.img}.jpg`} alt={t.alt} loading="lazy" />
                    </picture>
                  </div>
                  <div className="vp-card-body">
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                    {t.href && <span className="vp-card-link">{t.link} &rarr;</span>}
                  </div>
                </>
              );
              return t.href
                ? <Link key={t.title} href={t.href} className="vp-card">{inner}</Link>
                : <div key={t.title} className="vp-card">{inner}</div>;
            })}
          </div>

          {/* DOWNTOWN FEATURE */}
          <div className="vp-feature">
            <figure className="vp-feature-media">
              <picture>
                <source srcSet="/images/photos/downtown-2.webp" type="image/webp" />
                <img src="/images/photos/downtown-2.jpg" alt="A historic downtown Piedmont storefront with a vintage Coca-Cola mural" loading="lazy" />
              </picture>
            </figure>
            <div className="vp-feature-text">
              <p className="eyebrow">Downtown</p>
              <h2>Historic Downtown Piedmont</h2>
              <p>Piedmont’s downtown is a walkable stretch of brick storefronts, local shops, and restaurants, including vintage signs and murals that nod to the city’s railroad-era past. It’s an easy place to park, stroll, grab a bite, and shop local.</p>
              <p><Link href="/business" className="vp-card-link">Browse the business directory &rarr;</Link></p>
            </div>
          </div>

          {/* MEMORIAL PARK FEATURE */}
          <div className="vp-feature flip">
            <figure className="vp-feature-media">
              <picture>
                <source srcSet="/images/photos/memorial-park.webp" type="image/webp" />
                <img src="/images/photos/memorial-park.jpg" alt="Veterans Memorial Park in Piedmont with flags, a memorial, and a pond" loading="lazy" />
              </picture>
            </figure>
            <div className="vp-feature-text">
              <p className="eyebrow">A Quiet Stop</p>
              <h2>Veterans Memorial Park</h2>
              <p>A peaceful spot honoring local veterans, with flags, memorials, a pond, and a walking track. It’s a nice place to pause, reflect, and take a quiet walk close to the center of town.</p>
            </div>
          </div>

          {/* PLAN YOUR VISIT */}
          <div className="vp-plan">
            <p className="eyebrow">Plan Your Visit</p>
            <h2>Start at the Welcome Center</h2>
            <p style={{ color: 'var(--ink-2)', maxWidth: '70ch', marginTop: '.5rem' }}>
              The Eubanks Welcome Center on Dailey Street serves the Piedmont section of the Chief Ladiga Trail and is a good first stop for trail information, parking, restrooms, water, and a shaded gazebo for riders.
            </p>
            <figure className="vp-plan-photo">
              <picture>
                <source srcSet="/images/photos/eubanks-welcome-center.webp" type="image/webp" />
                <img src="/images/photos/eubanks-welcome-center.jpg" alt="The Eubanks Welcome Center in Piedmont, Alabama, the starting point for the Chief Ladiga Trail" loading="lazy" width="1100" height="825" />
              </picture>
            </figure>
            <div className="vp-plan-grid">
              <div>
                <div className="vp-info-row"><span className="vp-info-label">Welcome Center</span><span>Eubanks Welcome Center</span></div>
                <div className="vp-info-row"><span className="vp-info-label">Address</span><span>202 Dailey St, Piedmont, AL 36272</span></div>
                <div className="vp-info-row"><span className="vp-info-label">Phone</span><a href="tel:2564473363">(256) 447-3363</a></div>
                <div className="vp-info-row"><span className="vp-info-label">City Info</span><a href="tel:2564473560">(256) 447-3560</a></div>
                <div className="vp-info-row"><span className="vp-info-label">On Site</span><span>Parking, restrooms, water, gazebo</span></div>
              </div>
              <div className="vp-map">
                <ParkMap lat={WC_LAT} lng={WC_LNG} label="Eubanks Welcome Center, Chief Ladiga Trail, Piedmont, AL" />
                <a href={WC_DIRECTIONS} target="_blank" rel="noopener noreferrer" className="vp-directions">
                  Get directions &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
