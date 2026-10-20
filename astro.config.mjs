import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import site from './src/site.config.ts';

// GitHub Pages builds set PAGES_BASE=/<slug>/ and PAGES_SITE=https://<user>.github.io.
// The real domain stays the default, and canonical links always point to it.
export default defineConfig({
  site: process.env.PAGES_SITE || `https://${site.domain}`,
  base: process.env.PAGES_BASE || '/',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
