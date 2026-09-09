// Static search index for fixed (non-database) site content.
// Each entry: { title, href, type, summary, keywords }
// Departments are pulled from the departments lib at search time; this file
// covers everything else (top-level pages, parks, info sections).
//
// `type` controls how results are grouped/labeled on the results page.

export const STATIC_INDEX = [
  // ---- Top-level pages ----
  { title: 'Home', href: '/', type: 'Page', summary: 'City of Piedmont homepage.',
    keywords: 'home main city of piedmont alabama' },
  { title: 'Government', href: '/government', type: 'Page', summary: 'Mayor, council, ordinances, agendas, and transparency.',
    keywords: 'government mayor council ordinances agendas minutes transparency boards commissions' },
  { title: 'Mayor & Council', href: '/government/council', type: 'Page', summary: 'Piedmont\u2019s mayor and city council members.',
    keywords: 'mayor council members elected officials district' },
  { title: 'Council Minutes & Agendas', href: '/government/minutes', type: 'Page', summary: 'Meeting agendas and minutes from the city council.',
    keywords: 'minutes agendas council meeting records documents' },
  { title: 'City Ordinances', href: '/government/ordinances', type: 'Page', summary: 'Recently adopted city ordinances with plain-language summaries and the signed PDFs.',
    keywords: 'ordinance ordinances city code law laws rules regulations adopted council short term rental thc alcohol brown bagging' },
  { title: 'Public Notices & Bids', href: '/government/notices', type: 'Page', summary: 'Public notices, legal notices, and bid opportunities.',
    keywords: 'notices bids public legal rfp proposals procurement' },
  { title: 'About Piedmont', href: '/about', type: 'Page', summary: 'About the City of Piedmont, Alabama.',
    keywords: 'about city overview information' },
  { title: 'History', href: '/history', type: 'Page', summary: 'The history and heritage of Piedmont, Alabama.',
    keywords: 'history heritage cross plains hollow stump founded heritage story' },
  { title: 'Departments', href: '/departments', type: 'Page', summary: 'City departments and the services they provide.',
    keywords: 'departments services divisions offices' },
  { title: 'Residents', href: '/residents', type: 'Page', summary: 'Resources and services for Piedmont residents.',
    keywords: 'residents utilities garbage recycling trash services living jobs report issue' },
  { title: 'Visitors', href: '/visitors', type: 'Page', summary: 'Things to do, places to stay, and dining for visitors.',
    keywords: 'visitors tourism things to do places to stay dining travel attractions' },
  { title: 'Parks & Recreation', href: '/parks', type: 'Page', summary: 'Parks, trails, and recreation facilities in Piedmont.',
    keywords: 'parks recreation trails outdoors playground sports facilities' },
  { title: 'News', href: '/news', type: 'Page', summary: 'Latest news and announcements from the city.',
    keywords: 'news announcements updates press releases' },
  { title: 'Events', href: '/events', type: 'Page', summary: 'Upcoming events and the community calendar.',
    keywords: 'events calendar community festivals meetings activities' },
  { title: 'Local Business Directory', href: '/business', type: 'Page', summary: 'Locally owned businesses in Piedmont.',
    keywords: 'business directory shop eat local dining retail stores' },
  { title: 'Jobs & Careers', href: '/careers', type: 'Page', summary: 'Employment opportunities with the City of Piedmont.',
    keywords: 'jobs careers employment hiring openings positions work' },
  { title: 'Contact', href: '/contact', type: 'Page', summary: 'Contact City Hall and report an issue.',
    keywords: 'contact city hall phone email address report an issue help' },
  { title: 'Pay My Bill', href: 'https://piedmontcity.payacp.com/home', type: 'Page', ext: true, summary: 'Pay your utility bill online.',
    keywords: 'pay bill utility utilities water gas power electric payment online' },

  // ---- Parks (detail pages) ----
  { title: 'Chief Ladiga Trail', href: '/parks/chief-ladiga-trail', type: 'Park', summary: 'Alabama\u2019s first rails-to-trails paved path through the Appalachian foothills.',
    keywords: 'chief ladiga trail biking cycling walking running rails to trails silver comet pinhoti' },
  { title: 'Pinhoti Trail', href: '/parks/pinhoti-trail', type: 'Park', summary: 'A 335-mile Appalachian foothills hiking trail passing Piedmont, with trailheads and Dugger Mountain Wilderness access nearby.',
    keywords: 'pinhoti trail hiking backpacking thru hike appalachian trail town dugger mountain wilderness burns high point trailhead' },
  { title: 'Terrapin Creek', href: '/parks/terrapin-creek', type: 'Park', summary: 'Paddling, kayaking, and fishing on Terrapin Creek.',
    keywords: 'terrapin creek kayak canoe paddling float fishing water outdoors' },
  { title: 'Piedmont Aquatic Center', href: '/parks/aquatic-center', type: 'Park', summary: 'The city\u2019s pool and aquatic facility.',
    keywords: 'aquatic center pool swimming swim water summer' },
  { title: 'Clyde H. Pike Civic Center', href: '/parks/civic-center', type: 'Park', summary: 'Event and community space.',
    keywords: 'civic center clyde pike events rentals community space venue' },
  { title: 'Fagan\u2019s Park', href: '/parks/fagans-park', type: 'Park', summary: 'A community park in Piedmont.',
    keywords: 'fagans park playground picnic green space recreation' },
];
