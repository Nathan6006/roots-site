# Roots of Tomorrow — Website

A rebuild of rootsoftomorrow.org in Astro + Tailwind CSS. Static, fast, free to
host. Replaces the old Framer site.

## Run it locally

    npm install      # first time only
    npm run dev      # dev server at http://localhost:4321
    npm run build    # build the static site into /dist

Needs Node 22.12+.

## Where things live

- src/pages/ — one file per page (index, get-involved, past-events, contact, donate, legal/)
- src/components/ — reusable pieces (Nav, Footer, StatBlock, Placeholder)
- src/layouts/Layout.astro — shared page shell (nav + footer + head)
- src/data/stats.json — SINGLE SOURCE OF TRUTH for trees/CO2/hours, contact info,
  counties, EIN, donate link. Change a number here, it updates everywhere.
- src/content/events/ — past events. Add one by dropping in a .md file (copy an
  existing one as a template). No code needed.
- src/styles/global.css — colors and fonts (design tokens).

- public/robots.txt, public/_redirects, public/_headers — crawler and host
  config, copied into dist as-is.
- The sitemap is generated at build time into dist/sitemap-index.xml by
  @astrojs/sitemap; the exclusion list lives in astro.config.mjs.

## To do before launch

- Point Google Search Console at the site: verify rootsoftomorrow.org (a DNS
  TXT record in Cloudflare covers every subdomain) and submit
  https://rootsoftomorrow.org/sitemap-index.xml.
- Redirect www.rootsoftomorrow.org to the apex with a 301. This is a Cloudflare
  dashboard setting (Bulk Redirects or a Single Redirect rule), not something
  the repo can do.
- Shrink the photos. The home page currently ships about 28 MB of images: the
  event photos are 2 to 6 MB PNGs and JPEGs displayed in a 320 px tile, and
  chapterImage.png is 2.7 MB. Lazy loading keeps them from blocking first
  paint, but re-exporting each at roughly its displayed size (and PNG photos
  as JPEG or WebP) is the real fix. Keep the same crops so the width and height
  attributes stay correct, and leave og-card.jpg as a 1200x630 JPEG.
- Replace placeholder images: every <Placeholder> marks a spot needing a real
  photo. Swap each for an <img> pointing at a file in /public.
- Fill in real Privacy Policy and Terms of Service (src/pages/legal/).
- Replace the four placeholder events in src/content/events/.
- Confirm the Donate URL in src/data/stats.json.

## Parked features (kept on disk, easy to restore)

- **Planting Log** (`/log`): parked until the per-event tree counts are
  reconciled with Nathan. The logged events sum to 9,800; the headline stat
  says 10,000 (rounded), and the site shouldn't publish both. The page markup
  is preserved in a comment in `src/pages/log.astro` (it currently redirects
  to home) and all the event data is intact in `src/data/planting-log.json`.
  To restore: fix the numbers, uncomment the page, then re-add the three links
  (nav in `Nav.astro`, footer in `Footer.astro`, and the "Read the full
  planting log" link under the carousel in `index.astro`).
- **Past Events** (`/past-events`): same pattern, parked earlier.

## Deploying (free)

Push to a GitHub repo, connect it to Cloudflare Pages (or Netlify / Vercel).
Build command: npm run build. Output directory: dist. Point rootsoftomorrow.org's
DNS at the host. No trial clock, free forever.
