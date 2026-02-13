import { defineConfig } from 'vite';

// GitHub Pages project site: https://adobe-sean.github.io/aem_assets_email_composer/
// Base must match the repo path so asset URLs resolve correctly.
export default defineConfig({
  base: '/aem_assets_email_composer/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
