// ============================================================
// Adopted city ordinances published on /government/ordinances.
//
// To publish another ordinance:
//   1. Drop the signed PDF in  public/documents/  using the naming
//      pattern  ordinance-<number>-<short-slug>.pdf
//   2. Add an object to the TOP of ORDINANCES below.
//   3. That's it — the page, the jump links, the sitemap and the
//      site search all read from this file.
//
// Field notes:
//   id        anchor used in the URL (#ordinance-640) — keep it stable
//   adopted   "YYYY-MM-DD", the date on the signature page
//   effective optional plain-English note if the ordinance is not
//             effective on adoption (e.g. "30 days after publication")
//   amends    optional: what part of the city code it changes
//   summary   one sentence a resident can read in three seconds
//   applies   who is actually bound by it
//   points    the substantive requirements, plainly stated
//   penalty   what happens on violation
//   file      path to the official signed PDF
// The PDF is always the official text; everything else here is a summary.
// ============================================================

export const ORDINANCES = [
  {
    id: 'ordinance-640',
    number: '640',
    title: 'Prohibiting Brown Bagging of Alcoholic Beverages',
    adopted: '2025-04-15',
    amends: 'Chapter 3, Alcoholic Beverages — adds Sec. 3.5',
    summary:
      'Customers may not bring their own alcohol into a business licensed by the City, and businesses may not allow it.',
    applies:
      'Every non-residential business licensed by the City of Piedmont, its owners, managers, agents and employees, and any person entering those premises. It applies whether or not the business is licensed to sell alcohol.',
    points: [
      'A licensed non-residential business may not allow patrons, customers, invitees or guests to bring alcoholic beverages onto the premises.',
      'It is separately unlawful for a person to bring alcoholic beverages onto the premises of a licensed non-residential business.',
      'Violating the state alcoholic beverage control laws or ABC Board rules (Chapter 28, Code of Alabama 1975) is also a violation of the city chapter.',
    ],
    exceptions: [
      'Private events. The prohibition does not apply to alcohol brought to a private event, party, banquet, seminar, reception, wedding, reunion, fundraiser or similar occasion that people attend by invitation of the host.',
    ],
    penalty: null,
    file: '/documents/ordinance-640-brown-bagging-alcoholic-beverages.pdf',
    keywords:
      'brown bagging brown-bag alcohol alcoholic beverages byob bring your own liquor beer wine restaurant bar business premises abc board chapter 3 ordinance 640',
  },
  {
    id: 'ordinance-639',
    number: '639',
    title: 'Prohibiting THC Products and Other Non-Conforming Pharmaceuticals',
    adopted: '2025-04-15',
    effective: '30 days after passage and publication',
    summary:
      'Businesses licensed by the City may not sell, stock or display high-THC products, look-alike drugs, or similar items sold as pain relief, supplements or relaxation aids.',
    applies:
      'Any person or registered agent holding a City of Piedmont business license or permit, including convenience stores, gas stations, mobile retailers, specialty outlets, warehouses and wholesalers.',
    points: [
      'Prohibits manufacturing, marketing, distributing, delivering, bartering, selling, possessing or displaying "non-conforming pharmaceuticals" at any licensed retailer in the city.',
      'Non-conforming products include anything over 0.3 percent THC on a dry weight basis; anything that violates federal drug law (21 U.S.C. §§ 331 and 355, or § 505 of the Food, Drug & Cosmetic Act); anything that violates Title 20-2-20 through 20-2-32 of the Code of Alabama 1975; drugs designed to mimic controlled substances and impair judgment or coordination; and products packaged or displayed to suggest recreational drug use.',
      'Delta products may not be labeled, packaged or advertised using the words candy, cake, cupcake or pie, or any brand or variant of those words.',
      'Delta products may not use trade dress, branding or imagery copied from food products marketed to minors — breakfast cereal, cookies, juice drinks, soft drinks, frozen drinks, ice cream, sorbet, sherbet or frozen pops.',
      'Delta products may not use characters or symbols that appeal mainly to minors, including superheroes, comic book characters, video game characters, television and movie characters, mythical creatures or unicorns.',
      'A business found with a suspect product must, at its own expense, submit a sample to the Piedmont Police Department for testing at a city-approved laboratory.',
      'Prescription medicine and medicine dispensed by a licensed hospital, health care facility or pharmacy are not covered by this ordinance.',
    ],
    exceptions: [],
    penalty:
      'First violation: written notice, immediate removal of the items, and automatic suspension of the city business license for at least 15 days if the business does not comply. Each additional day out of compliance is a separate offense. Second violation: items become contraband subject to seizure, criminal prosecution for each offense, a fine of up to $500 on conviction, and license suspension of at least 30 days. Third and later violations: seizure, arrest, up to $500 per occurrence on conviction, and automatic license suspension pending a public hearing, with revocation by a super-majority vote of the Mayor and Council. Any other violation of the ordinance carries a fine of up to $500 and up to six months in the municipal jail at the judge\u2019s discretion. A business may appeal an automatic suspension in writing within 72 hours and request a hearing at the next regular Council meeting.',
    file: '/documents/ordinance-639-prohibiting-thc-products.pdf',
    keywords:
      'thc delta 8 delta-8 delta 9 hemp cannabinoid gummies vape smoke shop kratom gas station convenience store non-conforming pharmaceuticals paraphernalia business license suspension ordinance 639',
  },
  {
    id: 'ordinance-636',
    number: '636',
    title: 'Short-Term Rentals',
    adopted: '2023-02-07',
    amends: 'Zoning Ordinance of the City of Piedmont',
    summary:
      'Anyone renting a home or room in Piedmont for less than 30 days needs a city STR license, insurance, a 24-hour contact and posted house rules.',
    applies:
      'Owners and operators of any dwelling, or part of a dwelling, rented for less than 30 consecutive days, in both residential and non-residential districts. Rentals of 30 consecutive days or more are not covered.',
    points: [
      'A current STR Business License is required before you offer, advertise or rent a short-term rental. One license per unit, renewed annually, at a fee not to exceed $100 per STR.',
      'The application must name an emergency contact who answers calls 24 hours a day, seven days a week, responds to complaints within one hour, and can be on site within 12 hours at the City\u2019s request.',
      'You must carry fire and casualty coverage plus general liability of at least $500,000, on top of homeowner\u2019s insurance, and show proof before the license is issued and again at each renewal.',
      'Before the license is issued, you must give written notice to the owners of adjoining properties and file a copy with the Business License Division. The notice lists the owner, operator and emergency contact, the code enforcement number for reporting violations, and the unit\u2019s maximum occupancy.',
      'Maximum occupancy is two persons per bedroom plus two, and the written rental agreement must limit overnight occupancy to that number.',
      'No on-premises signage that can be read from a public street right-of-way.',
      'Adequate off-street parking (concrete or asphalt) or on-street parking must cover renters and guests. No recreational vehicle, bus or trailer may be parked on the street.',
      'The owner or operator may not prepare or serve food to renters, and cooking facilities are not allowed in bedrooms. Licensed Bed and Breakfast Homes are exempt from this provision.',
      'A copy of the license, the emergency contact information and the house rules must be posted in a conspicuous place inside the unit.',
      'The structure must look and function like a typical home in its neighborhood. Anything that does not goes to the Zoning Board for case-by-case review before a license can be issued.',
      'Existing and new operators have 30 calendar days from the ordinance\u2019s effective date to get licensed.',
    ],
    exceptions: [],
    penalty:
      'Code Enforcement issues written notice of the violation, the corrective action required and a compliance date, and may extend that date if real progress is being made. An uncorrected violation can bring temporary suspension of the STR license. Recurring noise, occupancy, parking or safety violations can start revocation proceedings, and the City Council may revoke, restrict or suspend an STR license by majority vote. A violation is a misdemeanor, punishable on conviction by the fine set in Article IX, Section 4 of the zoning ordinance.',
    file: '/documents/ordinance-636-short-term-rentals.pdf',
    keywords:
      'short term rental str airbnb vrbo vacation rental license permit occupancy insurance emergency contact zoning ordinance 636 renting a room',
  },
];

// "2025-04-15" -> "April 15, 2025"
export function fmtOrdinanceDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
