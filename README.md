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

## To do before launch

- Replace placeholder images: every <Placeholder> marks a spot needing a real
  photo. Swap each for an <img> pointing at a file in /public.
- Fill in real Privacy Policy and Terms of Service (src/pages/legal/).
- Replace the four placeholder events in src/content/events/.
- Confirm the Donate URL in src/data/stats.json.

## Deploying (free)

Push to a GitHub repo, connect it to Cloudflare Pages (or Netlify / Vercel).
Build command: npm run build. Output directory: dist. Point rootsoftomorrow.org's
DNS at the host. No trial clock, free forever.
