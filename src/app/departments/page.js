import '../pages.css';
import './departments.css';
import Link from 'next/link';
import { DEPARTMENTS } from '@/lib/departments';

export const metadata = { title: 'Departments', description: 'City of Piedmont departments: Power & Light, Water & Gas, Public Safety, Public Works, Revenue, Municipal Court, Building Inspection, and the Public Library.' };

export default function Departments() {
  return (<>
    <section className="page-hero"><div className="container inner">
      <div className="hero-text-col">
        <nav className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Departments</span></nav>
        <p className="eyebrow">City Services</p><h1>Departments</h1>
        <p>The people and services that keep Piedmont running. Contact information and service details for each department.</p>
      </div>
    </div></section>
    <section className="section"><div className="container"><div className="dept-grid">
      {DEPARTMENTS.map(d => (
        <Link key={d.slug} href={`/departments/${d.slug}`} className={`dept-card${d.img ? ' has-photo' : ''}`}>
          {d.img && (
            <div className="dept-photo">
              <picture>
                <source srcSet={`${d.img}.webp`} type="image/webp" />
                <img src={`${d.img}.jpg`} alt={d.alt} loading="lazy" width="1100" height="733" />
              </picture>
            </div>
          )}
          <div className="dept-body">
            <h3>{d.name}</h3>
            <p>{d.short}</p>
            <span className="dept-more">View department &rarr;</span>
          </div>
        </Link>
      ))}
    </div></div></section>
  </>);
}
