import type {
  AssociationConsolidatedResponse,
  UnionConsolidatedResponse,
  ConsolidatedResponse,
} from '@/features/consolidated/domain/entities/consolidated';
import { EXPORT_BRAND, COMPLIANCE_THRESHOLD } from '@/constants/shared';

// ---------------------------------------------------------------------------
// Tipos auxiliares
// ---------------------------------------------------------------------------

type RGB = [number, number, number];

interface PdfLib {
  jsPDF: typeof import('jspdf')['jsPDF'];
  autoTable: typeof import('jspdf-autotable')['default'];
}

// ---------------------------------------------------------------------------
// Carga dinámica de librerías
// ---------------------------------------------------------------------------

async function loadPdf(): Promise<PdfLib> {
  try {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    return { jsPDF, autoTable };
  } catch {
    throw new Error('No se pudieron cargar las librerías de exportación PDF');
  }
}

async function loadExcel() {
  try {
    const ExcelJS = await import('exceljs');
    return ExcelJS.default ?? ExcelJS;
  } catch {
    throw new Error('No se pudo cargar la librería de exportación Excel');
  }
}

// ---------------------------------------------------------------------------
// Helpers PDF
// ---------------------------------------------------------------------------

const C = EXPORT_BRAND.pdf;
const PAGE_W = 210;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

/** Encabezado de página con franja de color y título */
function drawHeader(
  doc: InstanceType<typeof import('jspdf')['jsPDF']>,
  title: string,
  subtitle: string,
  accentColor: RGB,
) {
  doc.setFillColor(...accentColor);
  doc.rect(0, 0, PAGE_W, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...C.white);
  doc.text(title, MARGIN, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(subtitle, MARGIN, 22);
  doc.setTextColor(...C.textDark);
}

/** Línea delgada de separación */
function drawRule(
  doc: InstanceType<typeof import('jspdf')['jsPDF']>,
  y: number,
  color: RGB = C.border,
) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
}

/** Fila de tarjetas KPI */
function drawKpiRow(
  doc: InstanceType<typeof import('jspdf')['jsPDF']>,
  y: number,
  items: { label: string; value: string }[],
) {
  const cardW = CONTENT_W / items.length;
  items.forEach((item, i) => {
    const x = MARGIN + i * cardW;
    doc.setFillColor(...C.rowAlt);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + 1, y, cardW - 2, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...C.teal);
    doc.text(item.value, x + cardW / 2, y + 9, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.textMid);
    doc.text(item.label.toUpperCase(), x + cardW / 2, y + 15, { align: 'center' });
  });
  doc.setTextColor(...C.textDark);
}

/** Pie de página: número de página + nombre del sistema */
function addPageFooters(
  doc: InstanceType<typeof import('jspdf')['jsPDF']>,
  monthLabel: string,
) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    drawRule(doc, pageH - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.textMid);
    doc.text(`Periodo: ${monthLabel}`, MARGIN, pageH - 7);
    doc.text(
      `Página ${i} de ${totalPages}  ·  ${EXPORT_BRAND.name}`,
      PAGE_W - MARGIN,
      pageH - 7,
      { align: 'right' },
    );
  }
}

/** Color de celda para porcentaje de cumplimiento */
function complianceCellStyle(pct: number) {
  const t = COMPLIANCE_THRESHOLD;
  if (pct >= t) return { fillColor: C.green.bg, textColor: C.green.text };
  if (pct >= 40)  return { fillColor: C.amber.bg, textColor: C.amber.text };
  return              { fillColor: C.red.bg,   textColor: C.red.text };
}

/** Cabecera de sección con bullet de color */
function drawSectionHeader(
  doc: InstanceType<typeof import('jspdf')['jsPDF']>,
  label: string,
  y: number,
  bulletColor: RGB,
) {
  doc.setFillColor(...bulletColor);
  doc.rect(MARGIN, y - 3, 3, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.textDark);
  doc.text(label, MARGIN + 5, y);
  drawRule(doc, y + 2, C.border);
}

// Acceso al finalY del last autoTable
function lastY(doc: object): number {
  return (doc as Record<string, Record<string, number>>).lastAutoTable?.finalY ?? 0;
}

