import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/', 
      server: {
        port: 3000,
        strictPort: true, // Garante que se a 3000 estiver ocupada, ele avise em vez de pular para outra
        host: true, // Libera para acesso na rede local (0.0.0.0)
        hmr: {
            clientPort: 3000, // Força o cliente a conectar na porta 3000 (corrige o erro de WebSocket)
        },
        watch: {
          usePolling: true, // Ajuda em alguns ambientes (WSL/Windows) onde a detecção de arquivo falha
        }
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        emptyOutDir: true,
      }
    };
});