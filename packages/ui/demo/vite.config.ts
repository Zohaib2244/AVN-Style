import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The demo uses the package source directly and serves the synced CSS (npm run sync-css) from /.
export default defineConfig({
  root: here('.'),
  publicDir: here('../css'),
  plugins: [react()],
  resolve: { alias: { '@avn/ui': here('../src/index.ts') } },
  server: { port: 5199, strictPort: true },
});
