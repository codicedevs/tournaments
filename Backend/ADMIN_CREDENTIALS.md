# Credenciales de Administrador

## Usuario Administrador Creado

✅ **Usuario administrador creado exitosamente**

### Credenciales de Acceso:

- **📧 Email**: `admin@tournaments.com`
- **🔑 Contraseña inicial**: `admin123`
- **👤 Nombre**: Administrador
- **🆔 ID**: `6887be79d2145e59611aaa49`

### ⚠️ IMPORTANTE:

- **Debe cambiar la contraseña en el primer login**
- El sistema forzará el cambio de contraseña por seguridad
- Después del primer login, será redirigido al formulario de cambio de contraseña

## Cómo Usar

### 1. Iniciar Sesión

1. Ve al frontend de la aplicación
2. Usa las credenciales:
   - Email: `admin@tournaments.com`
   - Contraseña: `admin123`

### 2. Cambio de Contraseña Obligatorio

1. Después del login, serás redirigido automáticamente al formulario de cambio de contraseña
2. Ingresa una nueva contraseña segura
3. Confirma la nueva contraseña
4. Haz clic en "Cambiar Contraseña"

### 3. Acceso al Sistema

1. Una vez cambiada la contraseña, tendrás acceso completo al sistema
2. Como administrador, podrás:
   - Crear y gestionar torneos
   - Administrar equipos y jugadores
   - Gestionar usuarios
   - Configurar fases y partidos

## Scripts Disponibles

### Crear Nuevo Usuario Admin

```bash
# Script directo (recomendado)
npm run create-admin-direct

# Script TypeScript (si hay problemas con rutas)
npm run create-admin-simple
npm run create-admin
```

### Verificar Usuario Existente

El script verifica automáticamente si el usuario ya existe y no lo duplica.

## Seguridad

- La contraseña inicial es temporal
- El cambio de contraseña es obligatorio
- Usa una contraseña fuerte en el cambio
- Recomendado: mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos

## Resolución de Problemas

### Si el script falla:

1. Verifica que MongoDB esté corriendo
2. Verifica la conexión a la base de datos
3. Asegúrate de estar en el directorio correcto del Backend

### Si el login falla:

1. Verifica que el backend esté corriendo
2. Verifica que el frontend esté corriendo
3. Revisa la consola del navegador para errores
