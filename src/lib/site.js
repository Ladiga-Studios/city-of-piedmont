// Central site data. Edit city info here once; used everywhere.
export const SITE = {
  name: 'City of Piedmont',
  tagline: 'Home of the Chief Ladiga Trail',
  est: '1888',
  address: '109 North Center Avenue',
  cityState: 'Piedmont, AL 36272',
  phone: '256-447-3560',
  phoneHref: 'tel:2564473560',
  email: 'info@piedmontcity.org',
  payBillUrl: 'https://piedmontcity.payacp.com/home',
  facebook: 'https://www.facebook.com/CityofPiedmontAlabama/',
};

export const NAV = [
  {
    label: 'Government',
    href: '/government',
    children: [
      { label: 'Mayor & City Council', href: '/government/council' },
      { label: 'Council Meeting Minutes', href: '/government/minutes' },
      { label: 'Public Notices & Bids', href: '/government/notices' },
    ],
  },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    label: 'Departments',
    href: '/departments',
  },
  {
    label: 'Residents',
    href: '/residents',
    children: [
      { label: 'Utilities & Trash', href: '/residents#utilities' },
      { label: 'Permits & Licensing', href: '/residents#permits' },
      { label: 'Public Safety', href: '/residents#safety' },
      { label: 'Schools & Voting', href: '/residents#community' },
      { label: 'Local Business Directory', href: '/business' },
    ],
  },
  {
    label: 'Visitors',
    href: '/visitors',
    children: [
      { label: 'Local Business Directory', href: '/business' },
    ],
  },
  {
    label: 'Parks & Recreation',
    href: '/parks',
    children: [
      { label: 'Chief Ladiga Trail', href: '/parks/chief-ladiga-trail' },
      { label: 'Pinhoti Trail', href: '/parks/pinhoti-trail' },
      { label: 'Terrapin Creek', href: '/parks/terrapin-creek' },
      { label: "Fagan's Park", href: '/parks/fagans-park' },
      { label: 'Clyde H. Pike Civic Center', href: '/parks/civic-center' },
    ],
  },
  {
    label: 'News',
    href: '/news',
    children: [
      { label: 'Events Calendar', href: '/events' },
    ],
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];
