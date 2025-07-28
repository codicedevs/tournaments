const crypto = require("crypto");

// Función para generar contraseñas seguras
function generateSecurePassword(length = 12) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  // Asegurar que tenga al menos una mayúscula, una minúscula, un número y un símbolo
  password += charset[Math.floor(Math.random() * 26)]; // minúscula
  password += charset[26 + Math.floor(Math.random() * 26)]; // mayúscula
  password += charset[52 + Math.floor(Math.random() * 10)]; // número
  password += charset[62 + Math.floor(Math.random() * 8)]; // símbolo

  // Completar el resto de la contraseña
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Mezclar los caracteres
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// Generar contraseñas para cada rol
const roles = ["Admin", "Player", "Viewer", "Moderator", "Referee"];

console.log("🔐 Generando contraseñas seguras para cada rol...\n");

const passwords = {};

roles.forEach((role) => {
  const password = generateSecurePassword(12);
  passwords[role] = password;

  console.log(`${role}: ${password}`);
});

console.log("\n📝 Variables de entorno para .env:");
console.log("=====================================");

Object.entries(passwords).forEach(([role, password]) => {
  const envVar = `VITE_${role.toUpperCase()}_PASSWORD`;
  console.log(`${envVar}=${password}`);
});

console.log("\n⚠️  IMPORTANTE:");
console.log("1. Copia estas variables a tu archivo .env");
console.log("2. NUNCA subas el archivo .env al repositorio");
console.log("3. Comparte las contraseñas de forma segura con los usuarios");
console.log("4. Cambia estas contraseñas regularmente");
