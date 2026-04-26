# UX: Tooltips y feedback visual

**Fecha:** 2026-04-24
**Branch:** feature/must-change-password

---

## Problema

Los usuarios (pastores) no recibían retroalimentación visual en dos escenarios principales:

1. **Calendario:** Clicar un día sin informe en periodo cerrado no hacía nada, pero el cursor y el hover indicaban que era interactivo.
2. **Botones de exportar:** Se deshabilitaban con `opacity-50` sin explicación de por qué.

---

## Solución implementada

### Nuevo componente `Tooltip`

`src/components/atoms/Tooltip.tsx`

Componente reutilizable basado en CSS/Tailwind puro (sin dependencias adicionales).

```tsx
<Tooltip content="Texto explicativo" side="top | bottom">
  <button ...>...</button>
</Tooltip>
```

- Usa `group/tt` (scope nombrado de Tailwind) para no interferir con otros `group` del DOM.
- Soporta posición `top` (por defecto) y `bottom`.
- Compatible con dark mode.
- No interfiere con eventos del hijo (`pointer-events-none` en la capa del tooltip).

---

### Calendario — `PastorCalendarPage.tsx`

Cada celda del calendario ahora comunica su estado de forma clara.

#### Estados y su representación visual

| Estado | Cursor | Opacidad | Icono (desktop) | `title` (tooltip nativo) |
|---|---|---|---|---|
| Fecha futura | `cursor-default` | 30% | — | "Fecha futura" |
| Periodo cerrado, sin informe | `cursor-default` | 40% | — | "Sin informe · Periodo cerrado" |
| Periodo cerrado, con informe | `cursor-pointer` | 100% | `Lock` gris | "Ver informe (solo lectura)" |
| Editable, con informe | `cursor-pointer` | 100% | `PenLine` teal | "Editar informe" |
| Editable, sin informe | `cursor-pointer` | 100% | `Plus` teal | "Crear informe" |

#### Cambios en la leyenda

Se expandió la leyenda inferior del calendario para incluir los tres nuevos iconos:
- `PenLine` teal → Editable
- `Plus` teal → Crear informe
- `Lock` gris → Solo lectura

Los iconos solo se muestran en desktop (`hidden sm:flex`).

---

### Botones de exportar

**Archivos:** `AdminConsolidatedPage.tsx`, `SuperAdminConsolidatedPage.tsx`

Los botones PDF y Excel ahora muestran un tooltip explicativo:

- Cuando hay datos: `"Exportar como PDF"` / `"Exportar como Excel"`
- Cuando no hay datos: `"Sin datos para exportar"`

Además se agregó `disabled:cursor-not-allowed` a su `className` (faltaba en estos botones; el componente `Button` base ya lo tenía).

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/components/atoms/Tooltip.tsx` | **Nuevo** — componente reutilizable |
| `src/pages/pastor/PastorCalendarPage.tsx` | Iconos de estado, cursor, opacidad, title, leyenda |
| `src/pages/admin/AdminConsolidatedPage.tsx` | Tooltip en botones PDF/Excel |
| `src/pages/super-admin/SuperAdminConsolidatedPage.tsx` | Tooltip en botones PDF/Excel |

---

## Uso del componente Tooltip

```tsx
import { Tooltip } from '@/components/atoms/Tooltip';

// Tooltip arriba (por defecto)
<Tooltip content="Guardar cambios">
  <button>Guardar</button>
</Tooltip>

// Tooltip abajo
<Tooltip content="Sin datos para exportar" side="bottom">
  <button disabled>PDF</button>
</Tooltip>
```

> **Nota:** El tooltip es solo hover (desktop). En mobile el atributo `title` del HTML
> sirve como alternativa de accesibilidad en calendarios; los botones de exportar
> siempre tienen texto visible que describe su acción.
