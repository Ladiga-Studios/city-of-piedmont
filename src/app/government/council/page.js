import '../../pages.css';
import '../../council.css';
import Link from 'next/link';

export const metadata = {
  title: 'Mayor & City Council',
  description:
    'Meet the Mayor and City Council of Piedmont, Alabama. Council meets the first and third Tuesday of each month at 6:00 PM in the Council Chambers at City Hall.',
};

const MAYOR = { name: 'Kevin Farmer', role: 'Mayor', img: '/images/council/kevin-farmer.jpg' };

const COUNCIL = [
  { name: 'Brittney Williams', role: 'District 1', img: '/images/council/brittney-williams.jpg' },
  { name: 'Kevin McCord', role: 'District 2', img: '/images/council/kevin-mccord.jpg' },
  { name: 'Frank Cobb', role: 'District 3', img: '/images/council/frank-cobb.jpg' },
  { name: 'Mark Epps', role: 'District 4', img: '/images/council/mark-epps.jpg' },
  { name: 'Greg South', role: 'District 5', img: '/images/council/greg-south.jpg' },
  { name: 'Carlos Farmer', role: 'District 6', img: '/images/council/carlos-farmer.jpg' },
  { name: 'Matt Rogers', role: 'District 7', img: '/images/council/matt-rogers.jpg' },
];

function PersonCard({ name, role, img, featured }) {
  return (
    <figure className={`person ${featured ? 'featured' : ''} reveal`}>
      <div className="person-photo">
        <img src={img} alt={`${name}, ${role}`} loading="lazy" />
      </div>
      <figcaption>
        <span className="person-name">{name}</span>
        <span className="person-role">{role}</span>
      </figcaption>
    </figure>
  );
}

export default function Council() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/government">Government</Link><span aria-hidden="true">/</span>
            <span>Mayor &amp; Council</span>
          </nav>
          <p className="eyebrow">City Government</p>
          <h1>Mayor &amp; City Council</h1>
          <p>The City Council meets the first and third Tuesday of each month at 6:00 PM in the Council Chambers at City Hall. Meetings are open to the public.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mayor-row">
            <PersonCard {...MAYOR} featured />
          </div>

          <div className="council-grid">
            {COUNCIL.map((m) => (
              <PersonCard key={m.role} {...m} />
            ))}
          </div>

          <div className="council-note">
            <p>
              To contact the Mayor or a Council member, call City Hall at{' '}
              <a href="tel:2564473560">256-447-3560</a> or email{' '}
              <a href="mailto:info@piedmontcity.org">info@piedmontcity.org</a>. Meeting agendas and
              minutes are available on the <Link href="/government/minutes">Council Minutes</Link> page.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
