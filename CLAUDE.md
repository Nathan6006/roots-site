# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The website for **Roots of Tomorrow**, a youth-led 501(c)(3) nonprofit that plants
native trees and restores forests across Northeast Ohio (Geauga, Lorain, Cuyahoga,
and Ashtabula counties). This is a rebuild of the old Framer site as a static,
self-hosted site. The whole point is that it's free to host and easy to maintain
by one person.

## Stack

- **Astro 6** (static site generator, zero JS shipped by default)
- **Tailwind CSS 4** via the `@tailwindcss/vite` plugin (no `tailwind.config.js` —
  theme tokens live in CSS, see below)
- Deployed as static files (Cloudflare Pages / Netlify / Vercel)
- Node 22.12+

## Commands

    npm install        # install deps
    npm run dev        # dev server at http://localhost:4321
    npm run build      # build static site into /dist
    npm run preview    # preview the built site

Always run `npm run build` after making changes to confirm the site still compiles
before considering a task done.

## Project structure

    src/
      pages/           one file = one page/route
        index.astro          home
        about.astro          what the org is, how it is set up, who backs it
        faq.astro            questions + FAQPage structured data
        get-involved.astro
        past-events.astro
        contact.astro
        donate.astro
        legal/
          privacy-policy.astro
          terms-of-service.astro
      components/      reusable pieces
        Nav.astro
        Footer.astro
        StatBlock.astro      pulls numbers from data/stats.json
        Placeholder.astro    labeled placeholder for images not yet added
      layouts/
        Layout.astro         shared shell: nav + footer + <head>. Every page wraps in this.
      assets/
        images/              photos Astro processes (resized, WebP, srcset)
      data/
        stats.json           SINGLE SOURCE OF TRUTH (see below)
      content/
        events/              past events as markdown files
      styles/
        global.css           design tokens (colors + fonts) and base styles
    content.config.ts        schema for the events collection
    public/                  static assets served as-is (favicon, future images)

## Single source of truth: stats.json

`src/data/stats.json` holds every canonical number and piece of contact info:
trees planted, CO2 absorbed, volunteer hours, the four counties, the founding
date, the state and region, EIN, email, Instagram, LinkedIn, donate URL, and
the chapter list. Components import from it. `founded`, `state` and `region`
exist so the organization's structured data reads from the same place as the
page copy rather than hardcoding a second copy in `Layout.astro`.

**Never hardcode these values into a page.** If a stat needs to appear somewhere,
import it from `stats.json`. If a number changes, it changes in exactly one place
and updates everywhere. This file is also meant to stay consistent with the
numbers used in award applications and marketing, so accuracy matters.

## Design system

Colors and fonts are defined as tokens in `src/styles/global.css` inside the
`@theme { ... }` block. Tailwind 4 reads them from there, so a token like
`--color-canopy` becomes usable as `text-canopy`, `bg-canopy`, etc.

Palette (forest/soil, warm and green — not the generic AI cream-and-terracotta look):

- `canopy` #1f3d2b — darkest green, headings, primary buttons, footer
- `leaf` #3f6b3f — mid green, hover states, links
- `moss` #6b8e5a — muted green, eyebrows/labels
- `sprout` #a8c686 — light green, footer text accents
- `bark` #8c5a3c — brown accent (use sparingly)
- `soil` #2c2620 — near-black body text
- `cream` #f6f4ec — borders, soft section backgrounds
- `paper` #fbfaf5 — page background

Type: **Newsreader** (display, via `font-display`) for headings; **Libre Franklin** (body,
via `font-body`) for everything else. Both are **self-hosted**: they are declared
in the `fonts` block of `astro.config.mjs`, downloaded at build time, and
rendered by the two `<Font>` components in `Layout.astro`, which emit the
`@font-face` rules and the `<link rel=preload>`. Nothing is fetched from
fonts.googleapis.com. The `--font-display` / `--font-body` tokens in
`global.css` point at the `--font-newsreader` / `--font-franklin` variables the
config generates, each of which already carries its fallback stack. Headings are typically `font-display font-600 text-canopy`.

When adding UI, reuse these tokens and the existing patterns rather than
introducing new colors or fonts. Match the spacing and rounding already in use
(`rounded-2xl` / `rounded-3xl`, generous section padding, `max-w-6xl` containers).

## SEO conventions

The `<head>` is built entirely in `Layout.astro`. Don't add meta tags to a page
directly; pass props instead.

- **Every page passes a `title` and a `description`.** Titles are
  `Page | Roots of Tomorrow`, sentence-cased, unique. Descriptions are one or
  two plain sentences, unique per page, roughly 120 to 155 characters, written
  to the copy guidelines above. Never reuse a description across two pages.
- **Utility pages pass `noindex={true}`** (`thank-you.astro`, `404.astro`).
  The layout then emits a robots noindex and skips the canonical, because a
  noindex page and a canonical are contradictory signals. Don't also disallow
  those paths in robots.txt: a crawler has to fetch the page to read the
  noindex.
- **Internal links end with a trailing slash** (`/chapter/`, not `/chapter`).
  This applies to hrefs inside JavaScript objects too, such as the `primary`
  and `secondary` props on `CtaBand`, which is where a slashless link is
  easiest to miss and costs every page that renders the band a redirect.
  Pages are served at `/page/`, so a slashless link costs a redirect hop. This
  matches `trailingSlash: 'always'` in the config, the canonical, `og:url`, and
  the sitemap.
