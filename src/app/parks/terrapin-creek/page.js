import '../../pages.css';
import './park-detail.css';
import Link from 'next/link';
import ParkMap from '@/components/ParkMap';

export const metadata = {
  title: 'Terrapin Creek',
  description:
    'Terrapin Creek near Piedmont, Alabama: clear water for paddling, fishing, and relaxing in the Appalachian foothills. Public boat launch, local outfitters, and shuttle service.',
};

// Terrapin Creek public boat launch / fishing area, Co Rd 8
const LAT = 33.9791012;
const LNG = -85.602122;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;

export default function Creek() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/parks">Parks &amp; Recreation</Link><span aria-hidden="true">/</span>
            <span>Terrapin Creek</span>
          </nav>
          <p className="eyebrow">On the Water</p>
          <h1>Terrapin Creek</h1>
          <p>One of the area&rsquo;s natural treasures, with clear water for paddling, fishing, and quiet afternoons.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="pd-layout">
            <div className="pd-main">
              <div className="prose">
                <p>Terrapin Creek is one of the most popular floats in northeast Alabama. Clear, gentle water winds through the foothills, with rock walls, sandbars, and plenty of spots to stop along the way. It&rsquo;s a favorite for kayaking, canoeing, and fishing, and an easy, family-friendly paddle.</p>
                <h2>Putting in</h2>
                <p>There&rsquo;s a public boat launch and fishing area off County Road 8, north of Piedmont, where you can put in or just relax by the water. A typical float runs several hours depending on water levels and where you take out.</p>
                <h2>Outfitters &amp; rentals</h2>
                <p>Several local outfitters rent canoes and kayaks and run shuttle service so you can paddle one direction and get a ride back to your car:</p>
                <ul>
                  <li>Terrapin Outdoor Center: rentals, sales, and shuttles (256-447-8383)</li>
                  <li>Redneck Yacht Club: canoe and kayak rentals with shuttle service (256-447-8690)</li>
                </ul>
                <h2>Good to know</h2>
                <p>Many take-out points downstream of the public launch are on private property, so the simplest way to plan a float is to go through one of the outfitters above, who handle access and shuttles. Always check current water conditions and wear a life jacket.</p>
              </div>

              <figure className="photo-figure">
                <img src="/images/photos/terrapin-creek.jpg" alt="Terrapin Creek winding through green wooded banks near Piedmont, Alabama" loading="lazy" />
                <figcaption>
                  <span>Terrapin Creek near Piedmont.</span>
                </figcaption>
              </figure>
            </div>

            <aside className="pd-info">
              <div className="pd-card">
                <h2>Public Access</h2>
                <div className="pd-row"><span className="pd-label">Put-in</span><span>Terrapin Creek boat launch &amp; fishing area</span></div>
                <div className="pd-row"><span className="pd-label">Location</span><span>County Road 8, Piedmont, AL 36272</span></div>
                <div className="pd-row"><span className="pd-label">Activities</span><span>Paddling, fishing, swimming</span></div>
                <div className="pd-row"><span className="pd-label">Cost</span><span>Free public launch</span></div>

                <div className="pd-map">
                  <ParkMap lat={LAT} lng={LNG} label="Terrapin Creek boat launch, County Road 8, Piedmont, AL" />
                  <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="pd-directions">
                    Get directions &rarr;
                  </a>
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
