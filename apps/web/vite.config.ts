import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fullcalendar/core/internal.js': path.resolve(__dirname, '../../node_modules/@fullcalendar/core/internal.js'),
      '@fullcalendar/core/preact.js': path.resolve(__dirname, '../../node_modules/@fullcalendar/core/preact.js'),
      '@fullcalendar/core/index.js': path.resolve(__dirname, '../../node_modules/@fullcalendar/core/index.js'),
    },
  },
});
