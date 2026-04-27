/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POCKETBASE_URL: string;
  readonly VITE_PB_LOGIN: string;
  readonly VITE_PB_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
