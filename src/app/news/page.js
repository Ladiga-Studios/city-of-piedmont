import '../pages.css';
import './news.css';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { newsDate } from '@/lib/news-events';
import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata = {
  title: 'News',
  description: 'City of Piedmont news, announcements, and updates for residents.',
  alternates: { canonical: 'https://www.piedmontcity.org/news' },
};

export const revalidate = 60;

export default async function NewsPage() {
  let items = [];
  let dbError = false;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false });
    if (error) dbError = true;
    else items = data || [];
  } catch {
    dbError = true;
  }

  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <span>News</span>
          </nav>
          <p className="eyebrow">Stay Informed</p>
          <h1>City News</h1>
          <p>Announcements and updates from the City of Piedmont.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {dbError ? (
            <div className="empty-note">
              News is managed in Supabase. Once your database is connected and the{' '}
              <code>news</code> table is created, articles will appear here automatically.
            </div>
          ) : items.length === 0 ? (
            <div className="empty-note">No news has been posted yet. Check back soon.</div>
          ) : (
            <div className="news-list">
              {items.map((n) => (
                <article key={n.id} className="news-item">
                  {n.image_url && (
                    <div className="news-item-img">
                      <img src={n.image_url} alt={n.image_alt || n.title} loading="lazy" />
                    </div>
                  )}
                  <div className="news-item-body">
                    <span className="news-item-date">{newsDate(n.published_at)}</span>
                    <h2>{n.title}</h2>
                    <p>{n.body}</p>
                    {n.content && (
                      <details className="news-more">
                        <summary>Read more</summary>
                        <div className="news-content">
                          {n.content.split('\n').filter(Boolean).map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section news-signup-sec">
        <div className="container">
          <NewsletterSignup
            variant="panel"
            heading="Subscribe to city news"
            blurb="Get Piedmont news, events, and announcements delivered straight to your inbox. No spam, just the latest from City Hall."
          />
        </div>
      </section>
    </>
  );
}