// ---------------------------------------------------------------------------
// Helpers Excel (ExcelJS)
// ---------------------------------------------------------------------------

const E = EXPORT_BRAND.excel;

type Workbook = import('exceljs').Workbook;
type Worksheet = import('exceljs').Worksheet;

function xlFill(argb: string) {
  return { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb } };
}

function xlFont(opts: { bold?: boolean; size?: number; color?: string; name?: string }) {
  return {
    name: opts.name ?? 'Calibri',
    bold: opts.bold ?? false,
    size: opts.size ?? 11,
    color: { argb: opts.color ?? 'FF1E293B' },
  };
}

function xlBorder(color: string = E.border) {
  const side = { style: 'thin' as const, color: { argb: color } };
  return { top: side, left: side, bottom: side, right: side };
}

/** Encabezado de hoja: fila 1 mergeada con título */
function xlSheetHeader(
  ws: Worksheet,
  title: string,
  cols: number,
  accentArgb: string,
) {
  ws.mergeCells(1, 1, 1, cols);
  const cell = ws.getCell(1, 1);
  cell.value = title;
  cell.fill = xlFill(accentArgb);
  cell.font = xlFont({ bold: true, size: 13, color: E.white });
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;
}

/** Fila de encabezados de columna */
function xlColHeaders(ws: Worksheet, row: number, headers: string[], accentArgb: string) {
  headers.forEach((h, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = h;
    cell.fill = xlFill(accentArgb);
    cell.font = xlFont({ bold: true, size: 10, color: E.white });
    cell.border = xlBorder(accentArgb);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  ws.getRow(row).height = 20;
}

/** Aplica ancho a las columnas */
function xlSetColWidths(ws: Worksheet, widths: number[]) {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

/** Celda de dato estándar */
function xlDataCell(
  ws: Worksheet,
  row: number,
  col: number,
  value: string | number,
  opts: { bold?: boolean; align?: 'left' | 'center' | 'right'; fillArgb?: string; textArgb?: string } = {},
) {
  const cell = ws.getCell(row, col);
  cell.value = value;
  cell.font = xlFont({ bold: opts.bold, color: opts.textArgb });
  cell.fill = xlFill(opts.fillArgb ?? (row % 2 === 0 ? E.rowAlt : E.white));
  cell.border = xlBorder();
  cell.alignment = { horizontal: opts.align ?? 'left', vertical: 'middle' };
}

/** Color de celda de cumplimiento */
function xlComplianceFill(pct: number): { bg: string; text: string } {
  if (pct >= COMPLIANCE_THRESHOLD) return E.green;
  if (pct >= 40) return E.amber;
  return E.red;
}

// ---------------------------------------------------------------------------
// 1. PDF — Consolidado de Asociación
// ---------------------------------------------------------------------------

export async function exportConsolidatedPDF(
  data: AssociationConsolidatedResponse,
  monthLabel: string,
) {
  const { jsPDF, autoTable } = await loadPdf();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Encabezado
  drawHeader(doc, 'Consolidado Pastoral', `${monthLabel}  ·  Generado el ${formatDate(new Date())}`, C.teal);

  // KPIs
  const totalPastors = data.pastorSummaries.length;
  const totalActivities = data.totals.totalActivities;
  const totalHours = data.totals.totalHours;
  const avgCompliance = totalPastors > 0
    ? data.pastorSummaries.reduce((s, p) => s + p.compliance, 0) / totalPastors
    : 0;
  const totalTransport = data.totalTransportAmount;

  drawKpiRow(doc, 34, [
    { label: 'Pastores',     value: String(totalPastors) },
    { label: 'Actividades',  value: String(totalActivities) },
    { label: 'Horas',        value: totalHours.toFixed(0) },
    { label: 'Cumplimiento', value: `${Math.round(avgCompliance * 100)}%` },
    { label: 'Transporte',   value: formatCurrency(totalTransport) },
  ]);

  // Tabla de pastores ordenada por cumplimiento desc
  const sortedPastors = [...data.pastorSummaries].sort((a, b) => b.compliance - a.compliance);

  autoTable(doc, {
    startY: 56,
    head: [['Pastor', 'Posición', 'Distrito', 'Informes', 'Actividades', 'Horas', 'Transporte', 'Cumplim.']],
    body: sortedPastors.map((p) => {
      const pct = Math.round(p.compliance * 100);
      return [
        p.pastorName,
        p.position || '—',
        p.districtName || '—',
        String(p.totalReports),
        String(p.totalActivities),
        p.totalHours.toFixed(1),
        formatCurrency(p.totalTransportAmount),
        `${pct}%`,
      ];
    }),
    theme: 'grid',
    headStyles: {
      fillColor: C.tealDark,
      textColor: C.white,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: { fontSize: 7.5, textColor: C.textDark },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 28 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 14, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 16, halign: 'center' },
    },
    didParseCell(data) {
      if (data.column.index === 7 && data.section === 'body') {
        const pct = parseInt(data.cell.raw as string, 10);
        const s = complianceCellStyle(pct);
        data.cell.styles.fillColor = s.fillColor;
        data.cell.styles.textColor = s.textColor;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  let startY = lastY(doc) + 12;

  // Secciones por categoría
  for (const cat of data.categories) {
    const subRows = cat.subcategories
      .filter((s) => s.totalQuantity > 0)
      .map((s) => [
        s.subcategoryName,
        s.unit,
        String(s.totalQuantity),
        s.totalHours > 0 ? s.totalHours.toFixed(1) : '—',
        s.totalAmount > 0 ? formatCurrency(s.totalAmount) : '—',
      ]);

    if (subRows.length === 0) continue;

    if (startY > 255) {
      doc.addPage();
      startY = 18;
    }

    const bulletRgb = hexToRgb(cat.color) ?? C.teal;
    drawSectionHeader(doc, cat.categoryName, startY, bulletRgb);
    startY += 6;

    autoTable(doc, {
      startY,
      head: [['Subcategoría', 'Unidad', 'Cantidad', 'Horas', 'Monto']],
      body: subRows,
      theme: 'grid',
      headStyles: {
        fillColor: bulletRgb,
        textColor: C.white,
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
      },
      bodyStyles: { fontSize: 7, textColor: C.textDark },
      alternateRowStyles: { fillColor: C.rowAlt },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 26, halign: 'right' },
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    startY = lastY(doc) + 8;
  }

  addPageFooters(doc, monthLabel);
  doc.save(`consolidado_${monthLabel.replace(/\s/g, '_')}.pdf`);
}

// ---------------------------------------------------------------------------
// 2. PDF — Consolidado de Unión
// ---------------------------------------------------------------------------

export async function exportUnionConsolidatedPDF(
  data: UnionConsolidatedResponse,
  monthLabel: string,
  unionName: string,
) {
  const { jsPDF, autoTable } = await loadPdf();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  drawHeader(
    doc,
    `Consolidado de Unión — ${unionName}`,
    `${monthLabel}  ·  Generado el ${formatDate(new Date())}`,
    C.purple,
  );

  drawKpiRow(doc, 34, [
    { label: 'Asociaciones',   value: String(data.totalAssociations) },
    { label: 'Pastores',       value: String(data.totalPastors) },
    { label: 'Actividades',    value: String(data.totalActivities) },
    { label: 'Horas',          value: data.totalHours.toFixed(0) },
    { label: 'Cumpl. prom.',   value: `${Math.round(data.avgCompliance * 100)}%` },
  ]);

  const rows = data.associationSummaries.map((a) => {
    const pct = Math.round(a.avgCompliance * 100);
    return [a.associationName, String(a.totalPastors), String(a.totalActivities), a.totalHours.toFixed(0), `${pct}%`];
  });

  // Fila de totales
  const totalPct = Math.round(data.avgCompliance * 100);
  rows.push([
    'TOTAL',
    String(data.totalPastors),
    String(data.totalActivities),
    data.totalHours.toFixed(0),
    `${totalPct}%`,
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['Asociación', 'Pastores', 'Actividades', 'Horas', 'Cumplimiento']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: C.purpleDark, textColor: C.white, fontStyle: 'bold', fontSize: 9, halign: 'center' },
    bodyStyles: { fontSize: 8, textColor: C.textDark },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 24, halign: 'center' },
    },
    didParseCell(data) {
      const isLastRow = data.row.index === rows.length - 1;
      if (data.section === 'body' && isLastRow) {
        data.cell.styles.fillColor = C.slate;
        data.cell.styles.textColor = C.white;
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 4 && data.section === 'body' && !isLastRow) {
        const pct = parseInt(data.cell.raw as string, 10);
        const s = complianceCellStyle(pct);
        data.cell.styles.fillColor = s.fillColor;
        data.cell.styles.textColor = s.textColor;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  addPageFooters(doc, monthLabel);
  doc.save(`consolidado_union_${monthLabel.replace(/\s/g, '_')}.pdf`);
}

// ---------------------------------------------------------------------------
// 3. PDF — Consolidado personal del pastor
// ---------------------------------------------------------------------------

export async function exportPastorPDF(
  data: ConsolidatedResponse,
  monthLabel: string,
  pastorName: string,
  position?: string | null,
) {
  const { jsPDF, autoTable } = await loadPdf();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const subtitle = position
    ? `${pastorName} · ${position}  ·  ${monthLabel}  ·  Generado el ${formatDate(new Date())}`
    : `${pastorName}  ·  ${monthLabel}  ·  Generado el ${formatDate(new Date())}`;

  drawHeader(doc, 'Mi Consolidado Mensual', subtitle, C.teal);

  const compliance = Math.round(data.compliance * 100);
  drawKpiRow(doc, 34, [
    { label: 'Días reportados',  value: `${data.daysWithReports}/${data.daysInPeriod}` },
    { label: 'Actividades',      value: String(data.totals.totalActivities) },
    { label: 'Horas',            value: data.totals.totalHours.toFixed(1) },
    { label: 'Cumplimiento',     value: `${compliance}%` },
    { label: 'Transporte',       value: formatCurrency(data.totalTransportAmount) },
  ]);

  let startY = 56;

  for (const cat of data.categories) {
    const subRows = cat.subcategories
      .filter((s) => s.totalQuantity > 0)
      .map((s) => [
        s.subcategoryName,
        s.unit,
        String(s.totalQuantity),
        s.totalHours > 0 ? s.totalHours.toFixed(1) : '—',
        s.totalAmount > 0 ? formatCurrency(s.totalAmount) : '—',
      ]);

    if (subRows.length === 0) continue;
    if (startY > 255) { doc.addPage(); startY = 18; }

    const bulletRgb = hexToRgb(cat.color) ?? C.teal;
    drawSectionHeader(doc, cat.categoryName, startY, bulletRgb);
    startY += 6;

    autoTable(doc, {
      startY,
      head: [['Subcategoría', 'Unidad', 'Cantidad', 'Horas', 'Monto']],
      body: subRows,
      theme: 'grid',
      headStyles: { fillColor: bulletRgb, textColor: C.white, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
      bodyStyles: { fontSize: 7.5, textColor: C.textDark },
      alternateRowStyles: { fillColor: C.rowAlt },
      columnStyles: {
        0: { cellWidth: 64 },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 24, halign: 'right' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 26, halign: 'right' },
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    startY = lastY(doc) + 8;
  }

  addPageFooters(doc, monthLabel);
  doc.save(`mi_consolidado_${pastorName.replace(/\s/g, '_')}_${monthLabel.replace(/\s/g, '_')}.pdf`);
}

// ---------------------------------------------------------------------------
// 4. Excel — Consolidado de Asociación
// ---------------------------------------------------------------------------

export async function exportConsolidatedExcel(
  data: AssociationConsolidatedResponse,
  monthLabel: string,
) {
  const ExcelJS = await loadExcel();
  const wb: Workbook = new ExcelJS.Workbook();
  wb.creator = EXPORT_BRAND.name;
  wb.created = new Date();

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────────
  const wsResumen = wb.addWorksheet('Resumen');
  xlSetColWidths(wsResumen, [28, 20]);
  xlSheetHeader(wsResumen, `Consolidado Pastoral — ${monthLabel}`, 2, E.teal);

  const avgCompliance = data.pastorSummaries.length > 0
    ? data.pastorSummaries.reduce((s, p) => s + p.compliance, 0) / data.pastorSummaries.length
    : 0;

  const resumenRows: [string, string | number][] = [
    ['Periodo', monthLabel],
    ['Total pastores', data.pastorSummaries.length],
    ['Total actividades', data.totals.totalActivities],
    ['Total horas', Number(data.totals.totalHours.toFixed(1))],
    ['Cumplimiento promedio', `${Math.round(avgCompliance * 100)}%`],
    ['Total transporte', formatCurrency(data.totalTransportAmount)],
    ['Generado el', formatDate(new Date())],
  ];

  resumenRows.forEach(([label, value], i) => {
    const r = i + 2;
    const c1 = wsResumen.getCell(r, 1);
    c1.value = label;
    c1.font = xlFont({ bold: true, size: 10 });
    c1.fill = xlFill(i % 2 === 0 ? E.tealLight : E.white);
    c1.border = xlBorder();
    c1.alignment = { vertical: 'middle' };

    const c2 = wsResumen.getCell(r, 2);
    c2.value = value;
    c2.font = xlFont({ size: 10 });
    c2.fill = xlFill(i % 2 === 0 ? E.tealLight : E.white);
    c2.border = xlBorder();
    c2.alignment = { horizontal: 'right', vertical: 'middle' };
  });

  // ── Hoja 2: Pastores ─────────────────────────────────────────────────────
  const wsPastores = wb.addWorksheet('Pastores');
  xlSetColWidths(wsPastores, [36, 18, 26, 13, 14, 12, 18, 15]);

  const pastorHeaders = ['Pastor', 'Posición', 'Distrito', 'Informes', 'Actividades', 'Horas', 'Transporte', 'Cumplimiento'];
  xlSheetHeader(wsPastores, `Pastores — ${monthLabel}`, pastorHeaders.length, E.teal);
  xlColHeaders(wsPastores, 2, pastorHeaders, E.tealDark);
  wsPastores.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: pastorHeaders.length } };

  const sortedPastors = [...data.pastorSummaries].sort((a, b) => b.compliance - a.compliance);
  sortedPastors.forEach((p, i) => {
    const r = i + 3;
    const pct = Math.round(p.compliance * 100);
    const rowFill = i % 2 === 0 ? E.white : E.rowAlt;
    const rowData: (string | number)[] = [
      p.pastorName, p.position || '—', p.districtName || '—',
      p.totalReports, p.totalActivities,
      Number(p.totalHours.toFixed(1)),
      formatCurrency(p.totalTransportAmount),
      pct,
    ];
    rowData.forEach((val, ci) => {
      const isCompliance = ci === 7;
      const cf = isCompliance ? xlComplianceFill(pct) : null;
      xlDataCell(wsPastores, r, ci + 1, val, {
        align: ci >= 3 ? 'right' : 'left',
        fillArgb: cf ? cf.bg : rowFill,
        textArgb: cf ? cf.text : undefined,
        bold: isCompliance,
      });
    });
  });

  // Fila de totales
  const totalRow = sortedPastors.length + 3;
  const totalLabels: (string | number)[] = [
    'TOTAL', '', '',
    sortedPastors.reduce((s, p) => s + p.totalReports, 0),
    data.totals.totalActivities,
    Number(data.totals.totalHours.toFixed(1)),
    formatCurrency(data.totalTransportAmount),
    `${Math.round(avgCompliance * 100)}%`,
  ];
  totalLabels.forEach((val, ci) => {
    xlDataCell(wsPastores, totalRow, ci + 1, val, {
      bold: true, align: ci >= 3 ? 'right' : 'left',
      fillArgb: E.slate, textArgb: E.white,
    });
  });

  // ── Hoja 3: Actividades ──────────────────────────────────────────────────
  const wsAct = wb.addWorksheet('Actividades');
  xlSetColWidths(wsAct, [52, 16, 14, 12, 18]);
  xlSheetHeader(wsAct, `Actividades por Categoría — ${monthLabel}`, 5, E.teal);

  let actRow = 2;
  for (const cat of data.categories) {
    const activeSubs = cat.subcategories.filter((s) => s.totalQuantity > 0);
    if (activeSubs.length === 0) continue;

    // Fila de categoría
    const bulletArgb = hexToArgb(cat.color) ?? E.teal;
    wsAct.mergeCells(actRow, 1, actRow, 5);
    const catCell = wsAct.getCell(actRow, 1);
    catCell.value = cat.categoryName.toUpperCase();
    catCell.fill = xlFill(bulletArgb);
    catCell.font = xlFont({ bold: true, size: 10, color: E.white });
    catCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    catCell.border = xlBorder(bulletArgb);
    wsAct.getRow(actRow).height = 18;
    actRow++;

    // Encabezados de subcategoría
    xlColHeaders(wsAct, actRow, ['Subcategoría', 'Unidad', 'Cantidad', 'Horas', 'Monto'], E.slate);
    actRow++;

    // Filas de subcategorías
    activeSubs.forEach((s, si) => {
      const rowFill = si % 2 === 0 ? E.white : E.rowAlt;
      const subData: (string | number)[] = [
        s.subcategoryName, s.unit, s.totalQuantity,
        Number(s.totalHours.toFixed(1)),
        s.totalAmount > 0 ? s.totalAmount : '—',
      ];
      subData.forEach((val, ci) => {
        xlDataCell(wsAct, actRow, ci + 1, val, {
          align: ci >= 2 ? 'right' : 'left',
          fillArgb: rowFill,
        });
      });
      actRow++;
    });

    // Subtotal por categoría
    const catQty = activeSubs.reduce((s, x) => s + x.totalQuantity, 0);
    const catHrs = activeSubs.reduce((s, x) => s + x.totalHours, 0);
    const catAmt = activeSubs.reduce((s, x) => s + x.totalAmount, 0);
    const subtotalData: (string | number)[] = [
      'Subtotal', '', catQty, Number(catHrs.toFixed(1)), catAmt > 0 ? catAmt : '—',
    ];
    subtotalData.forEach((val, ci) => {
      xlDataCell(wsAct, actRow, ci + 1, val, {
        bold: true, align: ci >= 2 ? 'right' : 'left',
        fillArgb: E.slateLight,
      });
    });
    actRow += 2;
  }

  const buffer = await wb.xlsx.writeBuffer();
  downloadBlob(buffer, `consolidado_${monthLabel.replace(/\s/g, '_')}.xlsx`);
}

// ---------------------------------------------------------------------------
// 5. Excel — Consolidado de Unión
// ---------------------------------------------------------------------------

export async function exportUnionConsolidatedExcel(
  data: UnionConsolidatedResponse,
  monthLabel: string,
  unionName: string,
) {
  const ExcelJS = await loadExcel();
  const wb: Workbook = new ExcelJS.Workbook();
  wb.creator = EXPORT_BRAND.name;
  wb.created = new Date();

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────────
  const wsResumen = wb.addWorksheet('Resumen');
  xlSetColWidths(wsResumen, [28, 20]);
  xlSheetHeader(wsResumen, `Consolidado de Unión — ${unionName} — ${monthLabel}`, 2, E.purple);

  const resumenRows: [string, string | number][] = [
    ['Unión', unionName],
    ['Periodo', monthLabel],
    ['Total asociaciones', data.totalAssociations],
    ['Total pastores', data.totalPastors],
    ['Total actividades', data.totalActivities],
    ['Total horas', Number(data.totalHours.toFixed(1))],
    ['Cumplimiento promedio', `${Math.round(data.avgCompliance * 100)}%`],
    ['Generado el', formatDate(new Date())],
  ];

  resumenRows.forEach(([label, value], i) => {
    const r = i + 2;
    const fill = i % 2 === 0 ? E.purpleLight : E.white;
    const c1 = wsResumen.getCell(r, 1);
    c1.value = label; c1.font = xlFont({ bold: true, size: 10 });
    c1.fill = xlFill(fill); c1.border = xlBorder(); c1.alignment = { vertical: 'middle' };
    const c2 = wsResumen.getCell(r, 2);
    c2.value = value; c2.font = xlFont({ size: 10 });
    c2.fill = xlFill(fill); c2.border = xlBorder(); c2.alignment = { horizontal: 'right', vertical: 'middle' };
  });

  // ── Hoja 2: Asociaciones ─────────────────────────────────────────────────
  const wsAssoc = wb.addWorksheet('Asociaciones');
  xlSetColWidths(wsAssoc, [42, 14, 16, 14, 16]);

  const assocHeaders = ['Asociación', 'Pastores', 'Actividades', 'Horas', 'Cumplimiento'];
  xlSheetHeader(wsAssoc, `Asociaciones — ${unionName} — ${monthLabel}`, assocHeaders.length, E.purple);
  xlColHeaders(wsAssoc, 2, assocHeaders, E.purple);
  wsAssoc.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: assocHeaders.length } };

  data.associationSummaries.forEach((a, i) => {
    const r = i + 3;
    const pct = Math.round(a.avgCompliance * 100);
    const rowFill = i % 2 === 0 ? E.white : E.rowAlt;
    const cf = xlComplianceFill(pct);
    const rowData: (string | number)[] = [
      a.associationName, a.totalPastors, a.totalActivities,
      Number(a.totalHours.toFixed(0)), pct,
    ];
    rowData.forEach((val, ci) => {
      const isCompliance = ci === 4;
      xlDataCell(wsAssoc, r, ci + 1, val, {
        align: ci >= 1 ? 'right' : 'left',
        fillArgb: isCompliance ? cf.bg : rowFill,
        textArgb: isCompliance ? cf.text : undefined,
        bold: isCompliance,
      });
    });
  });

  // Fila de totales
  const totalPct = Math.round(data.avgCompliance * 100);
  const totalRow = data.associationSummaries.length + 3;
  const totals: (string | number)[] = [
    'TOTAL', data.totalPastors, data.totalActivities,
    Number(data.totalHours.toFixed(0)), `${totalPct}%`,
  ];
  totals.forEach((val, ci) => {
    xlDataCell(wsAssoc, totalRow, ci + 1, val, {
      bold: true, align: ci >= 1 ? 'right' : 'left',
      fillArgb: E.slate, textArgb: E.white,
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  downloadBlob(buffer, `consolidado_union_${monthLabel.replace(/\s/g, '_')}.xlsx`);
}

// ---------------------------------------------------------------------------
// 6. Excel — Consolidado personal del pastor
// ---------------------------------------------------------------------------

export async function exportPastorExcel(
  data: ConsolidatedResponse,
  monthLabel: string,
  pastorName: string,
  position?: string | null,
) {
  const ExcelJS = await loadExcel();
  const wb: Workbook = new ExcelJS.Workbook();
  wb.creator = EXPORT_BRAND.name;
  wb.created = new Date();

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────────
  const wsRes = wb.addWorksheet('Resumen');
  xlSetColWidths(wsRes, [28, 22]);

  const title = position ? `${pastorName} · ${position} — ${monthLabel}` : `${pastorName} — ${monthLabel}`;
  xlSheetHeader(wsRes, title, 2, E.teal);

  const compliance = Math.round(data.compliance * 100);
  const resRows: [string, string | number][] = [
    ['Pastor', pastorName],
    ...(position ? [['Posición', position] as [string, string]] : []),
    ['Periodo', monthLabel],
    ['Días reportados', `${data.daysWithReports} de ${data.daysInPeriod}`],
    ['Total actividades', data.totals.totalActivities],
    ['Total horas', Number(data.totals.totalHours.toFixed(1))],
    ['Cumplimiento', `${compliance}%`],
    ['Total transporte', formatCurrency(data.totalTransportAmount)],
    ['Generado el', formatDate(new Date())],
  ];

  resRows.forEach(([label, value], i) => {
    const r = i + 2;
    const fill = i % 2 === 0 ? E.tealLight : E.white;
    const c1 = wsRes.getCell(r, 1);
    c1.value = label; c1.font = xlFont({ bold: true, size: 10 });
    c1.fill = xlFill(fill); c1.border = xlBorder(); c1.alignment = { vertical: 'middle' };
    const c2 = wsRes.getCell(r, 2);
    c2.value = value; c2.font = xlFont({ size: 10 });
    c2.fill = xlFill(fill); c2.border = xlBorder(); c2.alignment = { horizontal: 'right', vertical: 'middle' };
  });

  // ── Hoja 2: Actividades ──────────────────────────────────────────────────
  const wsAct = wb.addWorksheet('Actividades');
  xlSetColWidths(wsAct, [52, 16, 14, 12, 18]);
  xlSheetHeader(wsAct, `Actividades — ${pastorName} — ${monthLabel}`, 5, E.teal);

  let actRow = 2;
  for (const cat of data.categories) {
    const activeSubs = cat.subcategories.filter((s) => s.totalQuantity > 0);
    if (activeSubs.length === 0) continue;

    const bulletArgb = hexToArgb(cat.color) ?? E.teal;
    wsAct.mergeCells(actRow, 1, actRow, 5);
    const catCell = wsAct.getCell(actRow, 1);
    catCell.value = cat.categoryName.toUpperCase();
    catCell.fill = xlFill(bulletArgb);
    catCell.font = xlFont({ bold: true, size: 10, color: E.white });
    catCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    catCell.border = xlBorder(bulletArgb);
    wsAct.getRow(actRow).height = 18;
    actRow++;

    xlColHeaders(wsAct, actRow, ['Subcategoría', 'Unidad', 'Cantidad', 'Horas', 'Monto'], E.slate);
    actRow++;

    activeSubs.forEach((s, si) => {
      const rowFill = si % 2 === 0 ? E.white : E.rowAlt;
      const subData: (string | number)[] = [
        s.subcategoryName, s.unit, s.totalQuantity,
        Number(s.totalHours.toFixed(1)),
        s.totalAmount > 0 ? s.totalAmount : '—',
      ];
      subData.forEach((val, ci) => {
        xlDataCell(wsAct, actRow, ci + 1, val, { align: ci >= 2 ? 'right' : 'left', fillArgb: rowFill });
      });
      actRow++;
    });

    const catQty = activeSubs.reduce((s, x) => s + x.totalQuantity, 0);
    const catHrs = activeSubs.reduce((s, x) => s + x.totalHours, 0);
    const catAmt = activeSubs.reduce((s, x) => s + x.totalAmount, 0);
    const subtotal: (string | number)[] = ['Subtotal', '', catQty, Number(catHrs.toFixed(1)), catAmt > 0 ? catAmt : '—'];
    subtotal.forEach((val, ci) => {
      xlDataCell(wsAct, actRow, ci + 1, val, { bold: true, align: ci >= 2 ? 'right' : 'left', fillArgb: E.slateLight });
    });
    actRow += 2;
  }

  const buffer = await wb.xlsx.writeBuffer();
  downloadBlob(buffer, `mi_consolidado_${pastorName.replace(/\s/g, '_')}_${monthLabel.replace(/\s/g, '_')}.xlsx`);
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  if (amount === 0) return '$0';
  return `$${amount.toLocaleString('es-CO')}`;
}

/** Convierte color hex (#RRGGBB o #RGB) a tupla RGB para jsPDF */
function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const [r, g, b] = clean.split('').map((c) => parseInt(c + c, 16));
    return [r, g, b];
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return null;
}

/** Convierte hex a ARGB para ExcelJS (prefija FF para opacidad completa) */
function hexToArgb(hex: string): string | null {
  const clean = hex.replace('#', '');
  if (clean.length === 6) return `FF${clean.toUpperCase()}`;
  if (clean.length === 3) {
    const expanded = clean.split('').map((c) => c + c).join('');
    return `FF${expanded.toUpperCase()}`;
  }
  return null;
}

/** Descarga un ArrayBuffer como archivo en el navegador */
function downloadBlob(buffer: ArrayBuffer | Buffer<ArrayBufferLike>, filename: string) {
  const blob = new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
