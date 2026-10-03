import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths allow deployment from a GitHub Pages project subpath.
  base: './',
});
