import '../../pages.css';
import '../civic-center/civic-center.css';
import './fagans-park.css';
import Link from 'next/link';
import ParkMap from '@/components/ParkMap';

export const metadata = {
  title: "Fagan's Park",
  description:
    "Fagan's Park in Piedmont, Alabama: a family-friendly park on McFarland Avenue with a playground, pickleball and basketball courts, a covered picnic pavilion, and a walking track at the foot of the Appalachian foothills.",
};

// McFarland Ave, Piedmont, AL 36272
const LAT = 33.9253934;
const LNG = -85.6019447;
const ADDRESS = 'McFarland Ave, Piedmont, AL 36272';
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;

const AMENITIES = [
  { k: 'Playground', v: 'Swings, slides, and climbing structures for younger kids' },
  { k: 'Pickleball & Tennis', v: 'Resurfaced courts with nets for both sports' },
  { k: 'Basketball', v: 'Outdoor basketball goals and open court' },
  { k: 'Picnic Pavilion', v: 'Covered pavilion with picnic tables for groups' },
  { k: 'Walking Track', v: 'A track around the park for walking and exercise' },
  { k: 'Open Green', v: 'Wide-open field for games and gatherings' },
];

export default function FagansPark() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/parks">Parks &amp; Recreation</Link><span aria-hidden="true">/</span>
            <span>Fagan&rsquo;s Park</span>
          </nav>
          <p className="eyebrow">City Parks</p>
          <h1>Fagan&rsquo;s Park</h1>
          <p>A family-friendly park on McFarland Avenue with a playground, courts, a covered picnic pavilion, and a walking track, with the foothills as a backdrop.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Hero photo */}
          <figure className="photo-figure fp-hero" style={{ marginBottom: 'var(--s5)' }}>
            <picture>
              <source srcSet="/images/photos/fagans-park-hero.webp" type="image/webp" />
              <img src="/images/photos/fagans-park-hero.jpg" alt="Pickleball courts at Fagan's Park in Piedmont, Alabama, with shade trees and the foothills behind" loading="lazy" width="1920" height="823" />
            </picture>
          </figure>

          {/* Two-column: write-up + info/map sidebar */}
          <div className="fp-layout">
            <div className="fp-main">
              <div className="prose">
                <p>
                  Fagan&rsquo;s Park is one of Piedmont&rsquo;s favorite spots to spend an afternoon
                  with the family. Sitting near the heart of town next to the Clyde H. Pike Civic
                  Center, it brings together a playground, sports courts, a covered picnic area, and
                  a walking track in one easy-to-reach green space.
                </p>
                <p>
                  Kids have a full playground with swings, slides, and climbing structures, while the
                  resurfaced courts are set up for both pickleball and tennis. There are outdoor
                  basketball goals, a walking track for a lap or two, and plenty of open field for a
                  pickup game or just running around. When it&rsquo;s time to eat, the covered picnic
                  pavilion has tables and shade for birthday parties, cookouts, and group gatherings.
                </p>
                <p>
                  Whether you&rsquo;re bringing the kids for the morning, meeting friends for a game,
                  or setting up a family picnic, Fagan&rsquo;s Park is an easy, welcoming place to
                  get outside in Piedmont.
                </p>
              </div>

              <div className="cc-features">
                <div className="cc-feature">
                  <h3>Playground &amp; Courts</h3>
                  <p>A full playground for the kids, plus pickleball, tennis, and basketball courts for all ages.</p>
                </div>
                <div className="cc-feature">
                  <h3>Picnic Pavilion</h3>
                  <p>A covered pavilion with picnic tables, great for parties, cookouts, and group events.</p>
                </div>
                <div className="cc-feature">
                  <h3>Walking Track</h3>
                  <p>A walking track and wide-open green space for exercise, games, and gatherings.</p>
                </div>
              </div>
            </div>

            <aside className="fp-info">
              <div className="fp-card">
                <h2>Visit the Park</h2>
                <div className="fp-row">
                  <span className="fp-label">Address</span>
                  <span>{ADDRESS}</span>
                </div>
                <div className="fp-row">
                  <span className="fp-label">Cost</span>
                  <span>Free, open to the public</span>
                </div>

                <div className="fp-map">
                  <ParkMap lat={LAT} lng={LNG} label="Fagan's Park, McFarland Ave, Piedmont, AL" />
                  <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="fp-directions">
                    Get directions &rarr;
                  </a>
                </div>
              </div>
            </aside>
          </div>

          {/* Gallery */}
          <div className="cc-gallery">
            <picture>
              <source srcSet="/images/photos/fagans-park-playground.webp" type="image/webp" />
              <img src="/images/photos/fagans-park-playground.jpg" alt="The playground at Fagan's Park with a climbing structure and slides" loading="lazy" width="1600" height="1200" />
            </picture>
            <picture>
              <source srcSet="/images/photos/fagans-park-pavilion.webp" type="image/webp" />
              <img src="/images/photos/fagans-park-pavilion.jpg" alt="The covered picnic pavilion at Fagan's Park with picnic tables" loading="lazy" width="1600" height="1200" />
            </picture>
            <picture>
              <source srcSet="/images/photos/fagans-park-field.webp" type="image/webp" />
              <img src="/images/photos/fagans-park-field.jpg" alt="A basketball goal and open field at Fagan's Park with the mountains in the distance" loading="lazy" width="1600" height="1200" />
            </picture>
          </div>

          <div style={{ marginTop: 'var(--s5)' }}>
            <Link href="/parks" className="link">&larr; Back to Parks &amp; Recreation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
