// Single source of truth for the Departments section.
// Each department renders its index card and its detail page from this data.
//
// Content below is taken directly from the City of Piedmont's live department
// pages (piedmontcity.org/departments/*). Optional rich fields:
//   about           string[]  intro paragraphs
//   missionHeading  string    heading for the mission block
//   missionIntro    string    lead-in sentence before the mission bullets
//   mission         string[]  mission bullets
//   body            string[]  free paragraphs (memberships, notes)
//   dutiesHeading   string    heading for the duties block
//   duties          string[]  duties / "what we do" bullets
//   staff           []        { name, role, email?, phone? }
//   offices         []        sub-offices / divisions:
//                             { name, note?, staff[], lines[], phones[ {label?, number} ], hours?, links[] }
//   downloads       []        { label, href }
//   downloadGroups  []        { heading, items[ {label, href} ] }
//   links           []        { label, href }
//   notice          {}        callout: { heading, lines[] }
//   closing         string    closing "for more information" line
// Existing fields (services, hours, contact, lat/lng, img/alt) are unchanged
// so the index cards and map keep working. contact may also include:
//   contactName, contactEmail, customerEmail, altPhone, altPhoneLabel

export const CITY_PHONE = '256‑447‑3560';
export const CITY_HALL = { lat: 33.9248, lng: -85.6112, address: '109 N Center Ave, Piedmont, AL 36272' };

