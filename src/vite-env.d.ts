/// <reference types="vite/client" />

interface ImportMetaEnv {
  // O Vite define 'PROD' como uma variável de ambiente global
  readonly PROD: boolean;
  // Se você tiver outras variáveis de ambiente (ex: VITE_API_URL), elas iriam aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}