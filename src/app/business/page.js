import '../pages.css';
import './business.css';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import BusinessDirectory from './BusinessDirectory';

export const metadata = {
  title: 'Local Business Directory',
  description:
    'Locally owned businesses in Piedmont, Alabama: dining, retail, outdoors, services, lodging, and more. Support local on your visit through the Chief Ladiga Trail.',
};

export const revalidate = 60;

export default async function Business() {
  let businesses = [];
  try {
    const supabase = createClient();
    let { data, error } = await supabase
      .from('businesses')
      .select('id, name, slug, category, tagline, image_url, image_crop, featured')
      .eq('approved', true)
      .order('name');
    // If image_crop hasn't been added to the DB yet, retry without it so the
    // directory still loads (just without custom crops).
    if (error && /image_crop/.test(error.message || '')) {
      ({ data } = await supabase
        .from('businesses')
        .select('id, name, slug, category, tagline, image_url, featured')
        .eq('approved', true)
        .order('name'));
    }
    businesses = (data || []).filter((b) => b.slug); // need a slug to link
  } catch {
    businesses = [];
  }

  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <span>Local Business</span>
          </nav>
          <p className="eyebrow">Shop &amp; Eat Local</p>
          <h1>Business Directory</h1>
          <p>
            The locally owned businesses that make Piedmont worth the stop. Browse by
            category, then find hours, directions, and how to get in touch.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <BusinessDirectory businesses={businesses} />
        </div>
      </section>
    </>
  );
}