export const DEPARTMENTS = [
  // ---------------------------------------------------------------- ADMIN
  {
    slug: 'administrative',
    name: 'Administrative',
    short: 'City administration, leadership, and general services.',
    intro:
      'The City of Piedmont provides information, services and contact opportunities to citizens in accordance with the City\u2019s mission throughout our website.',
    about: [
      'The City of Piedmont provides information, services and contact opportunities to citizens in accordance with the City\u2019s mission throughout our website.',
    ],
    missionHeading: 'Mission Statement',
    missionIntro:
      'The mission of the City of Piedmont is to provide economical delivery of quality services created and designed in response to the needs of its citizens rather than by habit or tradition. We aim to achieve this by:',
    mission: [
      'Developing attractive built-environments and conserve our natural resources through planned and managed growth strategies.',
      'Increasing our tax base by creating more diverse employment opportunities within our town and the surrounding area.',
      'Creating and maintaining a reliable infrastructure.',
      'Providing quality housing, cultural, educational, and recreational options for our visitors and citizenry.',
      'Continuing to provide dedicated public safety services.',
      'Remaining fiscally sound in our governance of the city and providing adequate funds for its needs.',
      'Maintaining a motivated, intelligent workforce through recruiting.',
      'Encouraging and facilitating citizen involvement.',
    ],
    staff: [
      { name: 'Leanne Pike', role: 'Accounts Payable', email: 'leanne.pike@piedmontcity.org' },
      { name: 'Tessa Maddox', role: 'Accounting/Payroll', email: 'tessa.maddox@piedmontcity.org' },
      { name: 'Amy Rawson', role: 'Business License/Revenue', email: 'amy.rawson@piedmontcity.org' },
      { name: 'Tashia Blackerby', role: 'City Clerk', email: 'tashia.blackerby@piedmontcity.org' },
      { name: 'Ben Singleton', role: 'IT Manager/Building and Zoning', email: 'ben.singleton@piedmontcity.org' },
    ],
    closing:
      'For more information concerning the Administrative Offices of the City of Piedmont, please give us a call at (256) 447-3560.',
    services: [
      'Mayor and City Council support',
      'Public records and general inquiries',
      'Accounts payable, accounting, and payroll',
      'Business license and revenue',
      'City Clerk and IT services',
    ],
    hours: [
      { d: 'Monday - Friday', h: '8:00 a.m. - 5:00 p.m.' },
    ],
    contact: {
      contactName: 'Tashia Blackerby - City Clerk',
      contactEmail: 'tashia.blackerby@piedmontcity.org',
      address: '109 North Center Ave., P.O. Box 112, Piedmont, AL 36272',
      phone: '(256) 447-3560',
      altPhone: '(256) 447-2958',
      altPhoneLabel: 'Fax',
    },
    offices: [
      {
        name: 'Calhoun County Annex',
        note: '(Next door to the Piedmont Administration Building) License Renewal, Tags, Property Tax, etc.',
        phones: [{ number: '(256) 447-3566' }],
        hours: 'Monday \u2013 Friday \u2013 8:00 a.m. \u2013 4:30 p.m. (Closed 11:30 a.m. \u2013 12:45 p.m. for Lunch)',
        links: [{ label: 'Calhoun County Website', href: 'http://www.calhouncounty.org/' }],
      },
    ],
    img: '/images/departments/admin-building',
    alt: 'The City of Piedmont Administrative Offices at the Calhoun County Courthouse Annex',
    lat: 33.9248, lng: -85.6112,
  },

  // ---------------------------------------------------------------- POWER & LIGHT
  {
    slug: 'power-light',
    name: 'Power & Light',
    short: 'Piedmont\u2019s municipal electric utility, one of the oldest continuing businesses in the city.',
    intro:
      'Piedmont Power is one of the oldest continuing businesses in Piedmont.',
    about: [
      'Piedmont Power is one of the oldest continuing businesses in Piedmont.',
      'The Electrical Department delivered the first electrical power available to residents and businesses in Piedmont on November 27, 1890.',
      'It remains one of the most modern power distribution systems in the world today due to the continuing upgrades in technology and dedicated public servants.',
    ],
    missionHeading: 'Our Mission',
    mission: [
      'Provide our customers with an adequate, reliable, and economical supply of electric power and related public service.',
      'Protect the interest of our customers in areas pertaining to public power and coordination with other municipal departments.',
      'Provide the best public service possible for the customers we serve.',
    ],
    body: [
      'Piedmont Power & Light is a member of Energy Southeast, a corporation of the State of Alabama. Energy Southeast has eleven municipal electric members. These members include: Alexander City, Dothan, Fairhope, Foley, LaFayette, Lanett, Luverne, Opelika, Piedmont, Sylacauga, and Tuskegee.',
      'Piedmont Power & Light is a member of Electric Cities of Alabama.',
    ],
    dutiesHeading: 'What We Do',
    duties: [
      'Maintain the physical distribution of electrical power through means of general maintenance and upgrading the system to meet customer needs and requirements.',
      'Maintain proper Right-of-Way clearances, in the form of tree trimming, to prevent hazards, and reduce power outages to the customer.',
      'General maintenance of local weather warning sirens.',
      'Maintain and install street lighting, as well as customers privately paid security lighting.',
      'Return electrical service to the customer in the event adverse conditions cause loss of power.',
    ],
    staff: [
      { name: 'Corey Horton', role: 'Electrical Manager' },
    ],
    notice: {
      heading: 'Power Outages',
      lines: [
        'To report a power outage during regular business hours call the Administration office at (256) 447-3560.',
        'To report a power outage after regular business hours, weekends, or holidays call the Piedmont Water Filtration Plant at (256) 447-6656 or Piedmont Police Dept. at (256) 447-9091.',
      ],
    },
    links: [
      { label: 'Energy Southeast', href: 'http://www.energysoutheast.com/' },
      { label: 'Electric Cities of Alabama', href: 'http://www.electriccities.org/' },
    ],
    services: [
      'Residential and commercial electric service',
      'New service connections and disconnections',
      'Street lighting and security lighting',
      'Right-of-way tree trimming',
      'Power outage response and restoration',
    ],
    hours: [
      { d: 'Monday - Friday', h: '8:00 a.m. - 5:00 p.m.' },
      { d: 'Outages', h: '24/7 (see numbers above)' },
    ],
    contact: {
      contactName: 'Corey Horton - Electrical Manager',
      address: '109 North Center Ave., Piedmont, AL 36272',
      phone: '(256) 447-3560',
    },
    lat: 33.9248, lng: -85.6112,
    img: '/images/departments/power-light',
    alt: 'The Piedmont electric department substation',
  },

  // ---------------------------------------------------------------- WATER & GAS
  {
    slug: 'water-gas',
    name: 'Water & Gas',
    short: 'Water, natural gas, and sewer service, billing, and connections.',
    intro:
      'The City of Piedmont Water Works, Gas and Sewer Department provides water, natural gas, and sewer service throughout Piedmont, handling new connections, billing, and service requests.',
    about: [
      'The City of Piedmont Water Works, Gas and Sewer Department provides water, natural gas, and sewer service throughout Piedmont, handling new connections, billing, and service requests.',
    ],
    staff: [
      { name: 'Byrian Watts', role: 'Water, Gas, & Sewer Manager', email: 'abwatts@piedmontcity.org' },
      { name: 'Tammy Maddox', role: 'Utility Clerk', email: 'tammy.maddox@piedmontcity.org' },
      { name: 'Mackenzie Hightower', role: 'Utility Clerk', email: 'mackenzie.hightower@piedmontcity.org' },
      { name: 'Patti Byers', role: 'Utility Clerk', email: 'patti.byers@piedmontcity.org' },
    ],
    offices: [
      {
        name: 'Piedmont Water Filtration Plant',
        staff: [{ name: 'Jon Edwards', role: 'Chief Plant Operator', email: 'jon.edwards@piedmontcity.org' }],
        lines: ['1739 US Hwy 278 E', 'Piedmont, AL 36272'],
        phones: [{ label: 'Phone', number: '(256) 447-6656' }],
      },
    ],
    downloads: [
      { label: 'Application for Residential Utility Services', href: 'https://www.piedmontcity.org/wp-content/uploads/2021/05/application_for_util.pdf' },
      { label: 'City of Piedmont Utilities Standard Service Policy', href: 'https://www.piedmontcity.org/wp-content/uploads/2021/05/city_of_piedmont_uti.pdf' },
      { label: 'Excess Flow Valves (EFV) for Natural Gas Customers', href: 'https://www.piedmontcity.org/wp-content/uploads/2021/05/excess_flow_valves_city_of_piedmont.pdf' },
    ],
    downloadGroups: [
      {
        heading: 'Water Quality Reports',
        items: [
          { label: 'Water Quality Report 2024', href: 'https://www.piedmontcity.org/wp-content/uploads/2025/06/PIEDMONT-2024-ANNUAL-DRINKING-WATER-QUALITY-REPORT.pdf' },
          { label: 'Water Quality Report 2023', href: 'https://www.piedmontcity.org/wp-content/uploads/2024/06/2023-WATER-QUALITY-REPORT.pdf' },
          { label: 'Water Quality Report 2022', href: 'https://www.piedmontcity.org/wp-content/uploads/2023/06/2022-ANNUAL-DRINKING-WATER-QUALITY-REPORT.pdf' },
          { label: 'Water Quality Report 2021', href: 'https://www.piedmontcity.org/wp-content/uploads/2023/04/2021-ANNUAL-DRINKING-WATER-QUALITY-REPORT.pdf' },
          { label: 'Water Quality Report 2020', href: 'https://www.piedmontcity.org/wp-content/uploads/2021/08/2020-WATER-QUALITY-REPORT.pdf' },
          { label: 'Water Quality Report 2019', href: 'https://www.piedmontcity.org/wp-content/uploads/2021/05/water_quality_control_2019.pdf' },
          { label: 'Water Quality Report 2018', href: 'https://www.piedmontcity.org/wp-content/uploads/2021/05/water_quality_control_2018.pdf' },
          { label: 'Water Quality Report 2017', href: 'https://www.piedmontcity.org/wp-content/uploads/2021/05/water_quality_control_2017.pdf' },
          { label: 'PFOS/PFAS Results', href: 'https://www.piedmontcity.org/wp-content/uploads/2025/06/PIEDMONT-PFAS-PFOS-RESULTS.pdf' },
        ],
      },
    ],
    links: [
      { label: 'Water Service Line Report', href: 'https://www.piedmontcity.org/service-line/' },
    ],
    closing:
      'For more information on how Piedmont\u2019s Water & Gas Department can provide you with the utilities you need, please call us at 256‑447‑3560.',
    services: [
      'Water, natural gas, and sewer service',
      'Start, stop, or transfer service',
      'Utility billing and payments',
      'Water quality reporting',
      'Water service line inventory',
    ],
    hours: [
      { d: 'Monday - Friday', h: '8:00 a.m. - 5:00 p.m.' },
    ],
    contact: {
      address: 'Piedmont Water Works, Gas and Sewer, 128 South Center Ave.',
      phone: '(256) 447-3560',
    },
    lat: 33.9243, lng: -85.6112,
    img: '/images/departments/water-gas',
    alt: 'The City of Piedmont Water, Gas & Sewer utility office',
  },

  // ---------------------------------------------------------------- PUBLIC SAFETY
  {
    slug: 'public-safety',
    name: 'Public Safety',
    short: 'Piedmont Police and Fire, dedicated to the safety of our citizens.',
    intro:
      'The Police and Fire Department in Piedmont are dedicated to the safety of our citizens. In times of emergency, the brave men and women of the Piedmont Police and Fire respond with skill, dedication, and confidence in their abilities to ensure the very best resolutions.',
    about: [
      'The Police and Fire Department in Piedmont are dedicated to the safety of our citizens. In times of emergency, the brave men and women of the Piedmont Police and Fire respond with skill, dedication, and confidence in their abilities to ensure the very best resolutions.',
    ],
    offices: [
      {
        name: 'Police Department',
        img: '/images/departments/police-department',
        alt: 'The Piedmont Police Department entrance with blue awnings',
        staff: [{ name: 'Nathan Johnson', role: 'Chief of Police' }],
        phones: [
          { label: 'Phone', number: '(256) 447-9091' },
          { label: 'Fax', number: '(256) 447-6119' },
        ],
        lines: ['121 West Ladiga Street', 'Piedmont, AL 36272'],
      },
      {
        name: 'Fire Department',
        img: '/images/departments/fire-department',
        alt: 'The Piedmont Fire Department station with engines in the bays',
        staff: [{ name: 'Todd Kirkland', role: 'Fire Chief' }],
        lines: ['312 North Center Avenue', 'Piedmont, AL 36272'],
        phones: [
          { label: 'Business Calls', number: '(256) 447-3364' },
          { label: 'Fire Calls', number: '(256) 447-9011' },
        ],
      },
    ],
    closing:
      'For more information concerning Piedmont\u2019s emergency services, please call us at 256‑447‑9091 and speak to a member of our staff.',
    services: [
      'Police patrol and emergency response',
      'Fire protection and rescue',
      'Criminal investigations and traffic enforcement',
      'Community safety programs',
    ],
    hours: [
      { d: 'Emergencies', h: 'Dial 911' },
      { d: 'Police (non-emergency)', h: '(256) 447-9091' },
    ],
    contact: {
      address: '121 West Ladiga Street, Piedmont, AL 36272',
      phone: '(256) 447-9091',
    },
    img: '/images/departments/public-safety',
    alt: 'The Piedmont Fire Department station with engines in the bays',
    cardImgOnly: true, // photo shows on the index card, not the detail-page intro (offices have their own photos)
    lat: 33.9236, lng: -85.6118,
  },

  // ---------------------------------------------------------------- REVENUE
  {
    slug: 'revenue',
    name: 'Revenue',
    short: 'Business licenses, sales tax, and city revenue collection.',
    intro:
      'The Piedmont Revenue Department offers the resources you need to stay prosperous under the law within the city.',
    about: [
      'The Piedmont Revenue Department offers the resources you need to stay prosperous under the law within the city.',
      'Sales tax forms, business license applications, information on police jurisdictions \u2013 we can provide everything you need, and more, to ensure all of your obligations are met.',
    ],
    downloadGroups: [
      {
        heading: 'Download Forms',
        items: [
          { label: 'Sales Tax Form (PDF)', href: '/documents/sales-tax-form.pdf' },
          { label: 'Business License Application (PDF)', href: '/documents/business-license-application.pdf' },
        ],
      },
    ],
    staff: [
      { name: 'Amy Rawson', role: 'Revenue Officer', email: 'amy.rawson@piedmontcity.org' },
    ],
    closing:
      'For more information concerning topics from the Revenue Department, please call the City of Piedmont at 256‑447‑3564.',
    services: [
      'Business license applications and renewals',
      'Sales tax forms and filing',
      'Police jurisdiction information',
      'Revenue records and inquiries',
    ],
    hours: [
      { d: 'Monday - Friday', h: '8:00 a.m. - 5:00 p.m.' },
    ],
    contact: {
      contactName: 'Amy Rawson - Revenue Officer',
      contactEmail: 'amy.rawson@piedmontcity.org',
      address: '109 N Center Ave., Piedmont, AL 36272',
      phone: '(256) 447-3564',
    },
    img: '/images/departments/admin-building',
    alt: 'The City of Piedmont Administrative Offices, home of the Revenue Department',
    lat: 33.9248, lng: -85.6112,
  },

  // ---------------------------------------------------------------- MUNICIPAL COURT
  {
    slug: 'municipal-court',
    name: 'Municipal Court',
    short: 'Traffic and misdemeanor cases, fines, and court dates for the City of Piedmont.',
    intro:
      'The Municipal Court of Piedmont handles matters of justice and its administration. Traffic and misdemeanor violations, matters for the town clerk, matters for the magistrate \u2013 if you need officials in Piedmont to hear your case, you will be appearing here in Municipal Court to see it carried out.',
    about: [
      'The Municipal Court of Piedmont handles matters of justice and its administration. Traffic and misdemeanor violations, matters for the town clerk, matters for the magistrate \u2013 if you need officials in Piedmont to hear your case, you will be appearing here in Municipal Court to see it carried out.',
    ],
    staff: [
      { name: 'Janet Henson', role: 'Court Clerk', email: 'janet.henson@piedmontcity.org' },
      { name: 'Susan Glover', role: 'Court Magistrate', email: 'susan.glover@piedmontcity.org' },
    ],
    notice: {
      heading: 'Traffic and Misdemeanor Court',
      lines: [
        '1st and 3rd Tuesday of each Month.',
        'Court begins at 9:00 a.m.',
      ],
    },
    closing:
      'For more information concerning matters of the court, please contact the City of Piedmont at 256‑447‑3370.',
    services: [
      'Traffic citation and ticket processing',
      'Misdemeanor violation cases',
      'Magistrate and town clerk matters',
      'Fine payments and court scheduling',
    ],
    hours: [
      { d: 'Mon, Tue, Thu, Fri', h: '7:00 a.m. - 12:00 p.m. | 1:00 p.m. - 5:00 p.m.' },
      { d: 'Wednesday', h: 'Closed' },
    ],
    contact: {
      address: '312 North Center Ave, Piedmont, AL 36272',
      phone: '(256) 447-3370',
      altPhone: '(256) 447-3376',
      altPhoneLabel: 'Fax',
    },
    lat: 33.9255, lng: -85.6110,
    img: '/images/departments/municipal-court',
    alt: 'The Piedmont Municipal Court building',
  },

  // ---------------------------------------------------------------- PUBLIC WORKS
  {
    slug: 'public-works',
    name: 'Public Works',
    short: 'Streets, sanitation, drainage, and city infrastructure.',
    intro:
      'The Public Works Department maintains Piedmont\u2019s streets, sanitation, drainage, right-of-ways, city vehicles, and public facilities.',
    about: [
      'The Public Works Department maintains Piedmont\u2019s streets, sanitation, drainage, right-of-ways, city vehicles, and public facilities.',
    ],
    dutiesHeading: 'Department Duties',
    duties: [
      'Streets/Roads/Alleys \u2013 Maintenance, Repair, Construction.',
      'Curbs And Gutters \u2013 Maintenance, Repair, Removal, New Installation.',
      'Drainage \u2013 Ditch, Maintenance, Pipe Installation.',
      'Regulatory Signs \u2013 Maintenance, Installations.',
      'Sidewalks \u2013 Maintenance, New installations.',
      'Street Marking/Painting \u2013 Regulatory Markings at Intersections and Curbs.',
      'Right-Of-Ways \u2013 Maintenance, Mowing, Repairs, Etc.',
      'City Vehicle Maintenance \u2013 Service, Repairs, Fueling (all departments).',
      'Grass/Brush Cutting \u2013 R.O.W.\u2019s, Ditches, Medians, City properties, Limb Removal.',
      'Leaf Collection/Removal.',
      'Brush/Trash Pickup.',
      'Special Project Assistance.',
      'Assist Electrical Department \u2013 Tree Maintenance, Removals.',
      'Assist Parks & Recreation Dept. \u2013 Parks, Complex Maintenance/Repairs.',
      'Assist Maintenance Dept. \u2013 Large projects.',
      'Assist City Schools \u2013 Maintenance, Mowing, Special Projects.',
      'Industrial Development \u2013 Construction, Renovation, Miscellaneous.',
      'Parking Lot Maintenance.',
      'Highland Cemetery Maintenance \u2013 Roads, Trash, Brush, Trees, Etc.',
      'Cross Plains Cemetery Maintenance.',
    ],
    staff: [
      { name: 'Tim Frost', role: 'Public Works/Sanitation Supervisor', phone: '(256) 447-3572' },
      { name: 'Henry Reynolds', role: 'Maintenance Supervisor', phone: '(256) 447-3583' },
    ],
    closing:
      'For more information concerning our Public Works and Street Maintenance Department, please call the City of Piedmont at 256‑447‑3560.',
    services: [
      'Street, curb, and sidewalk maintenance',
      'Garbage, brush, and leaf collection',
      'Drainage and stormwater upkeep',
      'City vehicle and facility maintenance',
      'Cemetery maintenance',
    ],
    hours: [
      { d: 'Monday - Friday (daylight saving time)', h: '6:00 a.m. - 2:30 p.m.' },
      { d: 'Monday - Friday (standard time)', h: '7:00 a.m. - 3:30 p.m.' },
    ],
    contact: {
      address: 'Piedmont, AL 36272',
      phone: '(256) 447-3560',
    },
    img: '/images/departments/public-works',
    alt: 'The Piedmont Public Works facility with the brick castle marker out front',
    noMap: true, // no fixed public address - direct visitors to call instead
    lat: 33.9248, lng: -85.6112,
  },

  // ---------------------------------------------------------------- BUILDING INSPECTION
  {
    slug: 'building-inspection',
    name: 'Building Inspection',
    short: 'Permits, inspections, code enforcement, and zoning for the City of Piedmont.',
    intro:
      'Building Inspection & Code Enforcement issues building permits and carries out inspections for new construction, renovations, and additions in Piedmont.',
    about: [
      'Building Inspection & Code Enforcement issues building permits and carries out inspections for new construction, renovations, and additions in Piedmont.',
    ],
    staff: [
      { name: 'Ben Singleton', role: 'Building Inspector', email: 'ben.singleton@piedmontcity.org', phone: '256-447-3582' },
      { name: 'Tashia Blackerby', role: 'City Clerk', email: 'tashia.blackerby@piedmontcity.org', phone: '256-447-3596' },
      { name: 'Charles McDonald', role: 'Code Enforcement Officer', email: 'charles.mcdonald@piedmontcity.org', phone: '(256) 447-3562' },
    ],
    downloadGroups: [
      {
        heading: 'Downloads',
        items: [
          { label: 'Building Permit Application (PDF)', href: '/documents/building-permit-application.pdf' },
          { label: 'Residential Sub-Contractor List (PDF)', href: '/documents/residential-sub-contractor-list.pdf' },
          { label: 'Commercial Sub-Contractor List (PDF)', href: '/documents/commercial-sub-contractor-list.pdf' },
          { label: 'Zoning Map (PDF)', href: '/documents/zoning-map.pdf' },
          { label: 'Zoning Ordinance (2004) (PDF)', href: '/documents/zoning-ordinance-2004.pdf' },
        ],
      },
    ],
    links: [
      { label: 'East Alabama Code Officials Association', href: 'http://www.freewebs.com/eacoa/index.htm' },
    ],
    closing:
      'For more information concerning building inspection in the City of Piedmont, please call us at 256‑447‑3582.',
    services: [
      'Building permit applications',
      'Construction and renovation inspections',
      'Code enforcement',
      'Zoning map and ordinance access',
    ],
    hours: [
      { d: 'Monday - Friday', h: '8:00 a.m. - 5:00 p.m.' },
    ],
    contact: {
      address: '109 N Center Ave, Piedmont, AL 36272',
      phone: '256-447-3582',
    },
    lat: 33.9248, lng: -85.6112,
    img: '/images/departments/building-inspection',
    alt: 'A new house under building inspection in Piedmont',
  },

  // ---------------------------------------------------------------- LIBRARY
  {
    slug: 'public-library',
    name: 'Public Library',
    short: 'Books, movies, computers, free Wi-Fi, and programs at the Piedmont Public Library.',
    intro:
      'The Piedmont Public Library has books, movies, audio materials, public use computers and free wireless. Stop in and visit the library today!',
    about: [
      'The Piedmont Public Library has books, movies, audio materials, public use computers and free wireless. Stop in and visit the library today!',
    ],
    staff: [
      { name: 'Donna Garmon', role: 'Library Director', email: 'donna.garmon@piedmontcity.org' },
      { name: 'Cathy Posey', role: 'Clerk' },
    ],
    links: [
      { label: 'Story Time Program (toddlers & preschoolers)', href: 'https://www.piedmontcity.org/wp-content/uploads/2024/08/2024-2025-PIEDMONT-PUBLIC-LIBRARY-STORY-TIME-SCHEDULE.pdf' },
      { label: 'Summer Reading Program', href: 'https://www.piedmontcity.org/events/library-summer-reading-program-2024/' },
      { label: 'Library Catalog', href: 'https://piedmont.bywatersolutions.com/' },
    ],
    services: [
      'Book and media lending',
      'Public computers and free Wi-Fi',
      'Online catalog access',
      'Story Time and Summer Reading programs',
    ],
    hours: [
      { d: 'Mon, Tue, Thu, Fri', h: '8:00 a.m. - 4:00 p.m.' },
      { d: 'Wednesday', h: '8:00 a.m. - 12:00 p.m.' },
    ],
    contact: {
      contactName: 'Donna Garmon, Library Director',
      contactEmail: 'donna.garmon@piedmontcity.org',
      customerEmail: 'piedmontpubliclibrary@gmail.com',
      address: '109 North Main St, Piedmont, AL 36272',
      phone: '(256) 447-3369',
      altPhone: '(256) 447-3383',
    },
    lat: 33.9252, lng: -85.6115,
    img: '/images/departments/library',
    alt: 'The Piedmont Public Library',
  },
];

export function getDepartment(slug) {
  return DEPARTMENTS.find((d) => d.slug === slug);
}
