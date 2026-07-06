import '../../pages.css';
import '../business.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { normalizeUrl, displayUrl } from '@/lib/business';
import BizGallery from '@/components/BizGallery';

export const revalidate = 60;

async function getBusiness(slug) {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .eq('approved', true)
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

// Per-business SEO: this is what makes "Joe's Diner Piedmont" findable on Google.
export async function generateMetadata({ params }) {
  const b = await getBusiness(params.slug);
  if (!b) return { title: 'Business Not Found' };
  const desc = b.tagline || b.description || `${b.name} in Piedmont, Alabama.`;
  return {
    title: `${b.name}, Piedmont, AL`,
    description: desc.slice(0, 160),
    openGraph: {
      title: `${b.name}, Piedmont, AL`,
      description: desc.slice(0, 160),
      images: b.image_url ? [b.image_url] : undefined,
      type: 'website',
    },
  };
}

export default async function BusinessPage({ params }) {
  const b = await getBusiness(params.slug);
  if (!b) notFound();

  const website = normalizeUrl(b.website);
  const hours = Array.isArray(b.hours) ? b.hours : [];
  const gallery = Array.isArray(b.gallery) ? b.gallery : [];
  const hasMap = typeof b.lat === 'number' && typeof b.lng === 'number';

  // LocalBusiness structured data so search engines understand the listing.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: b.name,
    description: b.description || b.tagline || undefined,
    image: b.image_url || undefined,
    telephone: b.phone || undefined,
    email: b.email || undefined,
    url: website || undefined,
    address: b.address
      ? { '@type': 'PostalAddress', streetAddress: b.address, addressLocality: 'Piedmont', addressRegion: 'AL', addressCountry: 'US' }
      : undefined,
    geo: hasMap ? { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className={`page-hero biz-page-hero${b.image_url ? ' has-photo' : ''}`}>
        <div className="container inner">
          <div className="biz-hero-text">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/business">Local Business</Link><span aria-hidden="true">/</span>
              <span>{b.name}</span>
            </nav>
            <p className="eyebrow">{b.category}</p>
            <h1>{b.name}</h1>
            {b.tagline && <p>{b.tagline}</p>}
          </div>
          {b.image_url && (
            <div className="biz-hero-photo">
              <div className="biz-hero-photo-bg" style={{ backgroundImage: `url(${b.image_url})` }} aria-hidden="true" />
              <img src={b.image_url} alt={`${b.name}`} />
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container biz-detail">
          <div className="biz-detail-main">
            {b.description && (
              <div className="biz-about">
                <h2>About</h2>
                {b.description.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
              </div>
            )}

            {gallery.length > 0 && (
              <div className="biz-gallery">
                <h2>Photos</h2>
                <BizGallery photos={gallery} name={b.name} />
              </div>
            )}
          </div>

          <aside className="biz-detail-side">
            <div className="biz-info-card">
              <h2>Visit</h2>
              {b.address && (
                <div className="biz-info-row">
                  <span className="bi-label">Address</span>
                  <span>{b.address}</span>
                </div>
              )}
              {b.phone && (
                <div className="biz-info-row">
                  <span className="bi-label">Phone</span>
                  <a href={`tel:${b.phone.replace(/[^0-9+]/g, '')}`}>{b.phone}</a>
                </div>
              )}
              {website && (
                <div className="biz-info-row">
                  <span className="bi-label">Website</span>
                  <a href={website} target="_blank" rel="noopener noreferrer">{displayUrl(website)}</a>
                </div>
              )}
              {b.email && (
                <div className="biz-info-row">
                  <span className="bi-label">Email</span>
                  <a href={`mailto:${b.email}`}>{b.email}</a>
                </div>
              )}
              {(b.facebook || b.instagram) && (
                <div className="biz-info-row">
                  <span className="bi-label">Social</span>
                  <span className="biz-social">
                    {b.facebook && <a href={normalizeUrl(b.facebook)} target="_blank" rel="noopener noreferrer">Facebook</a>}
                    {b.instagram && <a href={normalizeUrl(b.instagram)} target="_blank" rel="noopener noreferrer">Instagram</a>}
                  </span>
                </div>
              )}

              {hours.length > 0 && (
                <>
                  <h3 className="biz-hours-h">Hours</h3>
                  <ul className="biz-hours">
                    {hours.map((h, i) => (
                      <li key={i}>
                        <span>{h.day}</span>
                        <span>{h.open && h.close ? `${h.open} – ${h.close}` : (h.note || 'Closed')}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  Visit Website
                </a>
              )}
            </div>

            {hasMap && (
              <div className="biz-map">
                <iframe
                  title={`Map showing ${b.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${b.lat},${b.lng}&z=16&output=embed`}
                />
                <a href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`} target="_blank" rel="noopener noreferrer" className="biz-directions">
                  Get directions →
                </a>
              </div>
            )}
          </aside>
        </div>

        <div className="container">
          <Link href="/business" className="link">← Back to directory</Link>
        </div>
      </section>
    </>
  );
}
