import { defineConfig } from 'vite';

// GitHub Pages: use repo name as base if deploying to username.github.io/repo-name
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
