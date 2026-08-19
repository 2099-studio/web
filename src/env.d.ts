/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_LEAD_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
