# City of Piedmont — Website

A full refresh of the City of Piedmont, Alabama website. Built with **Next.js 14 (App Router)**, deployed on **Vercel**, with **Supabase** for auth, database, and PDF storage.

Aesthetic: **Warm Stone & Sunset** — warm limestone neutrals, charcoal-brown, and sunset-orange/terracotta accents (drawn from the city seal). Display type: Fraunces. Body: Source Sans 3.

---

## 1. Quick start

```bash
npm install
cp .env.local .env.local   # then fill in your Supabase keys
npm run dev
```

Open http://localhost:3000

> **Note:** `next/font` downloads Fraunces & Source Sans 3 from Google Fonts on first build. This requires internet access (fine locally and on Vercel).

## 2. Supabase setup

1. Create a project at supabase.com.
2. In **SQL Editor**, run `supabase-schema.sql` (creates tables + row-level security).
3. In **Storage**, create a **public** bucket named `minutes`, then run the storage policies noted at the bottom of the SQL file.
4. In **Project Settings → API**, copy your URL and anon key into `.env.local`.
5. Create a staff login: **Authentication → Users → Add user** (email + password). That user can sign in at `/admin/login`.

## 3. Admin console

- `/admin/login` — staff sign in (Supabase Auth)
- `/admin/dashboard` — upload council minutes (PDF → Storage), view/delete posted minutes
- Routes under `/admin` are protected by `src/middleware.js`.

The public **Minutes** page (`/government/minutes`) reads approved records and shows download links automatically.

## 4. Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add the three env vars from `.env.local` to Vercel's Environment Variables.
4. Deploy.

## 5. Project structure

```
src/
  app/
    layout.js              root layout (fonts, header, footer, JSON-LD)
    page.js                home page
    globals.css            design system (all tokens)
    chrome.css             header + footer styles
    home.css / pages.css   page styles
    government/            gov overview, council, minutes
    departments/          departments
    parks/                parks + trail + creek
    business/             business directory
    contact/              contact + form
    admin/                login + dashboard
    not-found.js robots.js sitemap.js
  components/             Header, Footer, Seal, Modal, ClientEffects, forms
  lib/                   supabase clients, site config
supabase-schema.sql      run this in Supabase
```

## 6. Swapping in real assets

- **City seal:** drop `seal.png` into `/public/images/` and update `src/components/Seal.jsx` to use it.
- **Photos:** replace the Unsplash URLs in `home.css` (hero) and `page.js` (cards) with your real Piedmont photos placed in `/public/images/`.
- **City data:** edit `src/lib/site.js` once — address, phone, nav all flow from there.

## 7. Standards

Built to the master standards: responsive (mobile→desktop), full SEO (metadata, OG, JSON-LD, sitemap, robots, semantic headings), Intersection Observer scroll reveals respecting `prefers-reduced-motion`, custom accessible modals/toasts (no `alert()`), WCAG AA focus states, labeled inputs, CSS-variable design system, lazy-loaded images.
