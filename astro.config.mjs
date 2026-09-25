// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// Pages that should never appear in the sitemap: the two parked redirects, the
// /chapters alias, the form's thank-you page, and the 404. Astro builds these
// as real files, so the sitemap would otherwise list URLs that redirect or
// carry a noindex. The filter receives the full absolute URL with a trailing
// slash.
const excludedFromSitemap = new Set([
  'https://rootsoftomorrow.org/past-events/',
  'https://rootsoftomorrow.org/log/',
  'https://rootsoftomorrow.org/chapters/',
  'https://rootsoftomorrow.org/thank-you/',
  'https://rootsoftomorrow.org/404/',
]);

// https://astro.build/config
export default defineConfig({
  // Production URL. Used for canonical links, the sitemap, structured data,
  // and the contact form's post-submit redirect. Change this if the site
  // deploys to a different domain.
  site: 'https://rootsoftomorrow.org',
  // The site is built as <page>/index.html and served at /page/, so internal
  // links, canonicals, og:url and the sitemap all use the trailing-slash form.
  // Stating it here keeps the dev server honest about it too.
  trailingSlash: 'always',
  // The chapter page gets shared as a spoken/printed link, so catch the plural
  // people will inevitably type. public/_redirects turns this into a real 301
  // on Cloudflare Pages and Netlify; this entry is the fallback for hosts that
  // ignore that file.
  redirects: {
    '/chapters': '/chapter/',
  },
  // Newsreader and Libre Franklin are downloaded at build time and served from our own
  // origin as woff2. Previously they came from fonts.googleapis.com, which put
  // a render-blocking stylesheet on a third-party origin in front of first
  // paint: two extra DNS lookups and TLS handshakes before any text could be
  // styled. Self-hosting removes both round trips, lets the files be preloaded,
  // and drops a third party from the critical path.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      // Variable font: one file covers the whole 400-700 range the site uses.
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Libre Franklin',
      cssVariable: '--font-franklin',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !excludedFromSitemap.has(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
