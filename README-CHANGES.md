# Piedmont fix — missing PageHeroPhoto component (build error)

Extract over your project root, then restart the dev server.

## The error
"Module not found: Can't resolve '@/components/PageHeroPhoto'" on
src/app/about/page.js. Eight pages import this component (About, History, all five
parks, and the department detail page), so the build fails until the file exists.

## The cause
PageHeroPhoto.jsx was created in the earlier "photo in the page hero" update, but the
file didn't make it into your project — likely that zip wasn't fully extracted, so the
component was missing while the pages that import it were present.

## The fix (files included)
- `src/components/PageHeroPhoto.jsx`  — the missing component
- `src/app/pages.css`                 — includes the .page-hero-photo styles the
                                        component needs (in case those were missing too)

After extracting, restart `npm run dev`. The build error will clear and the hero
photos on About, History, the parks, and department pages will render.

## Tip
If you ever see "Module not found" again, it means a component file referenced by an
import didn't get copied in — extract the full update zip (or ask me to resend the
specific missing file).
