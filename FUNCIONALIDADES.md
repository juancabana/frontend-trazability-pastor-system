# Sistema de Trazabilidad de Actividades Pastorales
## Mapa Completo de Funcionalidades — Documentación Técnica

> **Organización:** Iglesia Adventista del Séptimo Día (IASD)  
> **Stack:** NestJS + PostgreSQL + React 19 + Vite + TailwindCSS v4  
> **Zona horaria de negocio:** America/Bogota  
> **Moneda:** COP (formato `es-CO`, sin decimales)

---

## Tabla de Contenidos

1. [Arquitectura General](#1-arquitectura-general)
2. [Sistema de Roles y Permisos](#2-sistema-de-roles-y-permisos)
3. [Seguridad y Autenticación](#3-seguridad-y-autenticación)
4. [Panel del Pastor](#4-panel-del-pastor)
5. [Panel del Administrador de Asociación](#5-panel-del-administrador-de-asociación)
6. [Panel del Super Administrador](#6-panel-del-super-administrador)
7. [Panel del Propietario (Owner)](#7-panel-del-propietario-owner)
8. [Sistema de Exportación](#8-sistema-de-exportación)
9. [Categorías de Actividades](#9-categorías-de-actividades)
10. [Lógica de Negocio y Reglas](#10-lógica-de-negocio-y-reglas)
11. [API REST — Endpoints Completos](#11-api-rest--endpoints-completos)
12. [Modelo de Datos](#12-modelo-de-datos)
13. [Servicio de Correo Electrónico](#13-servicio-de-correo-electrónico)
14. [Auditoría del Sistema](#14-auditoría-del-sistema)
15. [Detalles Técnicos Destacados](#15-detalles-técnicos-destacados)

---

## 1. Arquitectura General

El sistema se compone de **dos aplicaciones independientes** que se comunican mediante una API REST:

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (React 19 + Vite)          │
│         Puerto 5173 (dev) / CDN (prod)           │
│                                                   │
│  React Router 7 · TanStack Query v5 · Motion     │
│  TailwindCSS v4 · jsPDF · ExcelJS · Sonner       │
└────────────────────┬────────────────────────────┘
                     │ HTTP REST (JWT Bearer)
                     │ VITE_BACKEND_URL
                     ▼
┌─────────────────────────────────────────────────┐
│              BACKEND (NestJS)                    │
│                  Puerto 3000                     │
│                                                   │
│  TypeORM · Passport JWT · bcrypt · Throttler     │
│  Resend (email) · ExcelJS · Handlebars           │
└────────────────────┬────────────────────────────┘
                     │ TypeORM
                     ▼
┌─────────────────────────────────────────────────┐
│              PostgreSQL                           │
│        9 tablas · UUIDs · JSONB                  │
└─────────────────────────────────────────────────┘
```

### Jerarquía Organizacional Soportada

```
Unión
 └─ Asociación  (configura su propio día de corte, 1–27)
      └─ Distrito
           └─ Iglesia
                └─ Pastor  (registra informes diarios)
```

### Módulos del Backend (8 módulos de dominio)

| Módulo | Responsabilidad |
|--------|----------------|
| `auth` | Autenticación, usuarios, JWT, cambio de contraseña |
| `association` | Asociaciones, configuración, destinatarios externos |
| `district` | Distritos, validación de dependencias |
| `church` | Iglesias, traslado entre distritos |
| `daily-report` | Informes diarios de pastores (JSONB) |
| `consolidated` | Consolidados por pastor / asociación / unión |
| `activity-category` | Catálogo de categorías y subcategorías |
| `audit-log` | Registro de auditoría de cada acción del sistema |
| `union` | Uniones (nivel más alto de la jerarquía) |

---

## 2. Sistema de Roles y Permisos

El sistema implementa **5 roles con jerarquía estricta**. Cada rol tiene acceso a un conjunto diferente de funcionalidades y datos:

```
PASTOR (0) < ADMIN_READONLY (1) < ADMIN (2) < SUPER_ADMIN (3) < OWNER (4)
```

| Rol | Identificador | Color UI | Qué puede ver / hacer |
|-----|--------------|----------|----------------------|
| **Pastor** | `pastor` | Teal | Solo sus propios informes diarios y consolidado personal |
| **Solo Lectura** | `admin_readonly` | Sky/Azul | Ve todos los datos de su asociación, sin poder modificar nada |
| **Administrador** | `admin` | Índigo | Gestión completa de su asociación: usuarios, distritos, iglesias, envío de reportes |
| **Super Admin** | `super_admin` | Púrpura | Ve todas las asociaciones de su unión, consolidado de la unión |
| **Propietario** | `owner` | Ámbar | Acceso exclusivo a los registros de auditoría del sistema completo |

### Aislamiento de Datos por Rol

- Un **pastor** no puede ver informes de otro pastor.
- Un **admin** no puede acceder a datos de otra asociación, aunque conozca el ID (el backend valida en cada endpoint).
- Un **super_admin** solo ve las asociaciones de su propia unión.
- El **owner** no gestiona datos pastorales; solo audita el sistema.

### Permiso Especial: Excepción de Edición

Un administrador puede marcar a un pastor con el flag `canEditAllReports = true`. Este flag:

- Permite al pastor editar informes de **cualquier periodo**, incluso los cerrados por el día de corte.
- Se muestra en el calendario con el banner "Excepción de edición activa".
- Solo un usuario con rol `ADMIN` o superior puede activarlo/desactivarlo.

---

## 3. Seguridad y Autenticación

### Cifrado de Contraseñas — bcrypt (12 rondas)

Las contraseñas **nunca se almacenan en texto plano**. Se usa el algoritmo **bcrypt con 12 rondas de salt** antes de guardar en la base de datos.

- 4 rondas = referencia mínima (casi instantáneo)
- 10 rondas = estándar común
- **12 rondas = hardened** → cada intento de descifrado tarda ~250–400 ms, haciendo los ataques de fuerza bruta computacionalmente inviables

### JSON Web Tokens (JWT)

- **Expiración:** 7 días (`'7d'`)
- **Almacenamiento frontend:** `localStorage` con la clave `pastor_tracking_token`
- **Validación automática al montar la app:** si el token expiró, se limpia silenciosamente y el usuario es redirigido al login
- El payload del JWT incluye: `sub` (userId), `email`, `displayName`, `role`, `associationId`, `unionId`, `reportDeadlineDay`, `mustChangePassword`, `canEditAllReports`

### Rate Limiting (Protección contra Abusos)

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Todos los endpoints (global) | 30 requests | 60 segundos |
| `POST /auth/login` | **5 intentos** | 60 segundos |

El límite en login protege contra ataques de fuerza bruta. Después de 5 intentos fallidos, el servidor responde con HTTP 429 (Too Many Requests).

### Flujo de Primer Inicio de Sesión (mustChangePassword)

1. El administrador crea el usuario con una contraseña temporal → el flag `mustChangePassword` queda en `true`.
2. El usuario inicia sesión con la contraseña temporal.
3. El frontend detecta `mustChangePassword = true` en el token.
4. **Redirección obligatoria** a `/change-password` — no puede acceder a ninguna otra ruta.
5. En la pantalla de cambio:
   - Campo de nueva contraseña con **indicador visual de fortaleza** en tiempo real.
   - Requisitos enforced: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 dígito.
   - Campo de confirmación (deben coincidir).
   - Toggle para mostrar/ocultar contraseña.
6. Al guardar exitosamente: `mustChangePassword` se pone en `false`, el usuario es redirigido a su panel correspondiente.

> **Nota técnica:** El backend valida mínimo 6 caracteres (DTO), mientras el frontend exige 8 con requisitos adicionales. El frontend es más estricto a propósito, mejorando la seguridad sin romper compatibilidad.

### Guards de Seguridad (Backend)

| Guard | Función |
|-------|---------|
| `JwtAuthGuard` | Valida que el Bearer token exista y no esté expirado en cada request |
| `RolesGuard` | Verifica que el `role` del token cumpla el `@Roles()` del endpoint |
| `ThrottlerGuard` | Rate limiting global aplicado como `APP_GUARD` |
| `ProtectedRoute` (frontend) | Componente React que redirige si el rol no está permitido en esa ruta |

---

## 4. Panel del Pastor

> Ruta base: `/pastor/*` — Acceso exclusivo para rol `pastor`

### 4.1 Calendario de Reportes — `/pastor`

Pantalla principal del pastor. Muestra un **calendario mensual interactivo** con el estado de cada día del periodo de reporte.

**Elementos de la pantalla:**

- **4 tarjetas KPI** en la parte superior (con animación de entrada):
  - Días con informe registrado en el periodo
  - Porcentaje de cumplimiento (%)
  - Total de actividades del periodo
  - Total de gastos de transporte (COP)

- **Cabecera del periodo:** muestra las fechas de inicio y fin del periodo actual, o el banner "Excepción de edición activa" si el pastor tiene ese permiso especial.

- **Leyenda visual** explicando los estados de cada celda.

- **Grilla del calendario** (7 columnas, una por día de la semana):
  - Días con informe: celda con ícono de pluma (editable) o candado (bloqueado)
  - Días sin informe dentro del periodo editable: ícono de `+` para crear
  - Días futuros: atenuados (opacity reducida)
  - Al hacer clic navega al detalle o edición del informe

- **Navegación entre meses:** flechas izquierda/derecha.

**Estado reactivo:** el calendario consulta `useReportsByPastorMonth` y `usePastorConsolidated` en paralelo para poblar tanto el calendario como las KPIs.

---

### 4.2 Ver Detalle de Informe — `/pastor/report/:fecha`

Pantalla de solo lectura del informe de un día específico.

**Contenido:**

- Botón "Volver" al calendario.
- Fecha del informe formateada.
- Estado: editable / bloqueado.
- Si no existe informe: estado vacío con botón "Crear informe" (si el día es editable).
- Si existe informe: actividades organizadas por categoría.
  - Por cada actividad: nombre de subcategoría, descripción (si existe), cantidad + unidad (badge), horas (badge, si aplica), monto COP (badge, si es transporte).
- Sección de observaciones generales del día (si existen).
- Timestamp de creación del informe.
- Botón "Editar" visible si el día es editable.
- Botón "Eliminar" con diálogo de confirmación (solo periodo actual).

---

### 4.3 Crear / Editar Informe — `/pastor/report/:fecha/edit`

Formulario completo para registrar las actividades del día. Es la pantalla más compleja del rol pastor.

**Mecánica de edición:**

- Al cargar, sincroniza el estado local con el informe existente en base de datos comparando `updatedAt`. Si hay diferencia, pide confirmación antes de sobreescribir.
- Rastrea cambios con **snapshot JSON** — el botón Guardar solo se activa si hay modificaciones reales.
- Si el día no es editable (fuera del periodo): muestra un banner informativo y todos los campos quedan en modo solo lectura.

**Sección "Agregar Actividad" (parte superior):**

- **7 acordeones de categoría** expandibles.
- Al expandir una categoría: lista de subcategorías con su unidad de medida.
- Las subcategorías ya agregadas aparecen deshabilitadas con la etiqueta "Agregado".
- Al hacer clic en una subcategoría: se agrega a la lista de actividades actuales, se hace scroll automático hasta la nueva entrada, y se resalta brevemente con fondo teal (2 segundos).

**Sección "Actividades del Día" (lista editable):**

- Las actividades se agrupan por categoría.
- Por cada actividad:
  - **Campo Descripción** (texto libre, opcional).
  - **Campo Cantidad** (numérico, requerido, mínimo 0).
  - **Campo Horas** (numérico, visible solo si la subcategoría tiene `hasHours = true`).
  - **Campo Monto COP** (numérico, visible solo para la categoría Transporte).
  - **Botón Eliminar** (icono de basura, con animación de salida).

**Sección "Observaciones":**

- Textarea para notas generales del día.
- Editable o solo lectura según el estado del periodo.

**Botones de acción:**

- **Guardar** — deshabilitado si no hay cambios o si está guardando.
- **Cancelar** — vuelve al detalle del informe.
- **Eliminar Informe** — muestra diálogo de confirmación (solo periodo actual).

---

### 4.4 Consolidado Personal — `/pastor/consolidated`

Vista de resumen del periodo completo del pastor.

**Contenido:**

- **4 tarjetas KPI:** Días, Cumplimiento %, Actividades totales, Transporte total COP.
- **Metadatos del periodo:** fecha inicio, fecha fin, día de corte configurado.
- **Navegación de periodos:** flechas para ver el periodo actual o anteriores. El botón "Siguiente" se deshabilita cuando ya se está en el periodo actual.
- **Desglose por categoría:** secciones expandibles con:
  - Punto de color de la categoría, nombre, cantidad total, número de subcategorías activas.
  - Al expandir: tabla de subcategorías con cantidad / horas / unidad.
  - Fila de total al final de cada categoría.
- **Botones de exportación:**
  - `Exportar PDF` — genera y descarga el PDF del consolidado personal.
  - `Exportar Excel` — genera y descarga el workbook Excel del consolidado personal.

---

## 5. Panel del Administrador de Asociación

> Ruta base: `/admin/*` — Acceso para roles `admin` y `admin_readonly`

El rol `admin_readonly` accede a todas las pantallas pero **no puede modificar ningún dato**. Los botones de creación, edición y eliminación no aparecen o están deshabilitados.

### 5.1 Dashboard Principal — `/admin`

Pantalla de resumen ejecutivo de la asociación para el periodo actual.

**Contenido:**

- **5 tarjetas KPI:**
  - Pastores registrados en la asociación
  - Informes recibidos en el periodo
  - Total de actividades registradas
  - Total de horas reportadas
  - Total de gastos de transporte (COP)
- **Lista de pastores** con indicador de cumplimiento (verde / ámbar / rojo) para identificación rápida.
- **Navegación de periodos.**
- Clic en cualquier pastor navega a la vista de sus informes.

---

### 5.2 Listado de Pastores — `/admin/pastores`

Tabla completa de todos los pastores de la asociación con métricas del periodo.

**Funcionalidades:**

- Buscador por nombre o email (filtro en tiempo real).
- **Columnas de la tabla:** Nombre, Cargo (position), Cumplimiento %, Actividades, Horas.
- Ordenamiento por columnas.
- Selector de periodo con navegación.
- Indicadores de color de cumplimiento por fila.
- Clic en una fila navega a `/admin/pastor/:pastorId` con todos sus informes.

---

### 5.3 Gestión de Distritos e Iglesias — `/admin/distritos`

Vista jerárquica: Distrito → Iglesias → Pastores asignados.

**Gestión de Distritos:**

| Acción | Detalle |
|--------|---------|
| Crear distrito | Modal con campo Nombre (máx 200 chars) |
| Editar nombre | Modal de edición inline |
| Eliminar distrito | Confirmación. **Bloqueado si tiene iglesias o pastores** — el sistema lanza un `ConflictException` descriptivo |
| Buscar distri­tos | Filtro por nombre en tiempo real |

**Gestión de Iglesias (dentro de cada distrito):**

| Acción | Detalle |
|--------|---------|
| Crear iglesia | Modal: nombre (máx 200 chars) + dirección opcional (máx 300 chars) |
| Editar iglesia | Modal con los mismos campos |
| **Mover iglesia a otro distrito** | Modal con selector de destino. La iglesia y sus datos se conservan íntegramente |
| Eliminar iglesia | Diálogo de confirmación |

**Gestión de Pastores (dentro de cada distrito):**

| Acción | Detalle |
|--------|---------|
| Ver pastores | Listado dentro de cada tarjeta de distrito |
| Reasignar pastor a otro distrito | Selector de distrito de destino |

Todas las operaciones destructivas (eliminar, mover) tienen **diálogos de confirmación** antes de ejecutarse.

---

### 5.4 Consolidado de Asociación — `/admin/consolidated`

Resumen agregado de **todos los pastores** de la asociación para un periodo.

**Contenido:**

- Selector de periodo con navegación.
- **Tabla de resumen por pastor:** nombre, distrito, cumplimiento % (con color), actividades, horas, transporte COP.
- **Desglose por categoría y subcategoría:** totales de toda la asociación.
- Indicadores de color según umbrales de cumplimiento.
- **Exportar PDF** y **Exportar Excel** con formato profesional.

---

### 5.5 Gestión de Usuarios — `/admin/usuarios`

CRUD completo de los usuarios de la asociación.

**Lista de usuarios:**

- Buscador por nombre o email.
- Tabla paginada con: Nombre, Email, Rol (badge con color), Cargo, Teléfono, Fecha de creación.

**Crear usuario** (modal con campos):

| Campo | Crear | Editar | Validación |
|-------|:-----:|:------:|-----------|
| Nombre | ✓ | ✓ | Obligatorio, máx 100 chars |
| Email | ✓ | ✓ | Obligatorio, formato email válido, único en el sistema |
| Contraseña | ✓ | Opcional | Mín 6 chars (backend) / con requisitos en frontend; vacío = no cambia |
| Rol | ✓ | ✓ | Selector: pastor, admin_readonly, admin |
| Distrito | ✓ | ✓ | Selector de distritos de la asociación (opcional, solo pastores) |
| Cargo | ✓ | ✓ | Texto libre, máx 30 chars (ej: "Pastor", "Ministro"; solo pastores) |
| Teléfono | ✓ | ✓ | Máx 20 chars (opcional) |
| Mostrar/ocultar contraseña | ✓ | ✓ | Toggle de visibilidad |

**Editar usuario** (modal con mismos campos + extra):

- Todos los campos del formulario de creación, incluyendo **Email** (editable; el backend valida que no esté en uso por otro usuario).
- **Checkbox "Excepción"** (`canEditAllReports`): habilita al pastor para editar informes de cualquier periodo, incluso los cerrados.
- Si se cambia la contraseña, el sistema activa automáticamente el flag `mustChangePassword = true`, forzando al usuario a cambiarla en su próximo login.

**Eliminar usuario:**

- Diálogo de confirmación.
- **No se puede eliminar la propia cuenta** — el botón está deshabilitado para el usuario activo.

---

### 5.6 Enviar Informe por Correo — `/admin/send-report`

Flujo guiado de **4 pasos** para enviar el consolidado por correo electrónico.

**Paso 1 — Seleccionar destinatarios:**

- Lista de administradores del sistema con checkboxes (usuarios con rol admin/admin_readonly de la asociación).
- Lista de destinatarios externos configurados en la asociación (correos adicionales con nombre).
- Selección múltiple.

**Paso 2 — Seleccionar pastores:**

- Radio: "Todos los pastores" o "Pastores seleccionados".
- Si se elige selección individual: buscador + checkboxes para cada pastor.

**Paso 3 — Seleccionar periodo:**

- Selector de periodo (actual o anteriores).

**Paso 4 — Revisar y enviar:**

- Resumen: destinatarios seleccionados, pastores incluidos, periodo.
- Botón "Enviar" con indicador de progreso durante el envío.
- Notificación de éxito (con cantidad de correos enviados) o error descriptivo.

---

### 5.7 Configuración de la Asociación — `/admin/configuracion`

**Día de corte del periodo:**

- Control deslizante (slider) + campo numérico, rango configurable: 1 a 27.
- **Preview en tiempo real:** al mover el slider, se actualiza instantáneamente la visualización de qué fechas incluye el periodo.
- Validación: el máximo es 27 para garantizar compatibilidad con febrero (que tiene 28/29 días).

**Destinatarios externos de correo:**

| Acción | Detalle |
|--------|---------|
| Agregar destinatario | Modal: email válido + nombre (máx 255 chars) |
| Eliminar destinatario | Botón con ícono de basura |
| Buscar destinatarios | Filtro por nombre o email |

> Los destinatarios externos aparecen en el paso 1 de "Enviar Informe" y reciben el consolidado por correo junto con los administradores del sistema.

---

### 5.8 Informes de un Pastor (vista admin) — `/admin/pastor/:pastorId`

- Lista de todos los informes del pastor filtrada por mes/año.
- Indicador de cumplimiento del periodo.
- Navegación entre meses.
- Clic en una fecha navega al detalle del informe.

---

### 5.9 Detalle de Informe (vista admin) — `/admin/pastor/:pastorId/report/:fecha`

- Vista completa del informe del pastor para ese día.
- Un `admin` puede **editar cualquier periodo** (no está restringido al periodo actual como el pastor).
- Un `admin_readonly` solo puede ver, no editar.

---

## 6. Panel del Super Administrador

> Ruta base: `/super-admin/*` — Acceso exclusivo para rol `super_admin`

El super administrador tiene visibilidad sobre **todas las asociaciones de su unión**.

### 6.1 Dashboard de la Unión — `/super-admin`

- **4 tarjetas KPI** agregadas de toda la unión: Asociaciones, Pastores, Actividades, Horas.
- **Tarjetas por asociación:** nombre, país, cantidad de pastores, cantidad de actividades, horas, porcentaje de cumplimiento (coloreado).
- Navegación de periodos.
- Clic en una asociación navega a su detalle.

---

### 6.2 Listado de Asociaciones — `/super-admin/associations`

- Grid de tarjetas por asociación con: nombre, país, día de corte configurado.
- Buscador por nombre (filtro en tiempo real).
- Animaciones de entrada escalonadas (Motion library).
- Clic navega al detalle de la asociación.

---

### 6.3 Detalle de Asociación — `/super-admin/association/:associationId`

Vista profunda de una asociación específica desde la perspectiva de la unión.

**Layout de dos columnas:**

- **Columna izquierda — Lista de pastores:**
  - Badge con iniciales del pastor.
  - Nombre, distrito asignado.
  - Ícono de cumplimiento: `CheckCircle` verde si ≥ umbral, `AlertCircle` ámbar si no.
  - Clic navega a los informes del pastor.

- **Columna derecha — Gráfico de barras horizontales por categoría:**
  - Una barra por categoría de actividad.
  - Coloreada con el color de la categoría.
  - **Animación:** las barras se expanden de 0 al ancho calculado en 0.5 segundos con delay de 0.2 segundos (Motion).
  - Muestra el total de actividades por categoría.

- **4 tarjetas KPI:** Pastores, Informes, Actividades, Horas.
- Navegación de periodos.

---

### 6.4 Consolidado de la Unión — `/super-admin/consolidated`

- Agrega datos de **todas las asociaciones** de la unión.
- Tabla: nombre de asociación, pastores, actividades, horas, cumplimiento % (coloreado).
- Desglose por categorías y subcategorías a nivel de unión.
- **Exportar PDF** y **Exportar Excel** del consolidado de unión.

---

### 6.5 Informes de un Pastor (vista super admin) — `/super-admin/pastor/:pastorId`

- Calendario mensual del pastor con indicadores por día.
- Navegación entre meses.
- 3 tarjetas KPI: Días, Actividades, Horas.
- Lista de informes debajo del calendario con: fecha, cantidad de actividades, indicador de observaciones.
- Clic navega al detalle del informe (usa el mismo `AdminReportDetailPage` compartido).

---

## 7. Panel del Propietario (Owner)

> Ruta base: `/owner/*` — Acceso exclusivo para rol `owner`

El owner no gestiona datos pastorales. Su única función es **auditar el sistema**.

### 7.1 Registros de Auditoría — `/owner/audit-logs`

Tabla completa de **toda la actividad del sistema** registrada por el interceptor de auditoría.

**Columnas de la tabla:**

| Columna | Descripción |
|---------|-------------|
| Usuario | Nombre + ID del usuario que realizó la acción |
| Rol | Badge con color por rol (`RoleBadge`) |
| Tipo de evento | Badge: login (verde), login_failed (rojo), http_request (azul) |
| Acción | Método HTTP + ruta del endpoint |
| Estado | Código de respuesta HTTP: 2xx (verde), 4xx (amarillo), 5xx (rojo) |
| IP | Dirección IP del cliente (del header `x-forwarded-for` o socket) |
| Fecha/Hora | Timestamp exacto con timezone |

**Filtros disponibles:**

| Filtro | Tipo |
|--------|------|
| Tipo de evento | Dropdown: Todos / HTTP Requests / Logins exitosos / Logins fallidos |
| Desde (fecha) | Input date |
| Hasta (fecha) | Input date |
| ID de usuario | Campo de texto con botón "Aplicar" y botón "Limpiar" |

**Paginación:** 50 registros por página (máximo configurable hasta 100) con botones anterior/siguiente y contador de página.

**Skeleton de carga:** 8 filas × 7 columnas de placeholders animados mientras carga.

---

## 8. Sistema de Exportación

El sistema genera archivos de exportación profesionales tanto en PDF como en Excel para 3 niveles: pastor individual, asociación y unión.

### 8.1 Exportación PDF (jsPDF + jspdf-autotable)

**`exportPastorPDF()`**

- Encabezado: nombre del pastor, periodo (fechas de inicio y fin).
- Tabla de resumen: actividades totales, horas totales, transporte total COP, cumplimiento %.
- Desglose por categoría: tabla con subcategorías, cantidades y horas.
- Código de color en el texto según cumplimiento.

**`exportConsolidatedPDF()`** (asociación)

- Encabezado: nombre de la asociación, periodo.
- Tabla de resumen por pastor: nombre, actividades, horas, cumplimiento % (texto coloreado).
- Tabla de categorías con totales de la asociación.
- Colores: verde (≥70%), ámbar (40–69%), rojo (<40%).

**`exportUnionConsolidatedPDF()`** (unión)

- Encabezado: nombre de la unión.
- Tabla de asociaciones: nombre, pastores, actividades, horas, cumplimiento %.
- Totales agregados de la unión.

### 8.2 Exportación Excel (ExcelJS)

Todos los exports de Excel son **workbooks multi-hoja** con celdas coloreadas.

**`exportPastorExcel()`**

- Hoja 1 "Resumen": metadatos del pastor y totales del periodo.
- Hoja 2 "Actividades": desglose completo por subcategoría con celdas coloreadas.

**`exportConsolidatedExcel()`** (asociación)

- Hoja 1 "Resumen": KPIs de la asociación.
- Hoja 2 "Pastores": tabla de pastores con cumplimiento (celdas con fondo verde/ámbar/rojo).
- Hoja 3 "Actividades": desglose por categoría con totales.

**`exportUnionConsolidatedExcel()`** (unión)

- Hoja 1 "Resumen": KPIs de la unión.
- Hoja 2 "Asociaciones": tabla por asociación con cumplimiento coloreado.

**Colores de cumplimiento en Excel (valores RGB exactos):**

| Estado | RGB |
|--------|-----|
| Verde (≥ 70%) | `{r: 21, g: 128, b: 61}` |
| Ámbar (40–69%) | `{r: 217, g: 119, b: 6}` |
| Rojo (< 40%) | `{r: 220, g: 38, b: 38}` |

---

## 9. Categorías de Actividades

El sistema tiene **7 categorías principales** con **42+ subcategorías** predefinidas. Cada subcategoría tiene una **unidad de medida** específica (`cantidad`, `horas`, `veces`, `dias`, `noches`).

> Las categorías se cargan como catálogo semilla desde la base de datos. No son editables desde la UI (son datos maestros del sistema).

### Catálogo Completo

| # | Categoría | Color | Subcategorías y Unidad |
|---|-----------|-------|----------------------|
| 1 | **Predicación** | Azul `#1e40af` | Campañas (cantidad) · Estudios Bíblicos (horas) · Prédicas (cantidad) · Servicios Fúnebres (cantidad) |
| 2 | **Enseñanza** | Índigo `#4338ca` | Seminarios (días) · Congresos (días) · Discipulados (veces) · Clubes Juveniles (veces) · Juntas y Reuniones (veces) |
| 3 | **Servicio** | Rojo `#dc2626` | Consejería (horas) · Exposalud (cantidad) · Impacto a la Comunidad (veces) · Obra Social (veces) · Repartir Mercados (cantidad) |
| 4 | **Confraternidad** | Verde `#15803d` | Visitación (horas) · Grupos Pequeños (veces) · Recepción de Sábado (cantidad) · Integracionistas (veces) |
| 5 | **Adoración** | Naranja `#ea580c` | Estudio Personal (horas) · Vigilias (cantidad) · Ayunos (días) · Conciertos Musicales (cantidad) · Cena del Señor (cantidad) |
| 6 | **Reproducción** | Púrpura `#7c3aed` | Organizar Iglesia (cantidad) · Bautismos (cantidad) |
| 7 | **Transporte** | Gris `#475569` | Viajes (cantidad) + monto en COP |

### Manejo Especial de Transporte

La categoría Transporte tiene comportamiento único:

- Registra la **cantidad** de viajes/desplazamientos.
- Registra el **monto en COP** (combustible, peajes, etc.) — campo `amount`.
- Los totales de transporte se calculan y muestran separados en KPIs y consolidados.
- En exports, el monto de transporte aparece como ítem propio (no mezclado con otras actividades).

---

## 10. Lógica de Negocio y Reglas

### 10.1 Cálculo del Periodo de Reporte

Cada asociación configura su propio **día de corte** (1 a 27). Este día determina el periodo de reporte:

```
Inicio del periodo = (día_de_corte + 1) del mes anterior
Fin del periodo    = (día_de_corte) del mes actual
```

**Ejemplo con día de corte = 20:**

| Periodo | Inicio | Fin |
|---------|--------|-----|
| Junio | 21 de Mayo | 20 de Junio |
| Julio | 21 de Junio | 20 de Julio |

**¿Por qué máximo 27?** Para garantizar que el día de inicio (día_de_corte + 1) siempre exista en febrero (que tiene mínimo 28 días).

El backend calcula el periodo usando la zona horaria `America/Bogota` para todas las comparaciones de fechas.

---

### 10.2 Cálculo de Cumplimiento

```
cumplimiento = días_con_informe / días_transcurridos_en_periodo × 100
```

- Se calcula sobre los **días transcurridos** (no los días totales del periodo), dando una métrica justa en tiempo real.
- Se aplica a: dashboard de admin, listado de pastores, consolidados, exports.

**Umbrales:**

| Indicador | Condición | Color UI | RGB Export |
|-----------|-----------|----------|-----------|
| Verde (Satisfactorio) | ≥ 70% | `text-green-600` | `{r:21,g:128,b:61}` |
| Ámbar (Parcial) | ≥ 40% y < 70% | `text-amber-600` | `{r:217,g:119,b:6}` |
| Rojo (Insuficiente) | < 40% | `text-red-600` | `{r:220,g:38,b:38}` |

---

### 10.3 Reglas de Edición de Informes

| Condición | Puede editar |
|-----------|-------------|
| Día dentro del periodo actual | Sí |
| Día fuera del periodo (cerrado) | No (a menos que tenga excepción) |
| Flag `canEditAllReports = true` | Sí, cualquier periodo |
| Rol `admin` | Puede editar cualquier informe desde la vista admin |
| Rol `admin_readonly` | Solo lectura, sin edición |

La validación se hace **tanto en frontend** (UI con locks visuales) **como en backend** (el use case lanza `ForbiddenException` si la fecha está fuera del periodo permitido).

El backend usa **bloqueo pesimista** (`pessimistic_write`) en la transacción de guardar/actualizar informe para prevenir conflictos de concurrencia.

---

### 10.4 Validación de Actividades

Cada entrada de actividad registrada tiene los siguientes campos:

| Campo | Tipo | Obligatorio | Regla |
|-------|------|-------------|-------|
| `subcategoryId` | string | Sí | Debe ser una subcategoría válida del catálogo |
| `categoryId` | string | Sí | Debe ser una categoría válida del catálogo |
| `quantity` | number | Sí | Mínimo 0 |
| `hours` | number | No | Mínimo 0, solo si `hasHours = true` en la subcategoría |
| `amount` | number | No | Mínimo 0, solo para categoría Transporte |
| `description` | string | No | Texto libre descriptivo |
| `evidenceUrls` | string[] | No | URLs a fotos o documentos de evidencia |

Las actividades se almacenan como **array JSONB** en PostgreSQL — esto permite que el esquema sea flexible y evolucionable sin migraciones de columnas.

---

### 10.5 Protecciones de Integridad en Eliminación

| Entidad | Protección |
|---------|-----------|
| Distrito | No se puede eliminar si tiene iglesias o pastores asignados |
| Usuario | No se puede eliminar la propia cuenta |
| Usuario (owner) | Solo otro owner puede eliminarlo |
| Destinatario externo | Se valida que pertenezca a la misma asociación antes de eliminar |

---

## 11. API REST — Endpoints Completos

Base URL: `http://localhost:3000/api` (configurado por `VITE_BACKEND_URL`)

### Autenticación (`/auth`)

| Método | Ruta | Rol mínimo | Descripción |
|--------|------|-----------|-------------|
| `POST` | `/auth/login` | — | Login. Throttle: 5 req/min |
| `GET` | `/auth/me` | JWT válido | Perfil del usuario autenticado |
| `PATCH` | `/auth/me/password` | JWT válido | Cambiar propia contraseña → HTTP 204 |
| `GET` | `/auth/users` | `admin_readonly` | Listar usuarios (filtro por `associationId`, paginación) |
| `POST` | `/auth/users` | `admin` | Crear usuario |
| `PATCH` | `/auth/users/:id` | `admin` | Actualizar usuario |
| `DELETE` | `/auth/users/:id` | `admin` | Eliminar usuario |
| `GET` | `/auth/admin-recipients` | `admin` | Admins de una asociación (para selector de destinatarios) |

### Asociaciones (`/associations`)

| Método | Ruta | Rol mínimo | Descripción |
|--------|------|-----------|-------------|
| `GET` | `/associations` | JWT válido | Listar todas (filtro por `unionId`) |
| `POST` | `/associations` | `admin` | Crear asociación |
| `PATCH` | `/associations/my/deadline` | `admin` | Actualizar día de corte de la propia asociación |
| `PATCH` | `/associations/:id` | `admin` | Actualizar asociación |
| `GET` | `/associations/:id/extra-recipients` | `admin` | Listar destinatarios externos |
| `POST` | `/associations/:id/extra-recipients` | `admin` | Agregar destinatario externo |
| `DELETE` | `/associations/:id/extra-recipients/:rid` | `admin` | Eliminar destinatario externo |

### Distritos (`/districts`)

| Método | Ruta | Rol mínimo | Descripción |
|--------|------|-----------|-------------|
| `GET` | `/districts` | — | Listar distritos (filtro por `associationId`) |
| `POST` | `/districts` | `admin` | Crear distrito |
| `PATCH` | `/districts/:id` | `admin` | Actualizar nombre del distrito |
| `DELETE` | `/districts/:id` | `admin` | Eliminar (falla si tiene dependencias) |

### Iglesias (`/churches`)

| Método | Ruta | Rol mínimo | Descripción |
|--------|------|-----------|-------------|
| `GET` | `/churches` | — | Listar (filtro por `districtId` o `associationId`) |
| `POST` | `/churches` | `admin` | Crear iglesia |
| `PATCH` | `/churches/:id` | `admin` | Actualizar nombre y dirección |
| `PATCH` | `/churches/:id/move` | `admin` | Mover a otro distrito |
| `DELETE` | `/churches/:id` | `admin` | Eliminar iglesia |

### Uniones (`/unions`)

| Método | Ruta | Rol mínimo | Descripción |
|--------|------|-----------|-------------|
| `GET` | `/unions` | — | Listar todas las uniones |
| `POST` | `/unions` | `super_admin` | Crear unión |
| `PATCH` | `/unions/:id` | `super_admin` | Actualizar unión |

### Informes Diarios (`/daily-reports`)

| Método | Ruta | Rol mínimo | Descripción |
|--------|------|-----------|-------------|
| `POST` | `/daily-reports` | `pastor` | Crear o actualizar informe (upsert por pastorId + fecha) |
| `GET` | `/daily-reports/pastor/:pastorId` | JWT válido | Informes del pastor (filtro por `month` y `year`) |
| `GET` | `/daily-reports/pastor/:pastorId/date/:date` | JWT válido | Informe de un día específico (YYYY-MM-DD) |
| `DELETE` | `/daily-reports/:id` | `pastor` | Eliminar informe (solo periodo actual) |

### Consolidados (`/consolidated`)

| Método | Ruta | Rol mínimo | Descripción |
|--------|------|-----------|-------------|
| `GET` | `/consolidated/pastor/:pastorId` | JWT válido | Consolidado personal (`periodOffset`: 0=actual, -1=anterior...) |
| `GET` | `/consolidated/association/:associationId` | `admin_readonly` | Consolidado de asociación |
| `GET` | `/consolidated/custom` | `admin_readonly` | Consolidado de pastores seleccionados (`pastorIds` separados por coma) |
| `GET` | `/consolidated/union/:unionId` | `super_admin` | Consolidado de unión |
| `POST` | `/consolidated/send-report` | `admin` | Enviar consolidado por correo con adjuntos Excel |

### Categorías de Actividades (`/activity-categories`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/activity-categories` | Catálogo completo (público, sin autenticación) |

### Registros de Auditoría (`/audit-logs`)

| Método | Ruta | Rol mínimo | Descripción |
|--------|------|-----------|-------------|
| `GET` | `/audit-logs` | `owner` | Logs paginados con filtros (userId, eventType, from, to) |

---

## 12. Modelo de Datos

### `users` — Usuarios del sistema

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Generado por `gen_random_uuid()` |
| `name` | varchar(100) | Nombre completo |
| `email` | varchar(150) UNIQUE | Email (índice único) |
| `role` | varchar(20) | Enum: pastor / admin_readonly / admin / super_admin / owner |
| `passwordHash` | varchar(255) | Hash bcrypt-12, nunca texto plano |
| `associationId` | UUID (FK, nullable) | Asociación a la que pertenece |
| `districtId` | UUID (FK, nullable) | Distrito asignado (pastores) |
| `unionId` | UUID (FK, nullable) | Unión (super_admin) |
| `position` | varchar(30) | Cargo (ej: "Pastor Distrital") |
| `phone` | varchar(20) | Teléfono de contacto |
| `mustChangePassword` | boolean (default: true) | Flag de primer login |
| `canEditAllReports` | boolean (default: false) | Excepción de edición sin restricción de periodo |
| `createdAt` | timestamp | Fecha de creación |

### `daily_reports` — Informes diarios

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | |
| `pastorId` | UUID (FK, INDEXED) | Pastor autor del informe |
| `date` | DATE (INDEXED) | Fecha del informe (YYYY-MM-DD) |
| `activities` | JSONB (default: []) | Array de `ActivityEntry[]` |
| `observations` | TEXT | Notas generales del día |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

> **Constraint UNIQUE** en `(pastorId, date)` — solo puede existir un informe por pastor por día.

**Estructura de cada `ActivityEntry` dentro del JSONB:**

```typescript
{
  subcategoryId: string    // ID de la subcategoría
  categoryId: string       // ID de la categoría padre
  description?: string     // Texto descriptivo
  quantity: number         // Cantidad (≥ 0)
  hours?: number           // Horas (≥ 0, si hasHours = true)
  amount?: number          // Monto COP (≥ 0, solo transporte)
  evidenceUrls?: string[]  // URLs de evidencia fotográfica
}
```

### `activity_categories` — Catálogo de actividades

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | varchar(50) (PK) | Identificador string (ej: `"predicacion"`) |
| `name` | varchar(100) | Nombre para mostrar |
| `color` | varchar(20) | Color del texto (hex) |
| `bgColor` | varchar(20) | Color de fondo (hex) |
| `borderColor` | varchar(20) | Color de borde (hex) |
| `subcategories` | JSONB | Array de `SubCategory[]` |
| `sortOrder` | int | Orden de visualización |

### `associations` — Asociaciones

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | |
| `name` | varchar(200) | Nombre de la asociación |
| `unionId` | UUID (FK) | Unión padre |
| `country` | varchar(100) | País |
| `reportDeadlineDay` | int (default: 20) | Día de corte (1–27) |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### `association_extra_recipients` — Destinatarios externos de correo

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | |
| `associationId` | UUID (FK) | Asociación propietaria |
| `email` | varchar(255) | Email del destinatario externo |
| `name` | varchar(255) | Nombre del destinatario |
| `createdAt` | timestamp | |

> **Constraint UNIQUE** en `(associationId, email)` — no se pueden repetir emails por asociación.

### `districts` — Distritos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | |
| `name` | varchar(200) | Nombre del distrito |
| `associationId` | UUID (FK) | Asociación propietaria |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### `churches` — Iglesias

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | |
| `name` | varchar(200) | Nombre de la iglesia |
| `address` | varchar(300) (nullable) | Dirección física |
| `districtId` | UUID (FK) | Distrito al que pertenece |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### `unions` — Uniones

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | |
| `name` | varchar(200) | Nombre de la unión |
| `country` | varchar(100) | País |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### `audit_logs` — Registros de auditoría

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | |
| `userId` | varchar(36) [INDEXED] | ID del usuario que realizó la acción |
| `userName` | varchar(150) | Nombre del usuario en el momento del evento |
| `userRole` | varchar(30) | Rol del usuario |
| `httpMethod` | varchar(10) | GET / POST / PATCH / DELETE |
| `endpoint` | varchar(500) | URL completa del endpoint |
| `ipAddress` | varchar(45) | IP del cliente (soporta IPv6) |
| `statusCode` | int | Código HTTP de respuesta |
| `eventType` | varchar(30) [INDEXED] | `http_request` / `login` / `login_failed` |
| `createdAt` | timestamptz [INDEXED] | Timestamp con timezone |

---

## 13. Servicio de Correo Electrónico

### Proveedor: Resend

El sistema usa **Resend** como proveedor de email transaccional.

**Variables de entorno requeridas:**

- `RESEND_API_KEY` — Clave de API de Resend
- `MAIL_FROM` — Dirección de remitente

**Feature Flag:** `EMAIL_ENABLED_DEFAULT = false` — el email está deshabilitado por defecto y debe habilitarse explícitamente en la configuración.

### ¿Qué se envía?

Cuando un administrador ejecuta "Enviar Informe por Correo":

1. **Se genera un Excel consolidado de la asociación** (con las 3 hojas) como Buffer en memoria.
2. **Se genera un Excel individual por cada pastor** incluido en el envío.
3. **Se compila una plantilla Handlebars** (`consolidated-report.hbs`) con el nombre del destinatario y el logo de la organización.
4. Se envía un correo a cada destinatario con:
   - El cuerpo HTML renderizado de la plantilla.
   - Los archivos Excel como adjuntos.
5. El sistema registra en consola cada envío individual y un resumen del batch.

### Respuesta del API

El endpoint `POST /consolidated/send-report` retorna:

```json
{
  "sent": 5,
  "recipients": ["correo1@ejemplo.com", "correo2@ejemplo.com", "..."]
}
```

---

## 14. Auditoría del Sistema

### Cómo Funciona el Interceptor de Auditoría

El backend implementa un **interceptor asíncrono** (`AsyncAuditInterceptor`) que se ejecuta después de cada respuesta HTTP.

**Roles auditados:** Solo `admin_readonly`, `admin` y `super_admin`. Las acciones de pastores y owners no se registran en la tabla de auditoría (el pastor es el usuario operativo, y el owner solo lee).

**Flujo:**

1. La request llega y el interceptor la "envuelve".
2. La respuesta es procesada y devuelta al cliente.
3. **De forma asíncrona** (via `setImmediate`), se encola una entrada en el `AuditLogBuffer`.
4. El buffer hace un swap atómico del array en memoria y hace un `INSERT` batch a PostgreSQL.
5. En `OnModuleDestroy` (shutdown), el buffer vacía cualquier entrada pendiente.

Este diseño garantiza que el logging **no bloquea ni ralentiza** la respuesta al usuario.

**Login fallido:** El evento `login_failed` lo registra directamente el `LoginUseCase`, no el interceptor (porque el request falla antes de que el interceptor pueda capturar el userId).

### Datos Capturados por Evento

- Quién: userId, userName, userRole
- Qué: httpMethod, endpoint
- Desde dónde: ipAddress (del header `x-forwarded-for` o del socket)
- Resultado: statusCode
- Tipo: eventType
- Cuándo: createdAt (timestamptz)

---

## 15. Detalles Técnicos Destacados

### Backend

| Aspecto | Detalle |
|---------|---------|
| **IDs** | UUIDs v4 generados por PostgreSQL (`gen_random_uuid()`), no por la aplicación |
| **Almacenamiento de actividades** | JSONB en PostgreSQL — esquema flexible sin migraciones de columnas |
| **Índices de BD** | En `pastorId`, `date` (daily_reports), `userId`, `createdAt`, `eventType` (audit_logs) |
| **Bloqueo pesimista** | `SELECT ... FOR UPDATE` en la transacción de guardar informes, evita doble-guardado concurrente |
| **Validación** | `class-validator` en todos los DTOs + `ParseUUIDPipe` en parámetros de ruta |
| **ESM** | Todos los imports internos usan extensión `.js` (compatibilidad ESM en TypeScript) |
| **bcrypt** | 12 rondas (~300ms por hash) — estándar hardened |
| **JWT** | Expiración 7 días, payload mínimo, validado por Passport en cada request protegido |
| **Rate limiting** | 30 req/min global + 5 req/min en login, aplicado con `ThrottlerGuard` como `APP_GUARD` |
| **Zona horaria** | `America/Bogota` para todo cálculo de periodos y fechas de corte |
| **Email** | Resend como proveedor, templates Handlebars, adjuntos Excel generados in-memory |
| **Arquitectura** | Clean Architecture: Domain → Application (Use Cases) → Infrastructure → Presentation |

### Frontend

| Aspecto | Detalle |
|---------|---------|
| **Framework** | React 19.2.3 con React Router 7.6.1 |
| **Data fetching** | TanStack Query v5 — caché, background refetch, invalidación por mutación |
| **Estado global** | Solo `AuthContext` (JWT + usuario) en `localStorage`. Sin Redux/Zustand |
| **Animaciones** | Motion library — entrada/salida de elementos, barras de gráficos, modales |
| **Notificaciones** | Sonner — toasts en esquina superior derecha con `richColors` y `closeButton` |
| **Tema** | Light / System / Dark — persistido en `localStorage`, respeta preferencia del sistema |
| **Colores por rol** | super_admin=purple, admin=indigo, admin_readonly=sky, pastor=teal, owner=amber |
| **Safe area** | Padding dinámico `safe-area-inset-top` para soporte de Dynamic Island en iOS |
| **Mobile** | Sidebar colapsable en móvil con backdrop y animaciones de slide-down |
| **Path alias** | `@/` mapea a `src/` (Vite + TypeScript) |
| **Error boundary** | `ErrorBoundary` de clase envuelve toda la app, captura errores de render |
| **HTTP adapter** | `FetchHttpAdapter` centraliza todos los fetch — maneja 401 (limpia storage + redirect /login) y errores HTTP |
| **Skeleton UI** | 8 variantes de skeleton: StatCard, List, BarChart, Calendar, Table, Detail, etc. |

### Dependencias Principales (versiones exactas)

**Frontend:**

| Librería | Versión | Uso |
|----------|---------|-----|
| React | 19.2.3 | Framework UI |
| React Router | 7.6.1 | Enrutamiento con rutas protegidas por rol |
| TanStack Query | 5.90.21 | Data fetching, caché, mutations |
| jsPDF | 2.5.2 | Generación de PDFs |
| jspdf-autotable | 5.2.1 | Tablas en PDFs |
| ExcelJS | 4.4.0 | Generación de Excel multi-hoja con colores |
| Motion | — | Animaciones declarativas |
| Recharts | — | Gráficos (en vistas de detalle) |
| Sonner | — | Toast notifications |
| Lucide React | — | Iconografía SVG |
| TailwindCSS | 4 | Estilos utilitarios |

**Backend:**

| Librería | Versión | Uso |
|----------|---------|-----|
| NestJS | — | Framework HTTP, DI, guards, interceptors |
| TypeORM | — | ORM, transacciones, JSONB |
| Passport JWT | — | Estrategia de autenticación JWT |
| bcrypt | — | Hashing de contraseñas (12 rondas) |
| class-validator | — | Validación de DTOs |
| @nestjs/throttler | — | Rate limiting |
| Resend | — | Envío de correos transaccionales |
| ExcelJS | — | Generación de Excel en servidor |
| Handlebars | — | Templates de correo HTML |

---

## Estadísticas del Sistema

| Categoría | Cantidad |
|-----------|---------|
| Módulos backend | 8 |
| Endpoints REST | 45+ |
| Tablas en base de datos | 9 |
| Páginas frontend | 22 |
| Rutas (React Router) | 35+ |
| Roles de usuario | 5 |
| Categorías de actividad | 7 |
| Subcategorías de actividad | 42+ |
| Tipos de unidad de medida | 5 (cantidad, horas, veces, días, noches) |
| Tipos de export | 6 (3 niveles × 2 formatos) |
| Rondas de bcrypt | 12 |
| Expiración del JWT | 7 días |
| Rate limit login | 5 req/min |
| Umbral cumplimiento verde | ≥ 70% |
| Umbral cumplimiento ámbar | ≥ 40% |
| Día de corte por defecto | 20 |
| Rango de día de corte | 1 a 27 |

---

*Documentación generada el 28 de abril de 2026. Última actualización: 29 de abril de 2026 — Email editable en gestión de usuarios.*
