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
trees planted, CO2 absorbed, volunteer hours, the four counties, EIN, email,
Instagram, donate URL. Components import from it.

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

Type: **Fraunces** (display, via `font-display`) for headings; **Inter** (body,
via `font-body`) for everything else. Both load from Google Fonts at the top of
`global.css`. Headings are typically `font-display font-600 text-canopy`.

When adding UI, reuse these tokens and the existing patterns rather than
introducing new colors or fonts. Match the spacing and rounding already in use
(`rounded-2xl` / `rounded-3xl`, generous section padding, `max-w-6xl` containers).

## Conventions

- **Every page** imports and wraps its content in `Layout.astro`, passing a
  `title` and (ideally) a `description` prop for SEO.
- **Images**: there are no real photos yet. Use the `<Placeholder>` component
  wherever an image will go, with a descriptive `label`. When real images arrive,
  replace `<Placeholder>` with a standard `<img>` (or Astro's `<Image>`) pointing
  at a file in `/public`. Don't invent image paths that don't exist.
- **Em dashes and special characters**: inside an Astro `.astro` template's plain
  text, use HTML entities (`&mdash;`, `&rarr;`, `&ldquo;`). Inside JavaScript
  strings in the frontmatter (between the `---` fences), use the real character
  (—) or a unicode escape (`\u2014`) — an HTML entity there would render literally.
- **Adding a past event**: copy an existing file in `src/content/events/`, change
  the frontmatter (`title`, `date`, `location`, `summary`), and write the body.
  The fields are validated by the schema in `content.config.ts`; keep them.
  Don't touch `past-events.astro` just to add an event.
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
- **Do not mention awards.** The org has not won the awards being applied for;
  don't reference any awards anywhere on the site.
- Keep a warm, direct, grounded register. Sentence case. Active voice.

## Before finishing any task

1. Run `npm run build` and confirm it completes with no errors.
2. If you changed a stat or contact detail, confirm it came from / went into
   `stats.json`, not a hardcoded value.
3. If you added copy, re-read it against the writing guidelines above.

## Things to leave alone unless asked

- Don't run `npm audit fix --force` — it can break dependencies to chase
  low-severity warnings that don't matter for a static site.
- Don't add a CMS, database, or backend. This is intentionally a static site
  maintained by one person editing files.
- Don't add heavy client-side JavaScript or large dependencies without a clear
  reason; the site's speed and simplicity are features.