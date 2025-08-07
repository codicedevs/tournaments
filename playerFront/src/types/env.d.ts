/// <reference types="vite/client" />

// Declare strongly-typed env vars (optional but recommended)
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // add more as needed …
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
