# Guía de Creación de Usuarios

## Creación Automática de Contraseñas por Rol

Cuando se crea un usuario desde el dashboard, el sistema automáticamente asigna una contraseña según el rol seleccionado y establece `mustChangePassword` en `true`.

### Contraseñas por Rol

| Rol           | Contraseña Temporal | Descripción               |
| ------------- | ------------------- | ------------------------- |
| **Admin**     | `admin123`          | Administrador del sistema |
| **Player**    | `jugador123`        | Jugador de equipos        |
| **Viewer**    | `veedor123`         | Veedor/observador         |
| **Moderator** | `coordinador123`    | Coordinador/moderador     |
| **Referee**   | `arbitro123`        | Árbitro                   |

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
const password = getPasswordByRole(UserRole.PLAYER); // "jugador123"

// Los datos que se envían al backend:
const userData = {
  name: 'Juan Pérez',
  email: 'juan@ejemplo.com',
  password: 'jugador123', // Asignado automáticamente
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

- ✅ Las contraseñas temporales son predecibles pero seguras para el primer login
- ✅ Todos los usuarios deben cambiar su contraseña en el primer login
- ✅ Las contraseñas se hashean con bcrypt antes de guardarse
- ✅ Los usuarios creados por admin están automáticamente verificados

### Notas Importantes

1. **Cambio Obligatorio**: Todos los usuarios deben cambiar su contraseña en el primer login
2. **Verificación Automática**: Los usuarios creados por admin están automáticamente verificados
3. **Contraseñas Temporales**: Son solo para el primer acceso, no para uso prolongado
4. **Roles Específicos**: Cada rol tiene su propia contraseña temporal para facilitar la identificación
