// Per-page SEO metadata.
//
// The root layout sets site-wide defaults (title template, icons, robots,
// JSON-LD). It deliberately does NOT set a canonical: a canonical set there is
// inherited by every page that doesn't override it, which made every inner page
// declare the homepage as its canonical. Each page builds its own metadata with
// pageMeta() so the canonical, og:url and share text always describe that page.

export const SITE_URL = 'https://www.piedmontcity.org';
export const TITLE_SUFFIX = ' · City of Piedmont, Alabama';

const OG_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: 'City of Piedmont, Alabama | Home of the Chief Ladiga Trail',
};

// Keep titles at or under 60 characters including the site suffix. Long titles
// (usually news headlines from the database) drop to a shorter suffix, then to
// no suffix, then get cut at a word boundary.
export function fitTitle(title, max = 60) {
  const t = String(title || '').trim();
  if (t.length + TITLE_SUFFIX.length <= max) return t; // layout template adds the suffix
  const short = `${t} | Piedmont, AL`;
  if (short.length <= max) return { absolute: short };
  if (t.length <= max) return { absolute: t };
  const cut = t.slice(0, max - 1);
  return { absolute: `${cut.slice(0, cut.lastIndexOf(' ') > 30 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,;:–—-]+$/, '')}…` };
}

// Keep meta descriptions within 70–160 characters. Long text is cut at a word
// boundary; short text gets a plain closing sentence.
export function fitDescription(text, fallbackTail = 'From the official website of the City of Piedmont, Alabama.') {
  let d = String(text || '').replace(/\s+/g, ' ').trim();
  if (d.length > 160) {
    const cut = d.slice(0, 157);
    const at = cut.lastIndexOf(' ');
    d = `${cut.slice(0, at > 100 ? at : cut.length).replace(/[\s,;:–—-]+$/, '')}…`;
  }
  if (d.length < 70) d = `${d}${d ? ' ' : ''}${fallbackTail}`.trim();
  return d;
}

export function pageMeta({ title, description, path, ogImages, ...rest }) {
  const fullTitle = typeof title === 'object' && title?.absolute ? title.absolute : `${title}${TITLE_SUFFIX}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: 'City of Piedmont',
      locale: 'en_US',
      type: 'website',
      images: ogImages || [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: ogImages || ['/twitter-image.png'],
    },
    ...rest,
  };
}
