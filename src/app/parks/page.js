import '../pages.css';
import '../departments/departments.css';
import Link from 'next/link';
export const metadata = { title: 'Parks & Recreation', description: 'Trails, parks, the aquatic center, sports complex, and recreation programs in Piedmont, Alabama.' };
export default function Parks() {
  return (<>
    <section className="page-hero"><div className="container inner">
      <div className="hero-text-col">
        <nav className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Parks &amp; Recreation</span></nav>
        <p className="eyebrow">Get Outside</p><h1>Parks &amp; Recreation</h1>
        <p>From the Chief Ladiga Trail to Terrapin Creek, Piedmont is built for the outdoors.</p>
      </div>
    </div></section>
    <section className="section"><div className="container"><div className="dept-grid">
      <Link href="/parks/chief-ladiga-trail" className="dept-card has-photo">
        <div className="dept-photo">
          <picture>
            <source srcSet="/images/photos/chief-ladiga-trail.webp" type="image/webp" />
            <img src="/images/photos/chief-ladiga-trail.jpg" alt="The Chief Ladiga Trail paved rail-trail near Piedmont" loading="lazy" width="1400" height="933" />
          </picture>
        </div>
        <div className="dept-body"><h3>Chief Ladiga Trail</h3><p>33 miles of paved rail-trail for walking, running, and cycling.</p></div>
      </Link>
      <Link href="/parks/pinhoti-trail" className="dept-card has-photo">
        <div className="dept-photo">
          <picture>
            <source srcSet="/images/photos/pinhoti-trail.webp" type="image/webp" />
            <img src="/images/photos/pinhoti-trail.jpg" alt="A Pinhoti Trail sign in the woods near Piedmont" loading="lazy" width="1920" height="1080" />
          </picture>
        </div>
        <div className="dept-body"><h3>Pinhoti Trail</h3><p>A 335-mile Appalachian hiking trail with four access points around Piedmont.</p></div>
      </Link>
      <Link href="/parks/terrapin-creek" className="dept-card has-photo">
        <div className="dept-photo">
          <picture>
            <source srcSet="/images/photos/terrapin-creek.webp" type="image/webp" />
            <img src="/images/photos/terrapin-creek.jpg" alt="Terrapin Creek winding through wooded banks near Piedmont" loading="lazy" width="1920" height="1080" />
          </picture>
        </div>
        <div className="dept-body"><h3>Terrapin Creek</h3><p>Paddling, fishing, and clear water in the foothills.</p></div>
      </Link>
      <Link href="/parks/fagans-park" className="dept-card has-photo">
        <div className="dept-photo">
          <picture>
            <source srcSet="/images/photos/fagans-park-courts.webp" type="image/webp" />
            <img src="/images/photos/fagans-park-courts.jpg" alt="Pickleball courts at Fagan's Park in Piedmont" loading="lazy" width="1600" height="1200" />
          </picture>
        </div>
        <div className="dept-body"><h3>Fagan&apos;s Park</h3><p>Playground, picnic shelters, basketball, and tennis/pickleball courts.</p></div>
      </Link>
      <Link href="/parks/civic-center" className="dept-card has-photo">
        <div className="dept-photo">
          <picture>
            <source srcSet="/images/photos/civic-center-building.webp" type="image/webp" />
            <img src="/images/photos/civic-center-building.jpg" alt="The Clyde H. Pike Civic Center building in Piedmont" loading="lazy" width="998" height="737" />
          </picture>
        </div>
        <div className="dept-body"><h3>Clyde H. Pike Civic Center</h3><p>Fitness center, gymnasium, walking track, tanning, and rentals.</p></div>
      </Link>
      <Link href="/parks/aquatic-center" className="dept-card has-photo">
        <div className="dept-photo">
          <picture>
            <source srcSet="/images/photos/aquatic-overview.webp" type="image/webp" />
            <img src="/images/photos/aquatic-overview.jpg" alt="The Piedmont Aquatic Center pool and water slide" loading="lazy" width="1400" height="1050" />
          </picture>
        </div>
        <div className="dept-body"><h3>Aquatic Center</h3><p>Seasonal swimming, lap lanes, a water slide, and a kids&apos; splash area.</p></div>
      </Link>
    </div></div></section>
  </>);
}
