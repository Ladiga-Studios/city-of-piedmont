# Update Notes

## NEW — About page: modern photo for "Schools, Industry & Today" (this delivery)
- The "Schools, Industry & Today" block on /about swapped the historic Frances E. Willard School photo for a modern-day shot of downtown Piedmont (`downtown-2.jpg/webp`, the storefront with the vintage Coca-Cola mural), caption "Downtown Piedmont today" — matching the block's modern-era content. Willard School still appears in the era gallery on /history.
- File changed: `src/app/about/page.js`.

---

# Update Notes

## NEW — Plain backgrounds: all decorative line art removed (this delivery)
Per request, every wavy/ridgeline/contour graphic is gone site-wide; backgrounds are now plain:
- **Homepage stats band ("Piedmont by the Numbers")** — the wavy ridge dividers above and below the green band are removed; the band now has clean straight edges (its gold top rule returns). `RidgeDivider.jsx` deleted along with its CSS.
- **Inner-page heroes (all ~25 pages)** — the faint topographic contour lines and the ridgeline along the hero's bottom edge are removed. Heroes keep the forest-green gradient and amber glow, ending on a straight edge.
- **"Today in Piedmont" panel** and **"City Bulletin" news cards** — ridgeline watermarks removed.
- Files changed: `src/app/page.js`, `src/app/pages.css`, `src/app/extras.css`, `src/app/home.css`. Deleted: `src/components/RidgeDivider.jsx`.

---

# Update Notes

## NEW — Pinhoti Trail page, hero contour redraw, Ladiga photo fix (this delivery)

### New page: /parks/pinhoti-trail
- Full Pinhoti Trail page under Parks & Recreation: what the trail is (335 mi, ~171 in Alabama, connects to the Appalachian Trail via the Benton MacKaye), Piedmont's role as a trail town, the Chief Ladiga junction north of town, Dugger Mountain Wilderness, and shelters.
- **Trailhead map with four pins**: Eubanks Welcome Center (in-town access via the Ladiga), High Point Trailhead (US 278), North FS 500 Trailhead, and Burns Trailhead (CR 55). Each entry in the sidebar card has its own "Get directions" link. Coordinates from Alabama Recreation Trails / Pinhoti Trail Alliance data.
- `ParkMap` extended with an optional `points` prop (multiple markers, tap-for-label popups, auto-fit bounds) and a `height` prop — fully backward compatible with the single-pin pages.
- Wired everywhere: Parks & Rec nav dropdown, Parks index card grid, sitemap.xml, and site search index. Generated `pinhoti-trail.webp` to pair with the existing jpg.

### Chief Ladiga page photo fix
- The Ladiga page was showing the Pinhoti Trail sign photo. It now shows `chief-ladiga-trail.jpg/webp` (the actual trail), with corrected alt text and caption, and the Pinhoti fact bullet now links to the new Pinhoti page.

### Hero "squiggly lines" — judgment call
- Verdict: the topographic-contour idea suits the foothills theme, but the old curves used reflected path commands that made lines wobble and **cross each other**, reading as scribbles, and the 700px tile visibly repeated on wide screens.
- Redrawn as clean, parallel, non-crossing elevation contours rendered **once** across the hero (`background-size: cover`, no repeat, no seams). Same quiet opacity; the ridgeline along the bottom edge is unchanged.
- Files changed: `src/app/pages.css`, `src/app/parks/chief-ladiga-trail/page.js`, `src/components/ParkMap.jsx`, `src/app/parks/page.js`, `src/lib/site.js`, `src/lib/search-index.js`, `src/app/sitemap.js`. Files added: `src/app/parks/pinhoti-trail/page.js`, `public/images/photos/pinhoti-trail.webp`.

---

# Update Notes

## NEW — News display polish (this delivery)
- **Homepage "City Bulletin" cards** — news articles without a photo no longer show a faded newspaper icon. They now render as a deliberate editorial card: deep forest green with a gold "City Bulletin" badge, gold date, cream headline, and the ridgeline watermark. A mix of photo and text-only articles now looks intentional.
- **/news page: photo no longer distorts on expand** — article photos are now framed thumbnails pinned to the top of the card at a fixed 4:3 ratio, so opening "Read more" leaves the photo exactly the same size instead of stretching it down the full card.
- **/news page: no-photo articles** get a forest-green left accent and a small gold star before the date, so text-only posts read as bulletins rather than missing images.
- Files changed: `src/app/page.js`, `src/app/home.css`, `src/app/news/news.css`.
- A `delete-sample-news.sql` cleanup script (removes the six sample articles by slug) ships alongside the project zip.

