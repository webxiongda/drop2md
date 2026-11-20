import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal Vite config: React plugin only, no extra UI or styling tooling.
export default defineConfig({
  plugins: [react()],
});
