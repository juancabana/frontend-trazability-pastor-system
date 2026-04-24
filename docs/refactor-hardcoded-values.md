# Refactor: eliminación de valores hardcodeados en el frontend

**Fecha:** 2026-04-24
**Branch:** feature/must-change-password

---

## Contexto

Se identificaron valores literales dispersos en múltiples componentes que debían
centralizarse para facilitar el mantenimiento. Los problemas eran:

- El umbral de cumplimiento (`70`) estaba repetido en 7 archivos.
- El día límite de reporte (`19`) como fallback aparecía en 4 lugares.
- La etiqueta de posición `'Pastor'` se comparaba como string literal en 2 archivos.
- El año de copyright estaba fijo como `2026` en 2 páginas.
- `TRANSPORT_CATEGORY_ID` carecía de documentación sobre su dependencia con el backend.

---

## Cambios en `src/constants/shared.ts`

Se agregaron cuatro nuevas constantes exportadas al inicio del archivo:

```ts
// Slug de la categoría "Transporte" en la base de datos.
// Si el backend cambia este identificador, actualizar aquí también.
export const TRANSPORT_CATEGORY_ID = 'transporte';          // ya existía, se documentó

// Umbral de cumplimiento mensual (porcentaje). Verde >= umbral, ámbar < umbral.
export const COMPLIANCE_THRESHOLD = 70;

// Fallback del día límite de reporte cuando el backend no envía el campo.
export const DEFAULT_REPORT_DEADLINE_DAY = 19;

// Etiqueta de posición principal. Usada para distinguir "Pastor" de otras posiciones.
export const PASTOR_POSITION_LABEL = 'Pastor';
```

---

## Archivos modificados

### Umbral de cumplimiento — `COMPLIANCE_THRESHOLD`

Reemplaza el literal `>= 70` en todos los indicadores de color verde/ámbar.

| Archivo | Ocurrencias |
|---|---|
| `src/pages/pastor/PastorCalendarPage.tsx` | 1 |
| `src/pages/pastor/PastorConsolidatedPage.tsx` | 1 |
| `src/pages/admin/AdminDashboardPage.tsx` | 1 |
| `src/pages/admin/AdminConsolidatedPage.tsx` | 1 |
| `src/pages/super-admin/SuperAdminDashboardPage.tsx` | 1 |
| `src/pages/super-admin/SuperAdminConsolidatedPage.tsx` | 2 |
| `src/pages/super-admin/SuperAdminAssociationDetailPage.tsx` | 1 |

**Antes:**
```tsx
color: cumplimiento >= 70 ? 'text-emerald-600' : 'text-amber-600'
```

**Después:**
```tsx
color: cumplimiento >= COMPLIANCE_THRESHOLD ? 'text-emerald-600' : 'text-amber-600'
```

---

### Día límite de reporte — `DEFAULT_REPORT_DEADLINE_DAY`

El backend envía `reportDeadlineDay` en el perfil del usuario. El `?? 19` era el
fallback silencioso en caso de que el campo no llegara. Ahora está nombrado y documentado.

| Archivo | Cambio |
|---|---|
| `src/context/AuthContext.tsx` | `res.reportDeadlineDay ?? DEFAULT_REPORT_DEADLINE_DAY` |
| `src/pages/pastor/PastorCalendarPage.tsx` | `currentUser?.reportDeadlineDay ?? DEFAULT_REPORT_DEADLINE_DAY` |
| `src/pages/pastor/PastorReportEditPage.tsx` | `currentUser?.reportDeadlineDay ?? DEFAULT_REPORT_DEADLINE_DAY` |
| `src/pages/pastor/PastorReportDetailPage.tsx` | `currentUser?.reportDeadlineDay ?? DEFAULT_REPORT_DEADLINE_DAY` |

---

### Posición del pastor — `PASTOR_POSITION_LABEL`

Evita comparaciones de cadena literal dispersas. Si el backend cambia la etiqueta
de la posición, el ajuste se hace en un solo lugar.

| Archivo | Cambio |
|---|---|
| `src/pages/admin/AdminPastoresPage.tsx` | `pastor.position === PASTOR_POSITION_LABEL` |
| `src/pages/admin/AdminConsolidatedPage.tsx` | `ps.position === PASTOR_POSITION_LABEL` |

---

### Año de copyright — dinámico

Reemplaza el año fijo `2026` por `new Date().getFullYear()` para que no quede
desactualizado al avanzar el calendario.

| Archivo |
|---|
| `src/pages/LoginPage.tsx` |
| `src/pages/ChangePasswordPage.tsx` |

**Antes:**
```tsx
&copy; 2026 Iglesia Adventista del Septimo Dia
```

**Después:**
```tsx
&copy; {new Date().getFullYear()} Iglesia Adventista del Septimo Dia
```

---

## Qué NO se cambió y por qué

| Elemento | Razón |
|---|---|
| `UNIT_LABELS` / `UNIT_LABELS_FULL` | Son etiquetas de presentación locales; las unidades son un enum cerrado definido en el backend y reflejado aquí. Sin endpoint que las sirva, mantener el mapeo aquí es la opción correcta. |
| `MONTHS_ES` / `DAYS_ES` | Localización fija en español; no provienen del backend y no hay plan de internacionalización. |
| Estadísticas en `LoginPage` (7 rubros, 42 subcategorías, 3 roles) | Son datos decorativos. Se recomienda a futuro obtenerlos del backend vía un endpoint `/stats` o eliminarlos si se desactualizan. |
| Configuración de roles (`ROLE_CONFIG`, `ROLE_ACCESS`) | La autorización real vive en el backend (JWT + guards). Estos datos son solo presentación y navegación en el cliente. |
