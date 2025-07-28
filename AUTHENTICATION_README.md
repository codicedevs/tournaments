# Sistema de Autenticación con Cambio de Contraseña Forzado

## Descripción

Este sistema implementa autenticación completa con las siguientes características:

- **Login con email y contraseña**
- **Cambio de contraseña forzado en el primer login**
- **Cambio de contraseña voluntario desde el perfil**
- **Protección de rutas con JWT**
- **Hasheo seguro de contraseñas con bcrypt**

## Instalación

### Backend

1. Instalar dependencias:

```bash
cd Backend
npm install
```

2. Configurar variables de entorno:
   Crear un archivo `.env` en la carpeta `Backend` con:

```
DBPASSWORD=tu_password_de_mongodb
JWT_SECRET=tu_secret_key_super_segura
```

3. Crear usuario administrador inicial:

```bash
npm run create-admin
```

Esto creará un usuario con las siguientes credenciales:

- Email: `admin@tournaments.com`
- Contraseña: `admin123`
- Rol: `Admin`
- Debe cambiar contraseña: `true`

### Frontend

1. Instalar dependencias:

```bash
cd Frontend
npm install
```

2. Configurar URL del backend:
   Crear un archivo `.env` en la carpeta `Frontend` con:

```
VITE_API_URL=http://localhost:6969
```

## Uso

### Flujo de Autenticación

1. **Primer Login**:

   - Usuario ingresa con credenciales iniciales
   - Sistema detecta `mustChangePassword: true`
   - Redirige automáticamente al formulario de cambio de contraseña
   - Usuario debe cambiar su contraseña antes de continuar

2. **Login Normal**:

   - Usuario ingresa con sus credenciales
   - Sistema verifica `mustChangePassword: false`
   - Accede directamente al dashboard

3. **Cambio de Contraseña Voluntario**:
   - Usuario puede cambiar su contraseña desde el header
   - Debe ingresar contraseña actual y nueva contraseña
   - Al cambiar, se cierra sesión para re-autenticarse

### Endpoints del Backend

#### POST /auth/login

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

Respuesta:

```json
{
  "access_token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario",
    "role": "Admin",
    "mustChangePassword": true,
    "isVerified": true
  }
}
```

#### POST /auth/change-password

Requiere token JWT en header: `Authorization: Bearer <token>`

```json
{
  "oldPassword": "contraseña_actual", // Opcional en primer login
  "newPassword": "nueva_contraseña",
  "confirmPassword": "nueva_contraseña"
}
```

#### GET /auth/profile

Requiere token JWT en header: `Authorization: Bearer <token>`

Retorna información del usuario autenticado.

### Componentes del Frontend

#### LoginPage

- Formulario de login con validaciones
- Maneja redirección automática según `mustChangePassword`
- Muestra errores de autenticación

#### ChangePasswordForm

- Formulario para cambio de contraseña
- Modo "primer login" (sin contraseña actual)
- Modo "cambio voluntario" (con contraseña actual)
- Validaciones de contraseñas

#### Header

- Muestra información del usuario
- Botón para cambiar contraseña
- Botón de cerrar sesión

## Seguridad

### Backend

- **bcrypt**: Hasheo de contraseñas con salt
- **JWT**: Tokens de autenticación con expiración
- **Validación**: DTOs con class-validator
- **Guards**: Protección de rutas con Passport

### Frontend

- **LocalStorage**: Almacenamiento seguro de tokens
- **Validación**: Validaciones en formularios
- **Redirección**: Manejo de estados de autenticación

## Estructura de Archivos

### Backend

```
src/auth/
├── dto/
│   ├── login.dto.ts
│   └── change-password.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── local-auth.guard.ts
│   └── force-change-password.guard.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── decorators/
│   └── current-user.decorator.ts
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts
```

### Frontend

```
src/
├── components/auth/
│   └── ChangePasswordForm.tsx
├── pages/
│   ├── LoginPage.tsx
│   └── ChangePasswordPage.tsx
└── context/
    └── AppContext.tsx
```

## Pruebas

### Crear Usuario de Prueba

```bash
cd Backend
npm run create-admin
```

### Probar Flujo Completo

1. Iniciar backend: `npm run start:dev`
2. Iniciar frontend: `npm run dev`
3. Ir a `http://localhost:5173/login`
4. Usar credenciales: `admin@tournaments.com` / `admin123`
5. Cambiar contraseña cuando se solicite
6. Verificar acceso al dashboard

## Notas Importantes

- **Primer Login**: Todos los usuarios nuevos tienen `mustChangePassword: true`
- **Tokens JWT**: Expiran en 24 horas
- **Contraseñas**: Mínimo 6 caracteres
- **Validaciones**: Frontend y backend validan datos
- **Errores**: Manejo de errores en ambos lados

## Troubleshooting

### Error de CORS

Asegurarse de que el backend tenga CORS habilitado (ya configurado).

### Error de Conexión

Verificar que las URLs en los archivos `.env` sean correctas.

### Error de Autenticación

Verificar que el token JWT sea válido y no haya expirado.

### Error de Base de Datos

Verificar conexión a MongoDB y credenciales en `.env`.
