/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // Meeting search index (public/meeting-search, rebuilt by .github/workflows/meeting-search.yml).
  // The catalog, manifest and build.json change with each rebuild; the shards are named by
  // their content and never change. Shards go out as raw gzip with no Content-Encoding, so
  // the reader can check each one against the sha256 its manifest published.
  async headers() {
    return [
      {
        source: '/meeting-search/cdn/:path((?:catalog|domains/[^/]+/manifest))',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=300, must-revalidate' },
        ],
      },
      {
        source: '/meeting-search/build.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=300, must-revalidate' }],
      },
      {
        source: '/meeting-search/cdn/domains/:domain/shards/:file',
        headers: [
          { key: 'Content-Type', value: 'application/gzip' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/meeting-search/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ];
  },
};
module.exports = nextConfig;