---

# Update Notes

## NEW — Inner-page tune-up (this delivery)

### Requested fixes
- **Top bar:** removed the News / Events / Contact quick links (redundant with the main menu). It now shows just the live City Hall status, weather, and the Translate menu.
- **Homepage stats:** removed the count-up animation — the numbers are static again.
- **About page:** the "Welcome to Piedmont" mural no longer appears twice; the intro figure below the hero now uses a different downtown storefront photo.

### Page hero v2 (every inner page, one CSS change)
`src/app/pages.css` — the shared `.page-hero` got a full atmosphere pass, so all ~25 inner pages are lifted at once: a richer layered forest-green gradient, faint topographic contour lines in the background, and the signature Appalachian ridgeline forming the bottom edge of every page hero — tying every page to the seal and the homepage.

### Distinct hero photos per page (no more photo-less heroes)
Government → historic old City Hall photo · Departments → Power & Light crew · Parks → Chief Ladiga Trail in fall · Contact → Eubanks Welcome Center · Careers → downtown street corner · Residents → Clyde H. Pike Civic Center · Events → Veterans Memorial Park · History → the original Selma, Rome & Dalton depot.

### Page redesigns (same information, better display)
- **Government** — cards now carry icons and hover arrows, plus a new dark-green Mayor & Council feature band with Mayor Farmer's photo linking to the council page.
- **Contact** — the plain text column is now four icon cards: City Hall with a "Get directions" Google Maps link, Phone with a 911 note, Email, and Hours with a live Open now / Closed now badge (`src/components/LiveHoursBadge.jsx`, shared city-hours logic).
- Site-wide card polish: `.info-card` hover shows a gold top hairline + arrow; section eyebrows carry a short gold rule.

### Files added
`src/components/LiveHoursBadge.jsx`

### Files changed
`src/app/pages.css`, `src/components/TopBar.jsx`, `src/app/page.js`, plus page files for about, government, contact, careers, departments, parks, residents, events, history.

---

# Update Notes

## NEW — "Living city" upgrade (this delivery)

