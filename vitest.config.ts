import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify('0.0.0-test'),
    __REPO_URL__: JSON.stringify('https://github.com/radomir-dev/mui-collage-fab'),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/components/**'],
      reporter: ['text', 'lcov'],
    },
  },
});
