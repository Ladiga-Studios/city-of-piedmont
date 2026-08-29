// ------------------------------------------------------------------
// CITY BULLETIN BOARD — flyers shown on the homepage.
//
// To post a new flyer:
//   1. Drop the PDF in  public/documents/            (lowercase-hyphen name)
//   2. Save a preview image of page 1 in  public/images/flyers/
//      (a phone screenshot of the PDF works; ~600px wide is plenty)
//   3. Add an entry below with the image's pixel width/height
//      (right-click the image file > Properties > Details on Windows)
//
// To take a flyer down, delete its entry. Order here = order on the page.
// The section hides itself automatically when this list is empty.
// ------------------------------------------------------------------

export const FLYERS = [
  {
    title: 'Downtown Trick or Treat',
    caption: 'Oct 31 · 5:00–7:00 PM · Downtown Piedmont',
    image: '/images/flyers/downtown-halloween-2026.webp',
    width: 640,
    height: 828,
    href: '/documents/downtown-halloween-2026-flyer.pdf',
    linkLabel: 'View flyer',
  },
  {
    title: 'Now Hiring: Recreation Coordinator',
    caption: 'Apply by Fri, Sept 4 · Parks & Recreation',
    image: '/images/flyers/recreation-coordinator-2026.webp',
    width: 546,
    height: 900,
    href: '/careers',
    linkLabel: 'See the posting',
  },
];
