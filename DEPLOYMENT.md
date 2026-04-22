# 🚀 Guía de Deployment a Producción

## Variables de Entorno Requeridas

### **Obligatorias en Producción**
- `VITE_BACKEND_URL`: URL del backend API
  - **Desarrollo**: `http://localhost:3000/api`
  - **Producción**: Ej: `https://api.tudominio.com/api`

### **Opcionales (Solo Desarrollo)**
- `VITE_DEMO_PASTOR_EMAIL`: Email para demo de pastor
- `VITE_DEMO_ADMIN_EMAIL`: Email para demo de admin
- `VITE_DEMO_SUPERADMIN_EMAIL`: Email para demo de super admin
- `VITE_DEMO_PASSWORD`: Contraseña para demo

> ⚠️ **Las credenciales demo SOLO aparecen en desarrollo** (`!import.meta.env.PROD`)

---

## Configuración en Vercel

### 1. **Settings → Environment Variables**
Añade la siguiente variable:

```
VITE_BACKEND_URL = https://tu-backend-production.com/api
```

> No incluyas las credenciales demo en producción

### 2. **Validación en Tiempo de Build**
El archivo `src/config/env.ts` verifica que `VITE_BACKEND_URL` esté definido en producción:
```typescript
if (!import.meta.env.VITE_BACKEND_URL && import.meta.env.PROD) {
  throw new Error('VITE_BACKEND_URL environment variable is required in production');
}
```

---

## Checklist Pre-Deployment

- [ ] ✅ Backend API está deployado y accesible
- [ ] ✅ URL del backend configurada en Vercel
- [ ] ✅ Probar login con credenciales reales
- [ ] ✅ Verificar que la sección de demo NO aparece en producción
- [ ] ✅ Revisar CORS en backend si es necesario
- [ ] ✅ Certificados SSL/TLS en producción

---

## Cómo Probar Localmente

### Desarrollo (con demo activo)
```bash
npm run dev
# Las credenciales demo estarán disponibles en la pantalla de login
```

### Simular Producción (sin demo)
```bash
npm run build
npm run preview
# Las credenciales demo NO aparecerán
```

---

## Cambios Realizados

### 1. **Variables de Entorno Consistentes**
- ✅ Convertidos `.env.local.example` a usar `VITE_BACKEND_URL` (era NEXT_PUBLIC_BACKEND_URL)
- ✅ Agregar validación en `src/config/env.ts` para producción
- ✅ Crear variables separadas para credenciales demo

### 2. **Seguridad - Credenciales Demo**
- ✅ Movidas a variables de entorno (no hardcodeadas)
- ✅ Solo visibles en `!import.meta.env.PROD`
- ✅ Sección de acceso rápido ocultada en producción

### 3. **Hardcoded Values Eliminados**
- ✅ `src/shared/infra/adapters/fetch-http-adapter.ts`: Usa `STORAGE_KEYS` en lugar de strings hardcodeados

---

## Estructura Final de Variables

```
Development (.env.local)
├── VITE_BACKEND_URL = http://localhost:3000/api
├── VITE_DEMO_PASTOR_EMAIL = pastor@demo.com
├── VITE_DEMO_ADMIN_EMAIL = admin@demo.com
├── VITE_DEMO_SUPERADMIN_EMAIL = superadmin.norte@demo.com
└── VITE_DEMO_PASSWORD = demo1234

Production (Vercel)
└── VITE_BACKEND_URL = https://tu-api-produccion.com/api
    (Las variables demo se omiten)
```

---

## Monitoreo en Producción

1. **Revisar logs de Vercel** si hay errores de conexión al backend
2. **Verificar Network** en DevTools para asegurar las URLs correctas
3. **Comprobar CORS** si hay errores de acceso desde el frontend
4. **Validar JWT tokens** en el backend si hay problemas de autenticación

---

## Rollback si Algo Falla

Si necesitas volver atrás:
1. Revert el commit de deployment
2. Verifica que las variables de Vercel sean correctas
3. Redeploy desde Vercel dashboard

