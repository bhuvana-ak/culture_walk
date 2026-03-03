import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Render provides a port via environment variables. 
  // This ensures your app listens where Render expects it to.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  return {
    server: {
      port: port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
    // The preview block is what Render uses when running 'npm run start'
    preview: {
      port: port,
      host: '0.0.0.0',
      allowedHosts: true, // This fixes the "Blocked request" error
    },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});