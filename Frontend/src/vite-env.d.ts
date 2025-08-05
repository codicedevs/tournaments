/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ADMIN_PASSWORD: string;
  readonly VITE_PLAYER_PASSWORD: string;
  readonly VITE_VIEWER_PASSWORD: string;
  readonly VITE_MODERATOR_PASSWORD: string;
  readonly VITE_REFEREE_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
