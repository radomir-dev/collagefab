import { defineConfig } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: `http://127.0.0.1:${PORT}/mui-collage-fab/` },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/mui-collage-fab/`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
