import '../../pages.css';
import '../chief-ladiga-trail/park-detail.css';
import Link from 'next/link';
import ParkMap from '@/components/ParkMap';

export const metadata = {
  title: 'Pinhoti Trail',
  description:
    'The Pinhoti Trail is a 335-mile hiking trail from Flagg Mountain, Alabama into Georgia, passing Piedmont. Trailheads, the Chief Ladiga junction, and Dugger Mountain Wilderness access.',
};

// Pinhoti access points around Piedmont. Coordinates are the trailhead
// parking areas (Alabama Recreation Trails / Pinhoti Trail Alliance data).
const ACCESS_POINTS = [
  { lat: 33.9226414, lng: -85.6071317, label: 'Eubanks Welcome Center: in-town access via the Chief Ladiga Trail' },
  { lat: 33.97894, lng: -85.48037, label: 'High Point Trailhead: US 278, east of Piedmont' },
  { lat: 33.87829, lng: -85.55144, label: 'North FS 500 Trailhead: Dugger Mountain Wilderness, north side' },
  { lat: 33.83263, lng: -85.62484, label: 'Burns Trailhead: CR 55, Dugger Mountain Wilderness, south side' },
];

const dirUrl = (p) => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;

export default function Pinhoti() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/parks">Parks &amp; Recreation</Link><span aria-hidden="true">/</span>
            <span>Pinhoti Trail</span>
          </nav>
          <p className="eyebrow">Hike the Foothills</p>
          <h1>Pinhoti Trail</h1>
          <p>A 335-mile footpath through the southern Appalachians, passing right by Piedmont on its way from Flagg Mountain, Alabama to the Georgia mountains.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="pd-layout">
            <div className="pd-main">
              <div className="prose">
                <p>The Pinhoti Trail runs about 335 miles from Flagg Mountain near Weogufka, Alabama into north Georgia, with roughly 171 of those miles in Alabama. Through the Benton MacKaye Trail it connects to the Appalachian Trail, and Piedmont is one of the last towns the trail passes before crossing the state line.</p>

                <h2>The Pinhoti in Piedmont</h2>
                <p>North of town, the Pinhoti descends from the ridges and joins the <Link href="/parks/chief-ladiga-trail">Chief Ladiga Trail</Link> for about 0.7 miles before climbing back into the woods toward the Georgia line. Piedmont serves as a trail town for through-hikers: groceries, restaurants, lodging, and a post office are all a short distance from the trail, and the Eubanks Welcome Center on Dailey Street offers parking, restrooms, and water.</p>

                <h2>Trail facts</h2>
                <ul>
                  <li>Length: about 335 miles total; roughly 171 miles in Alabama</li>
                  <li>Use: foot travel only on the Alabama sections</li>
                  <li>Marked with blue blazes and the Pinhoti&rsquo;s turkey-track emblem</li>
                  <li>Crosses the Dugger Mountain Wilderness south of Piedmont: over 9,000 acres, with 2,140-ft Dugger Mountain, Alabama&rsquo;s second-highest peak</li>
                  <li>Backcountry shelters near Piedmont include Oakey Mountain and North Dugger Mountain</li>
                  <li>Connects to the Appalachian Trail via the Benton MacKaye Trail in Georgia</li>
                </ul>

                <h2>Getting on the trail</h2>
                <p>Four access points serve the Piedmont area, shown on the map. The easiest walk-on access is from the Chief Ladiga Trail at the Eubanks Welcome Center; ride or walk north on the Ladiga to the marked Pinhoti junction. For day hikes by car, the High Point Trailhead on US 278 east of town has the largest parking area. The Burns Trailhead on County Road 55 and the North FS 500 Trailhead (reached by a gravel Forest Service road off CR 55) bracket the Dugger Mountain Wilderness section to the south.</p>
                <p>For trail conditions and maps, see the Pinhoti Trail Alliance; for local information, call the City of Piedmont at 256‑447‑3560.</p>
              </div>

              <figure className="photo-figure">
                <picture>
                  <source srcSet="/images/photos/pinhoti-trail.webp" type="image/webp" />
                  <img src="/images/photos/pinhoti-trail.jpg" alt="A wooden Pinhoti Trail sign with a blue directional arrow in the woods near Piedmont" loading="lazy" width="1920" height="1080" />
                </picture>
                <figcaption>
                  <span>Pinhoti Trail signage in the woods near Piedmont.</span>
                </figcaption>
              </figure>
            </div>

            <aside className="pd-info">
              <div className="pd-card">
                <h2>Trailheads</h2>

                <div className="pd-map">
                  <ParkMap
                    points={ACCESS_POINTS}
                    label="Pinhoti Trail access points around Piedmont, AL"
                    height={300}
                  />
                </div>

                <div className="pd-row">
                  <span className="pd-label">Eubanks Welcome Center</span>
                  <span>202 Dailey St, with in-town access via the Chief Ladiga Trail</span>
                  <a href={dirUrl(ACCESS_POINTS[0])} target="_blank" rel="noopener noreferrer">Get directions &rarr;</a>
                </div>
                <div className="pd-row">
                  <span className="pd-label">High Point Trailhead</span>
                  <span>US 278, about 8.5 miles east of downtown</span>
                  <a href={dirUrl(ACCESS_POINTS[1])} target="_blank" rel="noopener noreferrer">Get directions &rarr;</a>
                </div>
                <div className="pd-row">
                  <span className="pd-label">North FS 500 Trailhead</span>
                  <span>Gravel FS 500 off CR 55, on the north side of Dugger Mountain Wilderness</span>
                  <a href={dirUrl(ACCESS_POINTS[2])} target="_blank" rel="noopener noreferrer">Get directions &rarr;</a>
                </div>
                <div className="pd-row">
                  <span className="pd-label">Burns Trailhead</span>
                  <span>CR 55 (Rabbittown Rd), on the south side of Dugger Mountain Wilderness</span>
                  <a href={dirUrl(ACCESS_POINTS[3])} target="_blank" rel="noopener noreferrer">Get directions &rarr;</a>
                </div>
              </div>
            </aside>
          </div>

          <Link href="/parks" className="pd-back">&larr; Back to Parks &amp; Recreation</Link>
        </div>
      </section>
    </>
  );
}
