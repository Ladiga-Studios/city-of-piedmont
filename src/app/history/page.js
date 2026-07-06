import '../pages.css';
import '../about.css';
import Link from 'next/link';
import PageHeroPhoto from '@/components/PageHeroPhoto';

export const metadata = {
  title: 'History of Piedmont',
  description:
    'The history of Piedmont, Alabama, from Hollow Stump Cross Roads and Cross Plains through the railroad and the 1888 founding, the cotton mills and the 1890s boom, banking, education, and the modern era. Researched by the Piedmont Historical Society.',
};

// Small helper for a captioned gallery image
function Photo({ src, alt, cap }) {
  return (
    <figure>
      <div className="img-wrap"><img src={src} alt={alt} loading="lazy" /></div>
      <figcaption>{cap}</figcaption>
    </figure>
  );
}

export default function History() {
  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="container inner has-photo">
          <div className="hero-text-col">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/about">About</Link><span aria-hidden="true">/</span>
              <span>History</span>
            </nav>
            <p className="eyebrow">Researched by the Piedmont Historical Society</p>
            <h1>The History of Piedmont</h1>
            <p>Nearly two centuries at the crossroads, from a hollow stump and Indian trails to the city at the foot of the mountains.</p>
          </div>
          <PageHeroPhoto src="/images/history/old-depot.jpg" alt="The historic Selma, Rome & Dalton Railroad depot in early Piedmont" />
        </div>
      </section>

      {/* Era 1: Hollow Stump */}
      <section className="section">
        <div className="container">
          <div className="era reveal">
            <div className="era-head">
              <div className="yr">1840s to 1850</div>
              <h3>Hollow Stump Cross Roads</h3>
            </div>
            <div className="history-prose">
              <p>In the 1840s, this was a meeting of Cherokee and Creek Indian trails that became two post roads: the Rome &amp; Wetumpka Road (today's Ladiga Street) and the Centre &amp; Choccoloco Road (today's Center Avenue). At their corner stood a hollow sycamore stump that served as the area's first "post office," where settlers and American Indians left and collected mail.</p>
              <p>James William Price arrived from Tennessee in 1844, among the first white settlers, running an inn and stables at the prized commercial crossroads. In February 1848, Jacob Forney Dailey settled in a log cabin and opened the first general store. He later became the first mayor and helped bring about Piedmont's incorporation.</p>
            </div>
            <div className="gallery">
              <Photo src="/images/history/hollow-stump.png" alt="Diorama of the hollow sycamore stump that served as the first post office" cap="Hollow Stump Cross Roads" />
              <Photo src="/images/history/early-street.jpg" alt="Early dirt road through Piedmont with homes and power poles" cap="An early Piedmont street" />
            </div>
          </div>

          {/* Era 2: Cross Plains */}
          <div className="era reveal">
            <div className="era-head">
              <div className="yr">1851 to 1888</div>
              <h3>Cross Plains &amp; the Railroad</h3>
            </div>
            <div className="history-prose">
              <p>The community chose "Cross Plains" over the name Griffin's Creek in 1851, and the post office opened that September with Jacob Forney Dailey as first postmaster. Incorporated in 1871, Cross Plains grew fast: by 1879 it had 200 citizens, eight general stores, two churches, two schools, and the Selma, Rome &amp; Dalton Railroad. For a brief moment in 1870 a railroad settlement just west of town carried the name "Patona."</p>
            </div>
            <div className="gallery">
              <Photo src="/images/history/men-of-cross-plains.jpg" alt="Group portrait of the men of Cross Plains" cap="Men of Cross Plains" />
              <Photo src="/images/history/old-depot.jpg" alt="Workers gathered in front of the original wooden Piedmont railroad depot" cap="The original depot" />
              <Photo src="/images/history/cross-plains-map.jpg" alt="Historic 1851 map showing Cross Plains" cap="Cross Plains on an 1851 map" />
              <Photo src="/images/history/patona-map.jpg" alt="Historic map showing Patona and the railroads" cap="Patona &amp; the railroads" />
            </div>
          </div>

          {/* Era 3: Becoming Piedmont */}
          <div className="era reveal">
            <div className="era-head">
              <div className="yr">1888</div>
              <h3>Becoming Piedmont</h3>
            </div>
            <div className="history-prose">
              <p>In 1888, citizens moved to rename the town. The name "Piedmont" (Latin for "foot of the hills") was promoted by the editors of <em>The Saturday Post</em> and credited to William Iredell Hood, who thought the foothills recalled the Piedmont Plateau of North Carolina. It became official on July 30, 1888, and the Alabama General Assembly incorporated the City of Piedmont on December 12, 1888. At the time, the area was home to roughly 1,000 settlers and 3,000 Cherokee and Creek people.</p>
            </div>
            <div className="gallery">
              <Photo src="/images/history/joseph-nathaniel-hood.jpg" alt="Portrait of Joseph Nathaniel Hood, mayor of Cross Plains and Piedmont" cap="Mayor Joseph Nathaniel Hood" />
            </div>
          </div>

          {/* Era 4: Boom and mills */}
          <div className="era reveal">
            <div className="era-head">
              <div className="yr">1890s to 1900s</div>
              <h3>The Boom, the Mills &amp; the Banks</h3>
            </div>
            <div className="history-prose">
              <p>The 1890s boom brought churches, hotels, two mountain resorts, and electric street lamps as early as 1891. The plant operator blew a whistle at 10:45 pm so residents could light oil lamps before the power cut at 11:00. The boom crashed in the Panic of 1893, but industry returned. The Coosa Manufacturing Company (1892) became Standard Coosa Thatcher, a major employer until 1995. Banking grew too, from the Bank of Piedmont (1890) to the Farmers &amp; Merchants Bank, founded 1915 at 109 North Center Avenue and still family-led today.</p>
            </div>
            <div className="gallery">
              <Photo src="/images/history/coosa-manufacturing.jpg" alt="Aerial illustration of the Coosa Manufacturing Company textile mill" cap="Coosa Manufacturing Company" />
              <Photo src="/images/history/cotton-gin.jpg" alt="Horse-drawn wagons at the Piedmont cotton gin in the 1920s" cap="The cotton gin, 1920s" />
              <Photo src="/images/history/farmers-merchants.jpg" alt="The Farmers and Merchants Bank storefront, 1915" cap="Farmers &amp; Merchants Bank, 1915" />
            </div>
          </div>

          {/* Era 5: 20th century */}
          <div className="era reveal">
            <div className="era-head">
              <div className="yr">1900s to today</div>
              <h3>Schools, Mid-Century &amp; the Modern Era</h3>
            </div>
            <div className="history-prose">
              <p>Education grew from early academies into the Piedmont Public School (1900) and today's nationally recognized Piedmont City School System. Through the 20th century, downtown thrived with storefronts, the old City Hall, and a mix of industry: textiles, poultry, manufacturing, and healthcare. After the textile losses of the 1990s, Piedmont turned toward healthcare and embraced the Chief Ladiga Trail, Terrapin Creek, and the Appalachian foothills for recreation and tourism.</p>
            </div>
            <div className="gallery">
              <Photo src="/images/history/willard-school.jpg" alt="The historic multi-story Frances E. Willard School" cap="Frances E. Willard School" />
              <Photo src="/images/history/old-city-hall.jpg" alt="Piedmont City Hall and a Phillips 66 station, mid-century" cap="Old City Hall, mid-century" />
              <Photo src="/images/history/downtown-1960s.jpg" alt="Downtown Piedmont storefronts in the 1960s, including George Kass" cap="Downtown, 1960s" />
            </div>
          </div>
        </div>
      </section>

      {/* MUSEUM CTA */}
      <section className="section" style={{ background: 'var(--paper-2)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <p className="eyebrow">Explore More</p>
          <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', margin: '.5rem 0 1rem' }}>The Story Continues at the Museum</h2>
          <p style={{ color: 'var(--ink-2)', marginBottom: '1.5rem' }}>
            The Piedmont Historical Society preserves this history in the restored Southern Railroad
            depot downtown. Visit in person or explore the museum's website.
          </p>
          <a href="https://piedmontalabamamuseum.com" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            Visit the Museum Site
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>
      </section>
    </>
  );
}
