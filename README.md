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
- Redirect www.rootsoftomorrow.org to the apex with a 301. See "Canonical
  hostname" below. Still open: www currently answers 200 with a full copy of
  the site.
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

## Canonical hostname (www to apex)

The site lives at `https://rootsoftomorrow.org`. Everything the repo controls
already says so: `site` in astro.config.mjs, the canonical and og:url tags, the
sitemap, and the structured data. What the repo cannot control is the www
hostname, because `public/_redirects` on Cloudflare Pages matches paths only,
not hostnames. So www has to be redirected in the Cloudflare dashboard.

Without that rule, www.rootsoftomorrow.org serves a byte-identical copy of the
site with a 200, which is why Search Console reports two properties. (The
canonical tag points at the apex, so Google should eventually fold them, but a
301 is the signal it actually honors, and it moves the link equity.)

The rule, in the Cloudflare dashboard for the rootsoftomorrow.org zone, under
Rules > Redirect Rules > Create rule > Single Redirect:

- Name: `www to apex`
- If: Custom filter expression, `http.host eq "www.rootsoftomorrow.org"`
- Then: URL redirect, Expression (dynamic),
  `concat("https://rootsoftomorrow.org", http.request.uri.path)`
- Status code: 301
- Preserve query string: on

(The "Redirect from WWW to Root" template does the same thing with a wildcard
pattern, `https://www.*` to `https://${1}`, 301, preserve query string on.
Either is fine. Use the dynamic expression if you want it scoped to this one
hostname.)

Redirect Rules run at Cloudflare's edge before the request reaches Pages, so
www can stay attached to the Pages project as a custom domain. Leave it
attached: if www stops resolving entirely, old inbound links break instead of
redirecting.

Check it afterward with:

    curl -sI https://www.rootsoftomorrow.org/chapter/ | head -3

It should say `HTTP/2 301` with `location: https://rootsoftomorrow.org/chapter/`.

In Search Console, use a Domain property (`rootsoftomorrow.org`) rather than
two URL-prefix properties. A Domain property covers every subdomain and both
schemes, so www and apex stop being separate entities there too. The DNS TXT
verification record is already in Cloudflare.

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
