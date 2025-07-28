# Guía de Creación de Usuarios

## ⚠️ IMPORTANTE: Seguridad de Contraseñas

**NUNCA subas las contraseñas al repositorio público.** Las contraseñas deben estar en variables de entorno.

### Configuración Segura

1. **Generar contraseñas seguras:**

   ```bash
   cd Frontend
   npm run generate-passwords
   ```

2. **Crear archivo .env:**

   ```bash
   cp env.example .env
   # Editar .env con las contraseñas generadas
   ```

3. **Verificar .gitignore:**
   Asegúrate de que `.env` esté en `.gitignore`

## Creación Automática de Contraseñas por Rol

Cuando se crea un usuario desde el dashboard, el sistema automáticamente asigna una contraseña según el rol seleccionado y establece `mustChangePassword` en `true`.

### Contraseñas por Rol (Variables de Entorno)

| Rol           | Variable de Entorno       | Descripción               |
| ------------- | ------------------------- | ------------------------- |
| **Admin**     | `VITE_ADMIN_PASSWORD`     | Administrador del sistema |
| **Player**    | `VITE_PLAYER_PASSWORD`    | Jugador de equipos        |
| **Viewer**    | `VITE_VIEWER_PASSWORD`    | Veedor/observador         |
| **Moderator** | `VITE_MODERATOR_PASSWORD` | Coordinador/moderador     |
| **Referee**   | `VITE_REFEREE_PASSWORD`   | Árbitro                   |

### Flujo de Creación

1. **En el Frontend** (`UserCreate.tsx`):

   - El administrador selecciona el rol del usuario
   - El sistema muestra automáticamente la contraseña que se asignará
   - Se establece `mustChangePassword: true` automáticamente
   - Se establece `isVerified: true` automáticamente

2. **En el Backend**:

   - El usuario se crea con la contraseña temporal hasheada
   - Se establece `mustChangePassword: true`
   - Se establece `isVerified: true`

3. **Después de la Creación**:
   - Se muestra un alert con las credenciales temporales
   - El usuario debe cambiar su contraseña en el primer login

### Ejemplo de Uso

```typescript
// En el frontend, cuando se selecciona un rol:
const password = getPasswordByRole(UserRole.PLAYER); // Desde VITE_PLAYER_PASSWORD

// Los datos que se envían al backend:
const userData = {
  name: 'Juan Pérez',
  email: 'juan@ejemplo.com',
  password: 'jugador123', // Asignado automáticamente desde variables de entorno
  role: 'Player',
  mustChangePassword: true, // Siempre true
  isVerified: true, // Siempre true
  teamId: 'team123', // Solo si es Player
};
```

### Pruebas

Para probar la creación de usuarios con diferentes roles:

```bash
npm run test-create-users
```

Este script creará usuarios de prueba con cada rol y mostrará las credenciales asignadas.

### Seguridad

- ✅ Las contraseñas están en variables de entorno (NO en el código)
- ✅ Contraseñas temporales seguras generadas automáticamente
- ✅ Todos los usuarios deben cambiar su contraseña en el primer login
- ✅ Las contraseñas se hashean con bcrypt antes de guardarse
- ✅ Los usuarios creados por admin están automáticamente verificados
- ✅ Archivo .env en .gitignore para evitar subir contraseñas

### Mejores Prácticas de Seguridad

1. **Variables de Entorno:**

   - Usa `.env` para desarrollo local
   - Usa variables de entorno del servidor en producción
   - NUNCA subas `.env` al repositorio

2. **Contraseñas Temporales:**

   - Genera contraseñas seguras con `npm run generate-passwords`
   - Cambia las contraseñas regularmente
   - Comparte las contraseñas de forma segura

3. **Rotación de Contraseñas:**

   - Cambia las contraseñas por defecto cada 3-6 meses
   - Usa contraseñas únicas para cada entorno (dev, staging, prod)

4. **Monitoreo:**
   - Revisa logs de autenticación regularmente
   - Implementa alertas para intentos de login fallidos
   - Monitorea cambios de contraseña

### Notas Importantes

1. **Cambio Obligatorio**: Todos los usuarios deben cambiar su contraseña en el primer login
2. **Verificación Automática**: Los usuarios creados por admin están automáticamente verificados
3. **Contraseñas Temporales**: Son solo para el primer acceso, no para uso prolongado
4. **Roles Específicos**: Cada rol tiene su propia contraseña temporal para facilitar la identificación
5. **Seguridad**: Las contraseñas están en variables de entorno, no hardcodeadas
