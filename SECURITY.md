# 🔒 Guía de Seguridad

## Variables de Entorno y Contraseñas

### ⚠️ CRÍTICO: Nunca subas contraseñas al repositorio

Las contraseñas y datos sensibles deben estar en variables de entorno, nunca en el código fuente.

### Configuración Inicial

1. **Generar contraseñas seguras:**

   ```bash
   cd Frontend
   npm run generate-passwords
   ```

2. **Crear archivo .env:**

   ```bash
   cd Frontend
   cp env.example .env
   # Editar .env con las contraseñas generadas
   ```

3. **Verificar .gitignore:**
   Asegúrate de que `.env` esté en `.gitignore`

### Variables de Entorno Requeridas

#### Frontend (.env)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:6969

# Role Passwords (CHANGE THESE!)
VITE_ADMIN_PASSWORD=your_secure_admin_password
VITE_PLAYER_PASSWORD=your_secure_player_password
VITE_VIEWER_PASSWORD=your_secure_viewer_password
VITE_MODERATOR_PASSWORD=your_secure_moderator_password
VITE_REFEREE_PASSWORD=your_secure_referee_password
```

#### Backend (.env)

```env
# Database
DBPASSWORD=your_mongodb_password

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_very_long_random_jwt_secret

# Other configurations
PORT=6969
NODE_ENV=development
```

### Mejores Prácticas de Seguridad

#### 1. Contraseñas Fuertes

- **Longitud mínima**: 12 caracteres
- **Complejidad**: Mayúsculas, minúsculas, números, símbolos
- **Rotación**: Cambiar cada 3-6 meses
- **Únicas**: Diferentes para cada entorno

#### 2. Variables de Entorno

- ✅ Usar `.env` para desarrollo local
- ✅ Usar variables del servidor en producción
- ❌ NUNCA subir `.env` al repositorio
- ❌ NUNCA hardcodear contraseñas

#### 3. Gestión de Secretos

- **Desarrollo**: Archivo `.env` local
- **Staging**: Variables de entorno del servidor
- **Producción**: Gestor de secretos (AWS Secrets Manager, Azure Key Vault, etc.)

#### 4. Monitoreo y Auditoría

- Revisar logs de autenticación regularmente
- Implementar alertas para intentos fallidos
- Monitorear cambios de contraseña
- Auditoría de accesos

### Checklist de Seguridad

#### Antes de subir al repositorio:

- [ ] Verificar que `.env` esté en `.gitignore`
- [ ] No hay contraseñas hardcodeadas en el código
- [ ] Las variables de entorno están configuradas
- [ ] Los secretos están protegidos

#### En producción:

- [ ] Usar HTTPS
- [ ] Configurar CORS correctamente
- [ ] Implementar rate limiting
- [ ] Usar gestor de secretos
- [ ] Monitorear logs de seguridad

### Comandos Útiles

```bash
# Generar contraseñas seguras
npm run generate-passwords

# Verificar archivos que se van a subir
git status

# Verificar que .env no esté en el staging
git diff --cached --name-only | grep -E "\.env$"
```

### Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
