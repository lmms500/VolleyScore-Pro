import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Garante que o build funcione em subpastas ou raiz
      base: '/', 
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // Ajusta o alias @ para apontar para src corretamente
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        // Garante que o build limpe a pasta antiga
        emptyOutDir: true,
      }
    };
});