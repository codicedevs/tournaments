// Archivo de configuración centralizado para la URL base de la API
// export const API_BASE_URL = "http://192.168.1.8:3000";
// export const API_BASE_URL = "https://tournaments.tera.ar";
// export const API_BASE_URL = "http://localhost:6969";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:6969";

// Contraseñas por rol - desde variables de entorno
export const ROLE_PASSWORDS = {
  Admin: import.meta.env.VITE_ADMIN_PASSWORD || "admin123",
  Player: import.meta.env.VITE_PLAYER_PASSWORD || "jugador123",
  Viewer: import.meta.env.VITE_VIEWER_PASSWORD || "veedor123",
  Moderator: import.meta.env.VITE_MODERATOR_PASSWORD || "coordinador123",
  Referee: import.meta.env.VITE_REFEREE_PASSWORD || "arbitro123",
} as const;
