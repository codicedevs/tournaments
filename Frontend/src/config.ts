console.log("🔧 Environment variables:", {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
});

// Forzar HTTPS en producción
if (import.meta.env.PROD && window.location.protocol === "http:") {
  const httpsUrl = window.location.href.replace("http:", "https:");
  console.log("🔄 Redirecting to HTTPS from frontend:", httpsUrl);
  window.location.href = httpsUrl;
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://torneosloyal.ar";

// Contraseñas por rol - desde variables de entorno
export const ROLE_PASSWORDS = {
  Admin: import.meta.env.VITE_ADMIN_PASSWORD || "admin123",
  Player: import.meta.env.VITE_PLAYER_PASSWORD || "jugador123",
  Viewer: import.meta.env.VITE_VIEWER_PASSWORD || "veedor123",
  Moderator: import.meta.env.VITE_MODERATOR_PASSWORD || "coordinador123",
  Referee: import.meta.env.VITE_REFEREE_PASSWORD || "arbitro123",
} as const;
