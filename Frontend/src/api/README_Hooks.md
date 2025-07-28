# Hooks de Autenticación

## Arquitectura de Hooks

La aplicación ahora utiliza una arquitectura de hooks para manejar las operaciones de autenticación, siguiendo las mejores prácticas de React y manteniendo la separación de responsabilidades.

## Hooks Disponibles

### `useLogin()`

**Propósito**: Maneja el proceso de inicio de sesión
**Retorna**: `{ login, loading, error }`

```typescript
const { login, loading, error } = useLogin();

const handleLogin = async () => {
  const response = await login(email, password);
  if (response) {
    // Login exitoso
    console.log(response.user);
  }
};
```

### `useChangePassword()`

**Propósito**: Maneja el cambio de contraseñas
**Retorna**: `{ changePassword, loading, error }`

```typescript
const { changePassword, loading, error } = useChangePassword();

const handleChangePassword = async () => {
  const success = await changePassword({
    oldPassword: "currentPass",
    newPassword: "newPass",
    confirmPassword: "newPass",
  });

  if (success) {
    // Contraseña cambiada exitosamente
  }
};
```

### `useGetProfile()`

**Propósito**: Obtiene el perfil del usuario autenticado
**Retorna**: `{ getProfile, loading, error }`

```typescript
const { getProfile, loading, error } = useGetProfile();

const handleGetProfile = async () => {
  const profile = await getProfile();
  if (profile) {
    console.log(profile);
  }
};
```

## Flujo de Autenticación

### 1. Login

```typescript
// En LoginPage.tsx
const { login } = useApp(); // Usa el contexto que internamente usa useLogin

const handleSubmit = async () => {
  const result = await login(email, password);
  if (result.success) {
    if (result.mustChangePassword) {
      navigate("/change-password", { state: { isFirstLogin: true } });
    } else {
      navigate("/dashboard");
    }
  }
};
```

### 2. Cambio de Contraseña

```typescript
// En ChangePasswordForm.tsx
const { changePassword, loading, error } = useChangePassword();

const handleSubmit = async () => {
  const success = await changePassword({
    oldPassword: isFirstLogin ? undefined : oldPassword,
    newPassword,
    confirmPassword,
  });

  if (success) {
    if (isFirstLogin) {
      navigate("/dashboard");
    } else {
      logout();
      navigate("/login");
    }
  }
};
```

## Ventajas de esta Arquitectura

### 1. **Separación de Responsabilidades**

- **Hooks**: Manejan la lógica de API y estado local
- **Contexto**: Maneja el estado global de autenticación
- **Componentes**: Se enfocan en la UI y validaciones

### 2. **Reutilización**

- Los hooks pueden ser usados en cualquier componente
- Lógica de autenticación centralizada
- Fácil de testear

### 3. **Manejo de Estado**

- Loading states automáticos
- Error handling consistente
- Estados de validación separados

### 4. **TypeScript**

- Tipos bien definidos para todas las operaciones
- Interfaces claras para requests y responses
- Autocompletado y validación de tipos

## Estructura de Archivos

```
src/api/
├── api.ts                    # Configuración de axios
├── authHooks.ts             # Hooks de autenticación
├── tournamentHooks.ts       # Hooks de torneos
├── teamHooks.ts            # Hooks de equipos
└── playerHooks.ts          # Hooks de jugadores

src/context/
└── AppContext.tsx          # Contexto global que usa hooks

src/components/auth/
└── ChangePasswordForm.tsx  # Componente que usa hooks

src/pages/
└── LoginPage.tsx           # Página que usa contexto
```

## Patrón de Uso

### Para Operaciones Simples

```typescript
// Usar directamente el hook
const { login, loading, error } = useLogin();
```

### Para Operaciones con Estado Global

```typescript
// Usar el contexto que internamente usa hooks
const { login } = useApp();
```

### Para Validaciones

```typescript
// Separar validaciones locales de errores de API
const [validationError, setValidationError] = useState("");
const { changePassword, error: apiError } = useChangePassword();

const displayError = validationError || apiError;
```

## Manejo de Errores

### Errores de Validación

- Manejados localmente en cada componente
- Validaciones de formulario antes de llamar a la API

### Errores de API

- Manejados por los hooks
- Mensajes de error consistentes
- Automáticamente limpiados en nuevas operaciones

### Errores de Autenticación

- Interceptados por axios interceptors
- Redirección automática a login
- Limpieza de token expirado

## Beneficios para el Desarrollo

1. **Mantenibilidad**: Código más limpio y organizado
2. **Testabilidad**: Hooks fáciles de testear en aislamiento
3. **Escalabilidad**: Fácil agregar nuevas funcionalidades
4. **Consistencia**: Patrón uniforme en toda la aplicación
5. **Performance**: Estados optimizados y re-renders controlados
