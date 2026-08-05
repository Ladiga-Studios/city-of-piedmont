import './globals.css';
import './chrome.css';
import './extras.css';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import ClientEffects from '@/components/ClientEffects';
import SmoothScroll from '@/components/SmoothScroll';
import AlertBarServer from '@/components/AlertBarServer';
import SiteChrome from '@/components/SiteChrome';
import BackToTop from '@/components/BackToTop';
import { SITE } from '@/lib/site';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-display',
  display: 'swap',
});
const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://www.piedmontcity.org'),
  title: {
    default: 'City of Piedmont, Alabama | Home of the Chief Ladiga Trail',
    template: '%s · City of Piedmont, Alabama',
  },
  description:
    'Official website of the City of Piedmont, Alabama, a small city in the Appalachian foothills of Calhoun County and home of the Chief Ladiga Trail. Pay your utility bill, find city services and departments, explore parks and trails, browse local businesses, and read city news and events.',
  applicationName: 'City of Piedmont, Alabama',
  authors: [{ name: 'City of Piedmont, Alabama' }],
  generator: 'Next.js',
  keywords: [
    'Piedmont Alabama', 'City of Piedmont', 'Piedmont AL', 'Piedmont city government',
    'Chief Ladiga Trail', 'Calhoun County Alabama', 'Piedmont city hall',
    'pay water bill Piedmont', 'Piedmont utilities', 'Piedmont parks and recreation',
    'Terrapin Creek', 'Piedmont Alabama events', 'Piedmont Alabama news',
    'Piedmont Alabama business directory', 'Piedmont mayor and council',
    'Piedmont building permits', 'Piedmont public works', 'Aquatic Center Piedmont',
  ],
  category: 'government',
  referrer: 'origin-when-cross-origin',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'City of Piedmont, Alabama | Home of the Chief Ladiga Trail',
    description:
      'A small city in the Appalachian foothills and home of the Chief Ladiga Trail. Pay bills, find city services, and explore parks, trails, and local business.',
    url: 'https://www.piedmontcity.org/',
    siteName: SITE.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'City of Piedmont, Alabama | Home of the Chief Ladiga Trail',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'City of Piedmont, Alabama',
    description:
      'A small city in the Appalachian foothills and home of the Chief Ladiga Trail.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'GovernmentOrganization',
        '@id': 'https://www.piedmontcity.org/#organization',
        name: 'City of Piedmont, Alabama',
        alternateName: 'City of Piedmont',
        url: 'https://www.piedmontcity.org/',
        logo: 'https://www.piedmontcity.org/images/brand/seal.png',
        image: 'https://www.piedmontcity.org/opengraph-image.png',
        telephone: '+1-256-447-3560',
        email: 'info@piedmontcity.org',
        slogan: 'United for Progress',
        foundingDate: '1888',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '109 North Center Avenue',
          addressLocality: 'Piedmont',
          addressRegion: 'AL',
          postalCode: '36272',
          addressCountry: 'US',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 33.9243,
          longitude: -85.6111,
        },
        areaServed: {
          '@type': 'City',
          name: 'Piedmont, Alabama',
        },
        sameAs: [
          'https://www.facebook.com/CityofPiedmontAlabama',
          'https://en.wikipedia.org/wiki/Piedmont,_Alabama',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.piedmontcity.org/#website',
        url: 'https://www.piedmontcity.org/',
        name: 'City of Piedmont, Alabama',
        description:
          'Official website of the City of Piedmont, Alabama, home of the Chief Ladiga Trail.',
        publisher: { '@id': 'https://www.piedmontcity.org/#organization' },
        inLanguage: 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.piedmontcity.org/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSans.variable}`}>
      <head>
        {/* Weather API (Open-Meteo) - warm up the connection early */}
        <link rel="preconnect" href="https://api.open-meteo.com" crossOrigin="anonymous" />
        {/* Set .js on <html> before paint so reveal animations are a progressive enhancement.
            If this script never runs (JS disabled/blocked), content stays visible by default. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');`,
          }}
        />
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <SmoothScroll />
        <ClientEffects>
          <SiteChrome alertBar={<AlertBarServer />}>
            {children}
          </SiteChrome>
          <BackToTop />
        </ClientEffects>
      </body>
    </html>
  );
}
