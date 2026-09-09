import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',            // works when opened from a file path or any subfolder
  server: { port: 5173 },
  build: { outDir: 'dist', assetsDir: 'assets' },
});
