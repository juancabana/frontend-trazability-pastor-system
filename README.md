# Frontend — Sistema de Trazabilidad Pastoral

Aplicación React 19 + Vite. Consume la API NestJS del backend.

## Comandos

```bash
npm install
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm run preview    # Preview del build
```

## Variables de entorno

```env
VITE_BACKEND_URL=http://localhost:3000/api   # default en dev
```

---

## Funcionalidad: Envío de correos (consolidados)

La sección **"Enviar Reporte"** del panel de administración depende de un
*feature flag* que se obtiene del servidor al iniciar la sesión, mediante el
endpoint público `GET /api/config/public`:

```json
{
  "features": { "emailEnabled": false }
}
```

Toda la lógica vive en el backend — el frontend **solo lee** el flag y
oculta/muestra la UI en consecuencia. No es necesario tocar variables de
entorno del frontend para habilitarlo o deshabilitarlo.

### Comportamiento según el flag

| `features.emailEnabled` | Sidebar admin | Ruta `/admin/send-report` | API `POST /api/consolidated/send-report` |
|---|---|---|---|
| `false` (default) | Oculta el item *Enviar Reporte* | Renderiza un aviso "Envío de correos deshabilitado" | Responde `503 Service Unavailable` |
| `true` | Muestra el item con icono de correo | Renderiza el formulario completo | Envía el correo |

### Cómo habilitarlo

1. **En el backend**: configurar `EMAIL_ENABLED=true` y las variables `MAIL_*`
   (ver [`backend-trazability-pastor-system/README.md`](../backend-trazability-pastor-system/README.md#funcionalidad-envío-de-correos-consolidados)).
2. Reiniciar el backend.
3. En el frontend, recargar la página o esperar a que expire la cache de
   TanStack Query (1 hora). Tras eso, `useFeatureFlags().emailEnabled`
   devolverá `true` y la sección aparecerá automáticamente.

### Cómo deshabilitarlo

Apagar `EMAIL_ENABLED` en el backend. El frontend ocultará la sección en el
siguiente refresh. No requiere despliegue del frontend.

### Archivos involucrados

- [src/features/config/domain/business-config.ts](src/features/config/domain/business-config.ts) — tipo `BusinessConfig.features.emailEnabled`.
- [src/features/config/hooks/use-business-config.ts](src/features/config/hooks/use-business-config.ts) — hook `useFeatureFlags()` y `FALLBACK_CONFIG`.
- [src/components/AdminLayout.tsx](src/components/AdminLayout.tsx) — filtra el item *Enviar Reporte* del sidebar.
- [src/pages/admin/AdminSendReportPage.tsx](src/pages/admin/AdminSendReportPage.tsx) — muestra aviso si está deshabilitado.

### Forzar localmente (debug)

Para forzar el estado en desarrollo sin tocar el backend, modificar
temporalmente `FALLBACK_CONFIG.features.emailEnabled` en
[`use-business-config.ts`](src/features/config/hooks/use-business-config.ts).
**No commitear este cambio** — el valor real debe venir siempre del servidor.

---

## Arquitectura

Estructura por *feature*:

```
src/features/{feature}/
  domain/        # Tipos, entidades
  infra/         # Llamadas a la API
  presentation/  # Componentes
  hooks/         # TanStack Query hooks
```

Stack: TanStack Query v5, Tailwind v4, Lucide, Recharts, Sonner, Motion.
Alias `@/` → `src/`. Más detalle en [../docs/FRONTEND.md](../docs/FRONTEND.md).
