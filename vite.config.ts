import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import compression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Genera .gz y .br para que el servidor sirva assets pre-comprimidos
    compression({ algorithm: 'gzip', ext: '.gz' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // exceljs y jspdf ya se cargan de forma lazy (solo al exportar), se sube
    // el límite para suprimir el warning sobre chunks que son intencionales.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/react-router/')
          ) return 'vendor-react';
          if (id.includes('/@tanstack/react-query')) return 'vendor-query';
          if (
            id.includes('/recharts/') ||
            id.includes('/d3-') ||
            id.includes('/victory-')
          ) return 'vendor-charts';
          if (id.includes('/motion/') || id.includes('/framer-motion/')) return 'vendor-motion';
          if (id.includes('/lucide-react/')) return 'vendor-icons';
        },
      },
    },
  },
});
