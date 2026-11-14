import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiDocs } from './scripts/vite-plugin-api-docs.ts';
import pkg from './package.json';

const repoUrl = pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');

// GitHub Pages serves this project from /mui-collage-fab/, but the dev server stays at the
// root so its URL is unchanged. Preview runs in production mode too, so it matches the build.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/mui-collage-fab/' : '/',
  plugins: [react(), apiDocs()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __REPO_URL__: JSON.stringify(repoUrl),
  },
}));