### Utility top bar (all public pages)
`src/components/TopBar.jsx` — the thin forest-green bar from the mockup follow-ups, now with live data:
- **Live City Hall status** — "City Hall is open · Closes 4:30 PM", recomputed every minute in America/Chicago from the real hours. `src/lib/city-hours.js` is the single source of truth; edit hours there.
- **Live weather chip** — current temp + conditions for Piedmont via **Open-Meteo** (free, no API key, no signup). The fetch is shared/cached (15 min); the site works normally if it ever fails.
- Quick links (News / Events / Contact) and a **Translate** menu (Google Translate's translate.goog proxy — free, no key, translates the current page into 6 languages).

### "Today in Piedmont" panel (homepage)
`src/components/TodayPanel.jsx` — a dark-green live snapshot between the task strip and the news section: current conditions + feels-like + wind, a 3-day outlook, City Hall open/closed, and the **next event** from the calendar (falls back to a Chief Ladiga Trail prompt when the calendar is empty). Stable skeleton while loading; degrades gracefully if weather is unavailable.

### Signature ridgeline dividers (homepage)
`src/components/RidgeDivider.jsx` — a layered Appalachian ridgeline (echoing the hills on the city seal) carries the page into and out of the green "By the Numbers" band. The band's old gold border-top is dropped when a ridge is present (`.has-ridge`).

### Count-up stats
"Piedmont by the Numbers" values now animate up on scroll using the existing `StatCounter` component (reduced-motion users see final values instantly).

### Back-to-top button (all pages)
`src/components/BackToTop.jsx` — appears after ~600px of scrolling with a gold scroll-progress ring around it; keyboard accessible; respects reduced motion.

### Admin overview redesign
`src/app/admin/page.js` — the console home is now a real dashboard:
- Time-of-day greeting
- **Needs attention** panel: business listings awaiting approval, alerts currently showing to visitors, and a warning when the events calendar is empty
- Stat cards with icons
- **Recently added** feed merged across news / events / minutes / notices
- Quick-action tiles with plain-language descriptions

### Files added
`src/lib/city-hours.js`, `src/lib/use-weather.js`, `src/components/TopBar.jsx`, `src/components/TodayPanel.jsx`, `src/components/RidgeDivider.jsx`, `src/components/BackToTop.jsx`, `src/app/extras.css`

### Files changed
- `src/app/layout.js` — extras.css import, BackToTop, Open-Meteo preconnect
- `src/components/SiteChrome.jsx` — TopBar above the alert bar (still hidden on /admin)
- `src/app/page.js` — TodayPanel, ridge dividers, StatCounter
- `src/app/admin/page.js` + `src/app/admin/admin.css` — dashboard v2

### Verify before launch
- City Hall hours in `src/lib/city-hours.js` match the current posted hours (Mon–Thu 7:30–4:30, Fri 7:30–11:30, closed weekends — taken from the footer).
- The translate proxy host is hard-coded to `www-piedmontcity-org.translate.goog`; update it if the production domain ever changes.
- Optional next steps that would use your Google developer account: an embedded Google Map on /contact (Maps Embed API is free) and syncing /events to a public Google Calendar. Deliberately not wired in, so nothing depends on an API key.

---

# Update Notes

## Homepage redesign (matches approved mockup)
The homepage (`src/app/page.js` + `src/app/home.css`) was rebuilt to match the
approved "Rooted in History. Focused on Tomorrow." mockup:

- **Hero:** new headline/subhead, gold "Explore Our City" + outline "City Services"
  buttons, search bar docked over the hero bottom.
- **Quick-task strip:** 6 tiles — Pay Utilities, Permits & Licenses, Public Safety,
  Jobs, Events, Report an Issue.
- **News + Events:** "Latest News" cards now use real photos; "Upcoming Events" uses
  filled maroon date chips.
- **Discover Piedmont:** 5 photo cards with gold icons (Downtown, Outdoors, Parks,
  History, Community), centered title flanked by gold rules.
- **Green stats band:** real, sourced figures (see note below).
- Removed the old "City Services & Departments" list and "Around Piedmont" map/
  newsletter sections to match the cleaner mockup flow.

## Hero video
`src/components/HeroMedia.jsx` — the video now plays at **full, normal speed**.
The previous 0.8x slow-motion playback rate was removed. There was no CSS pan/
Ken-Burns effect; the only slowdown was the playback rate. Poster, lazy-load,
reduced-motion, and mobile-skip behavior are unchanged.

## Stats — verify before launch
- Population **4,787** = 2020 Census (Wikipedia infobox). Other sources list
  4,400–4,796; confirm the figure the City wants to display.
- Founded **1888** (named Piedmont); incorporated 1871 as Cross Plains. Matches seal.
- Trail **30+ miles** (Chief Ladiga is ~33 mi).
- Parks count is a **PLACEHOLDER** (shown as "5 *"). Replace with the real number
  and remove the asterisk + the `placeholder: true` flag in `page.js`.

## News & events content
The news headlines/dates and event listings on the homepage are realistic
**placeholders** taken from the mockup. Swap in live content (or wire to the CMS)
before launch.

## Not changed (optional follow-ups)
- Header & footer were left as-is (already on-brand). The mockup's thin green top
  utility bar (Translate/Contact/News/Calendar) and stacked "CITY OF / PIEDMONT /
  ALABAMA" wordmark are cosmetic refinements we can add on request.

## Homepage bottom redesign + depot photo
- **History card** now uses the historic Selma-Rome-Dalton Railroad depot photo
  (`/images/explore/history.jpg`); full-res copy also at `/images/photos/depot.{jpg,webp}`.
- **Fixed the empty space** below the Discover cards: tightened section spacing and
  gave the page a deliberate closing rhythm.
- **"Piedmont by the Numbers"** — the green stats band now has a heading and a gold
  top accent so it reads as a real section instead of a stranded strip. Stats grid
  fixed to 4 columns (was 5) and centered; wraps 2x2 on tablet/mobile.
- **New closing CTA** ("How can we help you today?") between the stats band and the
  footer, with a gold left-accent card and Pay My Bill / Contact buttons.
- Removed the leftover unused "Around Piedmont" CSS.
