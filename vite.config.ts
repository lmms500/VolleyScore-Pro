import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/', 
      server: {
        port: 3000,
        // 'true' faz o mesmo que '0.0.0.0' (libera para rede), mas é mais seguro
        host: true, 
        // Correção do WebSocket: Força o cliente a usar a porta 3000 explicitamente
        hmr: {
            clientPort: 3000,
        },
        // Opcional: ajuda se estiver rodando no Windows/WSL e as edições não atualizarem
        watch: {
            usePolling: true,
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