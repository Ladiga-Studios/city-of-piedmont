import '../../pages.css';
import '../news.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { newsDate } from '@/lib/news-events';

export const revalidate = 60;

async function getArticle(slug) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);
  if (!article) return { title: 'Article Not Found' };
  const meta = {
    title: article.title,
    description: article.body || undefined,
    alternates: { canonical: `https://www.piedmontcity.org/news/${article.slug}` },
  };
  if (article.image_url) {
    meta.openGraph = { images: [{ url: article.image_url, alt: article.image_alt || article.title }] };
  }
  return meta;
}

export default async function NewsArticlePage({ params }) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const paragraphs = (article.content || '').split('\n').filter(Boolean);

  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <div className="hero-text-col">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/news">News</Link><span aria-hidden="true">/</span>
              <span>Article</span>
            </nav>
            <p className="eyebrow">{newsDate(article.published_at)}</p>
            <h1>{article.title}</h1>
            {article.body && <p>{article.body}</p>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container article-wrap">
          {article.image_url && (
            <a
              className="article-figure"
              href={article.image_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the image at full size in a new tab"
            >
              <img src={article.image_url} alt={article.image_alt || article.title} />
              <span className="article-figure-hint">Tap to open full size</span>
            </a>
          )}

          {paragraphs.length > 0 && (
            <div className="article-body">
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}

          <Link href="/news" className="article-back">← All city news</Link>
        </div>
      </section>
    </>
  );
}
