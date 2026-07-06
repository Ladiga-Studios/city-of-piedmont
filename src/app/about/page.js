import '../pages.css';
import '../about.css';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import PageHeroPhoto from '@/components/PageHeroPhoto';

export const metadata = {
  title: 'About Piedmont',
  description:
    'The history of Piedmont, Alabama, from Hollow Stump Cross Roads and Cross Plains to the city at the foot of the Appalachian Mountains. Founded 1888, named for the Piedmont Plateau, home of the Chief Ladiga Trail.',
};

// The Piedmont Historical Society's Roberts Home / Southern Railroad Depot Museum.
const MUSEUM_URL = 'https://piedmontalabamamuseum.com';

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export default function About() {
  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="container inner has-photo">
          <div className="hero-text-col">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <span>About Piedmont</span>
            </nav>
            <p className="eyebrow">Our Story</p>
            <h1>About Piedmont</h1>
            <p>From a hollow stump at a crossroads of Indian trails to a city at the foot of the mountains, Piedmont has carried five names across nearly two centuries.</p>
          </div>
          <PageHeroPhoto src="/images/photos/downtown-mural.jpg" alt="The 'Welcome to Piedmont' mural on a downtown building, featuring the Chief Ladiga Trail" />
        </div>
      </section>

      {/* INTRO */}
      <section className="section">
        <div className="container">
          <div className="about-intro-grid reveal">
            <div className="about-intro-text">
              <p className="lead">
                Piedmont sits in the Appalachian foothills of northeast Alabama, where the land begins to
                rise toward the mountains.
              </p>
              <p>
                The name is Latin for "foot of the hills," chosen in 1888 because the setting recalled the
                Piedmont Plateau of North Carolina. But long before it was Piedmont, this was a crossroads:
                Cherokee and Creek Indian trails met here and became two post roads, and a hollow sycamore
                stump served as the first "post office" for settlers and Native Americans alike.
              </p>
              <p className="about-intro-note">
                The history below was researched and written by the Piedmont Historical Society.
              </p>
            </div>
            <figure className="about-intro-media">
              <picture>
                <source srcSet="/images/photos/downtown-1.webp" type="image/webp" />
                <img src="/images/photos/downtown-1.jpg" alt="Brick storefronts along a downtown Piedmont street with American flags" loading="lazy" />
              </picture>
              <figcaption>Storefronts in historic downtown Piedmont</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Piedmont Today: current civic facts */}
      <section className="section" style={{ background: 'var(--paper-2)' }}>
        <div className="container">
          <div className="section-head reveal" style={{ marginBottom: 'var(--s4)' }}>
            <div><p className="eyebrow">The City Today</p><h2>Piedmont at a Glance</h2></div>
          </div>
          <div className="facts-grid reveal">
            <div className="fact"><span className="fact-k">County</span><span className="fact-v">Calhoun County, Alabama</span></div>
            <div className="fact"><span className="fact-k">Government</span><span className="fact-v">Mayor–Council</span></div>
            <div className="fact"><span className="fact-k">Mayor</span><span className="fact-v">Kevin Farmer</span></div>
            <div className="fact"><span className="fact-k">City Council</span><span className="fact-v">Seven districts</span></div>
            <div className="fact"><span className="fact-k">Incorporated</span><span className="fact-v">December 12, 1888</span></div>
            <div className="fact"><span className="fact-k">Population</span><span className="fact-v">4,787 <small>(2020 Census)</small></span></div>
            <div className="fact"><span className="fact-k">Elevation</span><span className="fact-v">712 ft</span></div>
            <div className="fact"><span className="fact-k">Region</span><span className="fact-v">Appalachian foothills, NE Alabama</span></div>
            <div className="fact"><span className="fact-k">Founded As</span><span className="fact-v">Cross Plains (renamed 1888)</span></div>
            <div className="fact"><span className="fact-k">ZIP Code</span><span className="fact-v">36272</span></div>
            <div className="fact"><span className="fact-k">City Hall</span><span className="fact-v">312 N. Center Ave, Piedmont, AL 36272</span></div>
            <div className="fact"><span className="fact-k">Phone</span><span className="fact-v">256-447-3560</span></div>
          </div>
        </div>
      </section>

      {/* LOCATION & LIVING HERE */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal" style={{ marginBottom: 'var(--s4)' }}>
            <div><p className="eyebrow">Location &amp; Community</p><h2>Living in Piedmont</h2></div>
          </div>
          <div className="living-grid">
            <div className="living-card reveal">
              <h3>Where We Are</h3>
              <p>Piedmont sits at the foot of the Appalachian Mountains in northeast Alabama, in the northern corner of Calhoun County. The Chief Ladiga Trail and Terrapin Creek run through town, and the surrounding foothills draw cyclists, paddlers, and hikers year-round.</p>
              <p className="living-note">About 25 minutes from Anniston, an hour from Gadsden, and roughly an hour and a half from both Atlanta and Birmingham.</p>
            </div>
            <div className="living-card reveal d1">
              <h3>Schools</h3>
              <p>Piedmont City Schools is one of the top-rated public school systems in Alabama, with an A on the state report card, strong proficiency scores, and a pioneering one-to-one digital learning program.</p>
              <p className="living-note"><a href="#schools">More about the schools below ↓</a></p>
            </div>
            <div className="living-card reveal d2">
              <h3>Healthcare</h3>
              <p>Cherokee Medical Center (Atrium Health Floyd) provides 24/7 emergency, surgical, and specialty care right in Piedmont. Piedmont Health Care Center, a 5-star skilled nursing and rehab facility owned by the city, sits at the foot of Dugger Mountain.</p>
            </div>
            <div className="living-card reveal d3">
              <h3>Parks &amp; Recreation</h3>
              <p>The city maintains several parks plus the 33-mile Chief Ladiga Trail, Alabama&rsquo;s first rails-to-trails project, connecting Piedmont to the Georgia state line and the Silver Comet Trail beyond.</p>
              <p className="living-note"><Link href="/parks">Explore Piedmont&rsquo;s parks &amp; trails →</Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* PIEDMONT CITY SCHOOLS */}
      <section className="section" id="schools" style={{ scrollMarginTop: '90px' }}>
        <div className="container">
          <div className="section-head reveal" style={{ marginBottom: 'var(--s4)' }}>
            <div><p className="eyebrow">Education</p><h2>Piedmont City Schools</h2></div>
          </div>

          <div className="about-intro reveal" style={{ maxWidth: '820px' }}>
            <p className="lead">
              For a small city, Piedmont runs one of Alabama&rsquo;s best public school systems, and it&rsquo;s a
              point of real pride for the community.
            </p>
            <p>
              On the most recent Alabama state report card, Piedmont City Schools earned an A and tied for
              the second-highest overall score in the state, a 97, behind only Mountain Brook and
              level with Vestavia Hills, and one of just eleven districts in Alabama to earn all A&rsquo;s.
              The district ranks among the top of Alabama&rsquo;s 145 school systems, with math and reading
              proficiency well above the state average and a perfect score on the state&rsquo;s academic
              growth measure.
            </p>
            <p>
              Piedmont was an early pioneer of digital, one-to-one learning, which is widely credited with
              helping students keep making academic progress through the pandemic. The system also has one
              of the highest shares of National Board Certified teachers in the state and the nation.
            </p>
          </div>

          {/* schools stat band, reuses the .stats / .stats-grid styles */}
          <div className="stats reveal" style={{ marginTop: 'var(--s5)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--line)' }}>
            <div className="container" style={{ padding: 'var(--s4) 0' }}>
              <div className="stats-grid">
                <div className="stat"><div className="num"><em>A</em></div><div className="lbl">State Report Card</div></div>
                <div className="stat"><div className="num">#13</div><div className="lbl">of 145 AL Districts</div></div>
                <div className="stat"><div className="num">90%</div><div className="lbl">HS Graduation Rate</div></div>
                <div className="stat"><div className="num">100</div><div className="lbl">Academic Growth Score</div></div>
                <div className="stat"><div className="num">~1,100</div><div className="lbl">Students, PreK–12</div></div>
              </div>
            </div>
          </div>

          <div className="notable-grid reveal" style={{ marginTop: 'var(--s5)' }}>
            <div className="notable">
              <div className="role">Elementary</div>
              <h3>Piedmont Elementary</h3>
              <p>A 5-star, top-ranked Alabama elementary school whose principal was named the state&rsquo;s National Distinguished Principal.</p>
            </div>
            <div className="notable">
              <div className="role">Middle</div>
              <h3>Piedmont Middle</h3>
              <p>Continues the district&rsquo;s one-to-one digital learning, carrying strong proficiency through the middle grades.</p>
            </div>
            <div className="notable">
              <div className="role">High</div>
              <h3>Piedmont High</h3>
              <p>A 5-star high school with a ~90% graduation rate, strong college-and-career readiness, and dual-enrollment and career-tech pathways.</p>
            </div>
          </div>

          <p className="reveal" style={{ marginTop: 'var(--s4)' }}>
            <a href="https://www.piedmont.k12.al.us" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sunset)', fontWeight: 600 }}>Visit Piedmont City Schools &rarr;</a>
          </p>
        </div>
      </section>

      {/* HOW THE CITY WORKS */}
      <section className="section" style={{ background: 'var(--paper-2)' }}>
        <div className="container">
          <div className="section-head reveal" style={{ marginBottom: 'var(--s4)' }}>
            <div><p className="eyebrow">How the City Works</p><h2>City Government &amp; Services</h2></div>
          </div>
          <p className="gov-intro reveal">Piedmont operates under a Mayor–Council form of government. The Mayor and a seven-member City Council, elected by district, set policy and direct city services. Council meetings are open to the public.</p>
          <div className="card-grid reveal">
            <Link href="/government/council" className="info-card"><h3>Mayor &amp; City Council</h3><p>Meet your elected officials and find contact information.</p></Link>
            <Link href="/government/minutes" className="info-card"><h3>Meeting Minutes</h3><p>Read and download official records of council proceedings.</p></Link>
            <Link href="/departments" className="info-card"><h3>City Departments</h3><p>Utilities, public safety, courts, library, and more.</p></Link>
          </div>
        </div>
      </section>

      {/* Timeline: the name-change saga */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal" style={{ marginBottom: 'var(--s4)' }}>
            <div><p className="eyebrow">A Town of Many Names</p><h2>How Piedmont Got Its Name</h2></div>
          </div>
          <div className="timeline">
            <div className="tl-item reveal">
              <span className="tl-dot" aria-hidden="true" />
              <div className="tl-year">1840s</div>
              <div className="tl-name">Hollow Stump Cross Roads</div>
              <p>A hollow sycamore stump at the corner of North Center Avenue and East Ladiga Street served as the unofficial post office, where settlers and American Indians left and collected mail at the crossroads of two post roads.</p>
            </div>
            <div className="tl-item reveal">
              <span className="tl-dot" aria-hidden="true" />
              <div className="tl-year">1851</div>
              <div className="tl-name">Cross Plains</div>
              <p>The growing community chose "Cross Plains," for the many trails that crossed here, over the name Griffin's Creek. The Cross Plains Post Office opened September 22, 1851, with Major Jacob Forney Dailey as first postmaster.</p>
            </div>
            <div className="tl-item reveal">
              <span className="tl-dot" aria-hidden="true" />
              <div className="tl-year">1870</div>
              <div className="tl-name">Patona, briefly</div>
              <p>For a few weeks, a railroad settlement just west of town was named "Patona" after William Paton, a director of the Selma, Rome &amp; Dalton Railroad. The name didn't last.</p>
            </div>
            <div className="tl-item reveal">
              <span className="tl-dot" aria-hidden="true" />
              <div className="tl-year">1871</div>
              <div className="tl-name">Cross Plains Incorporated</div>
              <p>Cross Plains was incorporated March 10, 1871, and reincorporated in 1882. By 1879 it had 200 citizens, eight general stores, two churches, two schools, and a railroad.</p>
            </div>
            <div className="tl-item reveal">
              <span className="tl-dot" aria-hidden="true" />
              <div className="tl-year">1888</div>
              <div className="tl-name">Piedmont</div>
              <p>William Iredell Hood proposed "Piedmont" (Latin for "foot of the hills") because the area reminded him of the Piedmont Plateau of North Carolina. The Post Office adopted it July 30, 1888, and the city was incorporated December 12, 1888.</p>
            </div>
          </div>
        </div>
      </section>

      {/* History: Hollow Stump era */}
      <section className="section" id="history" style={{ background: 'var(--paper-2)' }}>
        <div className="container">
          <div className="section-head reveal" style={{ marginBottom: 'var(--s5)' }}>
            <div>
              <p className="eyebrow">In Depth</p>
              <h2>The Piedmont Story</h2>
              <p className="hs-credit">History researched and provided by the Piedmont Historical Society, Inc.</p>
            </div>
          </div>

          {/* Era 1 */}
          <div className="history-block reveal">
            <figure className="hb-media has-cap">
              <div className="img-wrap cutout"><img src="/images/history/hollow-stump.png" alt="Diorama of the hollow sycamore stump that served as Piedmont's first post office, with an old wagon wheel" loading="lazy" /></div>
              <figcaption>"Hollow Stump Cross Roads"</figcaption>
            </figure>
            <div className="hb-text">
              <h3>The Crossroads &amp; the Hollow Stump</h3>
              <p>In the 1840s, Cherokee and Creek Indian trails converged here and gave way to two post roads: the Rome &amp; Wetumpka Road (now Ladiga Street) and the Centre &amp; Choccoloco Road (now Center Avenue). A hollow sycamore stump at their corner served as the area's first "post office."</p>
              <p>In 1844, James William Price and his family arrived from Tennessee among the first white settlers, running an inn and stables at the crossroads. In February 1848, Jacob Forney Dailey settled in a log cabin and opened the first general store. He would go on to become the area's first mayor and help incorporate Piedmont in 1888.</p>
            </div>
          </div>

          {/* Era 2 */}
          <div className="history-block flip reveal">
            <figure className="hb-media has-cap">
              <div className="img-wrap"><img src="/images/history/men-of-cross-plains.jpg" alt="Sepia group portrait of the men of Cross Plains, late 1800s" loading="lazy" /></div>
              <figcaption>Men of Cross Plains</figcaption>
            </figure>
            <div className="hb-text">
              <h3>The Railroad &amp; the Cross Plains Years</h3>
              <p>The first train arrived June 20, 1868, when the Selma, Rome &amp; Dalton Railroad reached Cross Plains and built a Victorian wooden depot. Incorporated in 1871, the town grew fast. By 1879 it had 200 citizens, eight general stores, two churches, two schools, and the railroad. A second line, the East &amp; West Railroad, arrived in 1883.</p>
              <p>That original Selma-Rome-Dalton depot still stands today as the home of the Piedmont Historical Society museum. The railroad that built the town now tells its story.</p>
            </div>
          </div>

          {/* Era 3: Piedmont named */}
          <div className="history-block reveal">
            <figure className="hb-media has-cap">
              <div className="img-wrap portrait"><img src="/images/history/joseph-nathaniel-hood.jpg" alt="Portrait of Joseph Nathaniel Hood, mayor of Cross Plains and Piedmont" loading="lazy" /></div>
              <figcaption>Joseph Nathaniel Hood, Mayor</figcaption>
            </figure>
            <div className="hb-text">
              <h3>Becoming Piedmont, 1888</h3>
              <p>The name "Piedmont" was promoted by editors of <em>The Saturday Post</em> in 1888 and credited to William Iredell Hood, son of Mayor Joseph Nathaniel Hood. The Postal Department made it official on July 30, 1888, and the Alabama General Assembly incorporated the City of Piedmont on December 12, 1888.</p>
              <p>At incorporation, the area was home to roughly 1,000 white settlers and 3,000 Cherokee and Creek people. The newspaper itself became <em>The Piedmont Post</em> that November.</p>
            </div>
          </div>

          {/* Era 4: the boom and the mills */}
          <div className="history-block flip reveal">
            <figure className="hb-media has-cap">
              <div className="img-wrap"><img src="/images/history/coosa-manufacturing.jpg" alt="Aerial illustration of the sprawling Coosa Manufacturing Company textile mill" loading="lazy" /></div>
              <figcaption>Coosa Manufacturing Company</figcaption>
            </figure>
            <div className="hb-text">
              <h3>The 1890s Boom &amp; the Mills</h3>
              <p>The economic boom of the 1890s brought five churches, hotels, dozens of stores, and electric street lamps as early as 1891. The operator blew a whistle at 10:45 pm so residents could light their oil lamps before the power cut at 11:00. The area even drew Northern travelers to grand mountain resorts; the nearby Signal Hotel hosted author Rudyard Kipling and General William T. Sherman.</p>
              <p>The Coosa Manufacturing Company, built in 1892, became Standard Coosa Thatcher in 1922 and was a major employer until 1995, when it closed following NAFTA, a loss of more than 1,100 jobs.</p>
            </div>
          </div>

          {/* Era 5: education */}
          <div className="history-block reveal">
            <figure className="hb-media has-cap">
              <div className="img-wrap">
                <picture>
                  <source srcSet="/images/photos/downtown-2.webp" type="image/webp" />
                  <img src="/images/photos/downtown-2.jpg" alt="A downtown Piedmont brick storefront with a vintage Coca-Cola mural today" loading="lazy" width="1400" height="933" />
                </picture>
              </div>
              <figcaption>Downtown Piedmont today</figcaption>
            </figure>
            <div className="hb-text">
              <h3>Schools, Industry &amp; Today</h3>
              <p>Education grew from early private academies into the Piedmont Public School in 1900, today the nationally recognized Piedmont City School System serving over 1,130 students. Piedmont's economy diversified from cotton and farming into textiles, poultry, manufacturing, and healthcare.</p>
              <p>In the 21st century, Piedmont built up its healthcare community and embraced outdoor recreation. When the railroad pulled out and CSX removed the tracks in 1986, local governments, led by Mayor James William "Billy" Bennett, transformed the corridor into the Chief Ladiga Trail, named for the Muscogee (Creek) leader who signed the 1832 Treaty of Cusseta. Today it runs through Terrapin Creek and the Appalachian foothills as Alabama's first rails-to-trails project.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NOTABLE */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal" style={{ marginBottom: 'var(--s4)' }}>
            <div><p className="eyebrow">From Piedmont</p><h2>Notable Residents</h2></div>
          </div>
          <div className="notable-grid">
            <div className="notable reveal">
              <div className="role">Author &amp; Journalist</div>
              <h3>Rick Bragg</h3>
              <p>Pulitzer Prize–winning author and journalist, born in Piedmont, known for his memoirs of life in the rural South.</p>
            </div>
            <div className="notable reveal d1">
              <div className="role">Basketball</div>
              <h3>Jimmy Dew</h3>
              <p>Piedmont native and Bethune High graduate who starred at Alabama State and was drafted by the Detroit Pistons in 1958. Inducted into the Calhoun County Sports Hall of Fame.</p>
            </div>
            <div className="notable reveal d2">
              <div className="role">Founder &amp; First Mayor</div>
              <h3>Jacob Forney Dailey</h3>
              <p>Early settler who opened the first general store in 1848, served as first mayor, and helped incorporate Piedmont in 1888.</p>
            </div>
            <div className="notable reveal d3">
              <div className="role">Named the City</div>
              <h3>William Iredell Hood</h3>
              <p>Credited with proposing the name "Piedmont" in 1888, inspired by the Piedmont Plateau of North Carolina.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MUSEUM FEATURE */}
      <section className="section">
        <div className="container">
          <div className="museum reveal">
            <div className="mu-media">
              <img src="/images/history/museum-depot.jpg" alt="The Piedmont Historical Society museum in the restored Selma-Rome-Dalton Railroad depot, with a red Southern caboose alongside" loading="lazy" />
            </div>
            <div className="mu-body">
              <p className="eyebrow">Step Into History</p>
              <h2>Visit the Piedmont Museum</h2>
              <p>
                The Piedmont Historical Society preserves the city's story in the restored Southern
                Railroad depot, the original Selma-Rome-Dalton Railroad station from the Cross Plains
                era, alongside a classic red caboose. Explore artifacts, archival photographs, and
                more of Piedmont's history on the museum's website.
              </p>
              <a href={MUSEUM_URL} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                Explore the Museum Site <Arrow />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
