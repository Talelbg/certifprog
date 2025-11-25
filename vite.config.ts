import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Use VITE_ prefix for client-exposed variables or GEMINI_API_KEY from environment
    const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Only define if the key exists and is not empty to avoid embedding sensitive values
        'process.env.API_KEY': geminiApiKey ? JSON.stringify(geminiApiKey) : 'undefined',
        'process.env.GEMINI_API_KEY': geminiApiKey ? JSON.stringify(geminiApiKey) : 'undefined'
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
