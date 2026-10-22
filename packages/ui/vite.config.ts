import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => 'avn-ui.js' },
    rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime', /^motion/, /^@radix-ui/] },
    emptyOutDir: false,
  },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./test/setup.ts'], css: false },
});
