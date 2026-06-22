// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Production URL. Used for canonical links and the contact form's
  // post-submit redirect. Change this if the site deploys to a different domain.
  site: 'https://rootsoftomorrow.org',
  vite: {
    plugins: [tailwindcss()]
  }
});