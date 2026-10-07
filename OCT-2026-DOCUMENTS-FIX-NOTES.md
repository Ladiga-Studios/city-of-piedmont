# October 2026: Library link, library page, and City Documents

## What changed

**Residents page (/residents)**
- The "Library page" link in Schools, Library & Voting now goes to `/departments/public-library`. It used to point at the old `/departments/library/` address.
- The broken WordPress PDF links in **Start or Stop Service** and **Water Quality** are gone. Both cards now show whatever staff post in the admin console:
  - **Start or Stop Service** shows the Water & Gas section called *Service Forms & Applications*.
  - **Water Quality** shows the newest 3 *Water Quality Reports*. When there are more than 3, it adds a link to the full list on the Water & Gas page.
  - A card with nothing posted yet shows no links.
- The page refreshes every 60 seconds, so new uploads appear within a minute.

**Library page (/departments/public-library)**
- Removed the "Story Time Program" and "Summer Reading Program" links. The Library Catalog link stays.

**Water & Gas page (/departments/water-gas)**
- Removed all the hard-coded WordPress PDFs, which were broken: the utility application, the service policy, the EFV notice, the water quality reports for 2017–2024, and the PFAS/PFOS results. The page now lists only documents posted from the admin console.
- Each document list now has an anchor on the page, e.g. `#water-quality-reports`.

**Admin console (/admin/documents)** has been rebuilt:
1. **Choose the file.** Staff can drag and drop it or click to choose one. It must be a PDF, Word, or Excel file of 50 MB or less.
2. **Name it.** The name fills in automatically from the file name, and staff can change it.
3. **Which page?** Staff pick the department page.
4. **Which list on that page?** Staff pick from cards that explain each list and say where else it shows. For example, "Also shows on the Residents page, Water Quality card". They can also start a new list.
5. **Date.** Lists show the newest date first.
- Before posting, a live preview shows exactly what residents will see.
- The "On the site now" list can be filtered by department and searched.
- Each document has **Open**, **Edit**, and **Remove** buttons. **Edit** lets staff rename the document, move it to another page or list, change its date, or replace the file with a newer version. The old file is cleaned up automatically.
- Files now upload straight from the browser to Supabase Storage. The old upload went through a Vercel function, which rejects anything over 4.5 MB, and that covers most water quality reports.

## No database changes
This work uses the existing `city_documents` table and `city-documents` bucket from `supabase-add-people-documents.sql`.

## To do after deploy
Re-upload the Water & Gas files at /admin/documents:
- Under **Service Forms & Applications**: the Residential Service Application, the Standard Service Policy, and the Excess Flow Valves notice (optional).
- Under **Water Quality Reports**: the latest water quality report, older reports (each dated with its publish date), and the PFAS/PFOS results.

## Still pointing at the old site
On the Water & Gas page, "Water Service Line Report" links to `piedmontcity.org/service-line/`. The new site has no page at that address, so this link probably 404s too.

## Files
- `src/app/residents/page.js`
- `src/lib/departments.js`
- `src/lib/document-sections.js` (new): the list definitions shared by the admin console and the public pages
- `src/lib/people.js`: adds `getDocumentSection()` and a tiebreak on sort order
- `src/app/departments/[slug]/page.js`: section anchors and file-type labels
- `src/app/admin/documents/page.js` and `documents-admin.css`
- `/api/admin/upload-document` is no longer used by the console. It was left in place and is safe to delete.