- **Structured data.** The schema.org NGO + WebSite graph renders on the home
  page only, from `stats.json`. A page that needs schema describing *itself*
  (`about.astro` passes an `AboutPage`, `faq.astro` an `FAQPage`) passes a
  `jsonLd` prop to `Layout`, which renders it in addition. On `faq.astro` the
  visible accordion and the `FAQPage` markup are generated from the same
  `faqs` array, because Google requires the marked-up answer to be the answer
  actually shown; keep it that way rather than maintaining two copies. Google does not want it on every page. Every
  value must be backed by something visible on the site. Note the EIN is the
  Hack Foundation's, so it is the sponsor's `taxID`, never ours.
- **Photos go in `src/assets/images/` and render through `<Image>`** from
  `astro:assets`, imported at the top of the file. That is what produces the
  resized WebP variants and the `srcset`. A raw `<img src="/images/...">`
  pointing into `public/` ships the original file at full size to every device,
  so don't add one. `public/images/` now holds only `og-card.jpg`, which needs
  a stable absolute URL for social scrapers.
- **Every `<Image>` needs `alt`, `widths`, `sizes`, and a `quality`.**
  - `widths` must never exceed the file's real pixel width, or Astro upscales
    and the "optimised" variant comes out bigger than the original. Check the
    source dimensions first.
  - Include a step near 828px for anything full-bleed: a 390px phone at 2x
    needs 780px, and without that step it pulls the 1024 variant.
  - `quality`: 45-50 for heroes (they sit under a 60-80% canopy overlay, so
    detail below that is invisible), 65 for photos shown plainly, 55 for the
    carousel. The default of 80 is wasteful on noisy outdoor photos.
  - Pass explicit `width`/`height` when nothing in CSS constrains the box.
    Astro otherwise stamps the source's natural size onto the tag.
- The one hero per page gets `loading="eager"`, `fetchpriority="high"` and
  `decoding="sync"`; everything below the fold gets `loading="lazy"
  decoding="async"`. An image inside a container that is `display:none` at a
  breakpoint should be lazy, so phones never download it.
- Alt text describes what is in the photo. In `EventCarousel.astro`, `alt` and
  `caption` are separate fields: `caption` is visible on the page, `alt` is not.
- **New pages** are picked up by the sitemap automatically. To keep one out,
  add its URL to `excludedFromSitemap` in `astro.config.mjs`.
- `public/robots.txt`, `public/_redirects`, and `public/_headers` are served
  as-is. `_redirects` gives the parked and alias routes real HTTP redirects on
  Cloudflare Pages and Netlify.
- Don't add `<meta name="keywords">`, sitemap `priority`/`changefreq`, or a
  build-time `lastmod`. Google ignores all of them.

## Conventions

- **Every page** imports and wraps its content in `Layout.astro`, passing a
  `title` and (ideally) a `description` prop for SEO.
- **Images**: the real photos are in `src/assets/images/`. Use `<Placeholder>`
  only where a photo is genuinely still missing, and replace it with an
  `<Image>` (see the SEO section above for the rules) once one exists. Don't
  invent image paths that don't exist.
- **Special characters**: inside an Astro `.astro` template's plain text, use
  HTML entities (`&rarr;`, `&ldquo;`). Inside JavaScript strings in the
  frontmatter (between the `---` fences), use the real character or a unicode
  escape; an HTML entity there would render literally. Em dashes are banned
  outright (see writing guidelines above).
- **Adding a past event**: copy an existing file in `src/content/events/`, change
  the frontmatter (`title`, `date`, `location`, `summary`), and write the body.
  The fields are validated by the schema in `content.config.ts`; keep them.
  Don't touch `past-events.astro` just to add an event.
- **Adding a chapter**: add `{ city, state, lat, lon }` to `chapters` in
  `stats.json`. The map pin (placed by projecting lat/lon in
  `ChapterMap.astro`), the filled-in state, and every chapter/state count on
  the home and chapter pages update from that. Lower 48 only; Alaska and
  Hawaii would need the inset math added.
- Keep components small and reusable. If the same markup appears on two pages,
  pull it into `src/components/`.

## Writing / copy guidelines

The copy on this site matters as much as the code. Follow these:

- **Lead with the specific and local**, not generic climate language. "The forests
  near home are thinning out" beats "climate change threatens our planet." The
  org's edge is that it's local, youth-led, and hands-on — the writing should
  sound like that.
- **No AI-patterned writing**: avoid rule-of-three stacking ("organized,
  passionate, and dedicated"), false ranges, hollow significance inflation,
  negative parallelisms ("not just X, but Y"), and promotional filler. Write
  plainly and like a real person.
- **No em dashes, anywhere on the site.** They read as AI-written. Rewrite the
  sentence with a comma, colon, period, or parentheses instead.
- **Do not mention awards.** The org has not won the awards being applied for;
  don't reference any awards anywhere on the site.
- Keep a warm, direct, grounded register. Sentence case. Active voice.

## Before finishing any task

1. Run `npm run build` and confirm it completes with no errors.
2. If you changed a stat or contact detail, confirm it came from / went into
   `stats.json`, not a hardcoded value.
3. If you added copy, re-read it against the writing guidelines above.

## Parked pages

`/past-events` and `/log` are hidden on purpose (each redirects to home, with
the original markup preserved in a comment in its page file). The Planting Log
is parked until the event tree-counts are reconciled with the headline stat;
see the "Parked features" section of README.md for the restore steps. Don't
delete these files or their data (`src/data/planting-log.json`), and don't
resurface the pages unless asked.

## Things to leave alone unless asked

- Don't run `npm audit fix --force` — it can break dependencies to chase
  low-severity warnings that don't matter for a static site.
- Don't add a CMS, database, or backend. This is intentionally a static site
  maintained by one person editing files.
- Don't add heavy client-side JavaScript or large dependencies without a clear
  reason; the site's speed and simplicity are features.