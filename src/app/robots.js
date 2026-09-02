export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep admin and API endpoints out of search results.
      disallow: ['/admin', '/api/', '/share/'],
    },
    sitemap: 'https://www.piedmontcity.org/sitemap.xml',
    host: 'https://www.piedmontcity.org',
  };
}
