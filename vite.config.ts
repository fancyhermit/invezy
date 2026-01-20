
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/',
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      external: ['html2canvas', 'jspdf'],
      input: {
        main: './index.html'
      },
      output: {
        globals: {
          html2canvas: 'html2canvas',
          jspdf: 'jspdf'
        }
      }
    }
  }
});
