# Departments — real content added

Every department page was previously running on generic/placeholder text (most
fields were flagged `verify: true`). All nine departments have been rewritten to
match the City of Piedmont's live site (piedmontcity.org/departments/*) word-for-word,
including staff, sub-offices, phone/fax numbers, hours, downloads, and mission/duty lists.

## What changed

**`src/lib/departments.js`** — replaced the inferred content with the real content
for all nine departments, and added optional rich fields the old data didn't have:
`about`, `mission` (+ heading/intro), `body`, `duties` (+ heading), `staff`,
`offices` (sub-offices/divisions), `downloads`, `downloadGroups`, `links`, `notice`,
and an expanded `contact` (contactName, contactEmail, customerEmail, altPhone, fax).

**`src/app/departments/[slug]/page.js`** — the detail page now renders all of the
above when present. Departments with none of the rich fields still render exactly as
before, so nothing breaks. The index cards (`/departments`) are unchanged.

**`src/app/departments/[slug]/department.css`** — added styles for the new blocks
(mission/duty bullet lists, staff cards, sub-office cards, notice callouts, download
buttons, link lists, closing line), all using the existing Warm Stone & Sunset tokens.

## What's now on each page

- **Administrative** — Mission Statement (8 points), 6 staff with emails, City Hall
  contact (phone + fax + PO Box), and the Calhoun County Annex sub-office (phone, hours, county link).
- **Power & Light** — history (first power Nov 27, 1890), "Our Mission", "What We Do"
  duties, manager Corey Horton, the Energy Southeast / Electric Cities memberships,
  and the Power Outages reporting callout (business-hours vs. after-hours numbers).
- **Water & Gas** — 4 utility staff with emails, the Piedmont Water Filtration Plant
  sub-office (Jon Edwards, address, 256-447-6656), utility application + service policy
  + EFV downloads, and all 9 Water Quality Reports (2017–2024 + PFOS/PFAS), plus the
  Water Service Line Report link.
- **Public Safety** — separate Police (Chief Nathan Johnson, phone/fax, Ladiga St) and
  Fire (Chief Todd Kirkland, Center Ave, business + fire-call numbers) divisions.
- **Revenue** — Officer Amy Rawson (email), Sales Tax + Business License download forms,
  dedicated line 256-447-3564.
- **Municipal Court** — Court Clerk Janet Henson and Magistrate Susan Glover, phone/fax,
  exact office hours (Wed closed), and the "1st & 3rd Tuesday, 9:00 a.m." court-session callout.
- **Public Works** — full 20-item Department Duties list and both supervisors
  (Tim Frost, Henry Reynolds) with their direct numbers.
- **Building Inspection** — 3 staff (Singleton, Blackerby, McDonald) with emails/phones,
  the EACOA membership link, and 5 downloads (permit app, residential/commercial sub
  lists, zoning map, zoning ordinance book).
- **Public Library** — Director Donna Garmon + clerk Cathy Posey, hours (Wed half-day),
  two phone numbers, the customer-service Gmail, and links to Story Time, Summer Reading,
  and the online catalog.

## Notes

- Phone numbers, emails, addresses, hours, and document links are copied exactly as
  published. The download links point at the city's existing hosted files, so they work
  immediately.
- Map pin coordinates for a few departments are approximate (the live site doesn't
  publish exact lat/lng for every office); the addresses shown are exact. Adjust the
  `lat`/`lng` on any department in `departments.js` if you want the pin moved.
- Department photos still load from `/public/images/departments/*` as before — drop the
  real images in to replace the placeholders.
