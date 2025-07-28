# DTOs de Autenticación y Usuarios

## DTOs de Autenticación (`/auth/dto/`)

### SignInDto

**Propósito**: Inicio de sesión de usuarios
**Endpoint**: `POST /auth/login`

```typescript
{
  email: string; // Email del usuario (requerido, formato válido)
  password: string; // Contraseña (requerido, mínimo 6 caracteres)
}
```

### SignUpDto

**Propósito**: Registro de nuevos usuarios
**Endpoint**: `POST /auth/signup` (futuro)

```typescript
{
  email: string;              // Email del usuario (requerido, formato válido)
  password: string;           // Contraseña (requerido, mínimo 6 caracteres)
  confirmPassword: string;    // Confirmación de contraseña (requerido)
  name: string;               // Nombre del usuario (requerido)
  role?: Role;                // Rol del usuario (opcional)
  phone?: string;             // Teléfono (opcional)
}
```

### ChangePasswordDto

**Propósito**: Cambio de contraseña (primer login o cambio voluntario)
**Endpoint**: `POST /auth/change-password`

```typescript
{
  oldPassword?: string;       // Contraseña actual (opcional en primer login)
  newPassword: string;        // Nueva contraseña (requerido, mínimo 6 caracteres)
  confirmPassword: string;    // Confirmación de nueva contraseña (requerido)
}
```

## DTOs de Usuarios (`/users/dto/`)

### CreateUserDto

**Propósito**: Creación de usuarios por administradores
**Endpoint**: `POST /users`

```typescript
{
  email: string;                    // Email del usuario (requerido, formato válido)
  password: string;                 // Contraseña (requerido)
  role: Role;                       // Rol del usuario (requerido, enum)
  name: string;                     // Nombre del usuario (requerido)
  profilePicture?: string;          // URL de imagen de perfil (opcional)
  phone?: string;                   // Teléfono (opcional)
  isVerified?: boolean;             // Estado de verificación (opcional)
  mustChangePassword?: boolean;     // Forzar cambio de contraseña (opcional)
}
```

### UpdateUserDto

**Propósito**: Actualización de información de usuario
**Endpoint**: `PATCH /users/:id`

```typescript
{
  email?: string;                   // Email del usuario (opcional, formato válido)
  name?: string;                    // Nombre del usuario (opcional)
  profilePicture?: string;          // URL de imagen de perfil (opcional)
  phone?: string;                   // Teléfono (opcional)
  role?: Role;                      // Rol del usuario (opcional, enum)
  isVerified?: boolean;             // Estado de verificación (opcional)
  mustChangePassword?: boolean;     // Forzar cambio de contraseña (opcional)
}
```

**Nota**: No incluye `password` por seguridad. Para cambiar contraseñas usar `UpdatePasswordDto`.

### UpdatePasswordDto

**Propósito**: Cambio de contraseña desde perfil de usuario
**Endpoint**: `POST /users/update-password`

```typescript
{
  currentPassword: string; // Contraseña actual (requerido)
  newPassword: string; // Nueva contraseña (requerido, mínimo 6 caracteres)
  confirmPassword: string; // Confirmación de nueva contraseña (requerido)
}
```

## Diferencias entre DTOs

### SignInDto vs SignUpDto

- **SignInDto**: Solo email y password para autenticación
- **SignUpDto**: Incluye información completa del usuario + confirmación de contraseña

### ChangePasswordDto vs UpdatePasswordDto

- **ChangePasswordDto**: Para cambio forzado (primer login) - oldPassword es opcional
- **UpdatePasswordDto**: Para cambio voluntario - currentPassword es requerido

### CreateUserDto vs UpdateUserDto

- **CreateUserDto**: Todos los campos requeridos excepto opcionales
- **UpdateUserDto**: Todos los campos son opcionales (PATCH semantics)

## Validaciones

### Contraseñas

- Mínimo 6 caracteres
- Validación de confirmación
- Hasheo automático con bcrypt

### Emails

- Formato válido de email
- Validación con class-validator

### Roles

- Enum de roles predefinidos
- Validación de valores permitidos

## Seguridad

1. **Separación de responsabilidades**: Contraseñas manejadas por DTOs específicos
2. **Validación en capas**: Frontend y backend validan datos
3. **Hasheo automático**: Contraseñas hasheadas antes de guardar
4. **Campos sensibles**: Password no incluido en UpdateUserDto
