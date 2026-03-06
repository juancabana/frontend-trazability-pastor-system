import type { AssociationConsolidatedResponse } from '@/features/consolidated/domain/entities/consolidated';

export async function exportConsolidatedPDF(
  data: AssociationConsolidatedResponse,
  monthLabel: string,
) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Consolidado Pastoral', 14, 20);
  doc.setFontSize(10);
  doc.text(monthLabel, 14, 28);

  // Pastor summaries table
  const pastorRows = data.pastorSummaries.map((p) => [
    p.pastorName,
    p.districtName || '—',
    String(p.totalActivities),
    p.totalHours.toFixed(1),
    `${Math.round(p.compliance * 100)}%`,
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Pastor', 'Distrito', 'Actividades', 'Horas', 'Cumplimiento']],
    body: pastorRows,
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 8 },
  });

  // Category breakdown
  let startY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY ?? 80;
  startY += 10;

  data.categories.forEach((cat) => {
    const subRows = cat.subcategories
      .filter((s) => s.totalQuantity > 0)
      .map((s) => [
        s.subcategoryName,
        String(s.totalQuantity),
        s.totalHours > 0 ? s.totalHours.toFixed(1) : '—',
      ]);

    if (subRows.length === 0) return;

    if (startY > 250) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(11);
    doc.text(cat.categoryName, 14, startY);
    startY += 5;

    autoTable(doc, {
      startY,
      head: [['Subcategoria', 'Cantidad', 'Horas']],
      body: subRows,
      theme: 'grid',
      headStyles: { fillColor: [100, 116, 139] },
      styles: { fontSize: 7 },
    });

    startY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY ?? startY;
    startY += 8;
  });

  doc.save(`consolidado_${monthLabel.replace(/\s/g, '_')}.pdf`);
}

export async function exportConsolidatedExcel(
  data: AssociationConsolidatedResponse,
  monthLabel: string,
) {
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();

  // Sheet 1: Pastor Summaries
  const pastorData = data.pastorSummaries.map((p) => ({
    Pastor: p.pastorName,
    Distrito: p.districtName || '—',
    Actividades: p.totalActivities,
    Horas: p.totalHours,
    'Cumplimiento (%)': Math.round(p.compliance * 100),
  }));
  const ws1 = XLSX.utils.json_to_sheet(pastorData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Pastores');

  // Sheet 2: Category Breakdown
  const catData: Record<string, unknown>[] = [];
  data.categories.forEach((cat) => {
    cat.subcategories
      .filter((s) => s.totalQuantity > 0)
      .forEach((s) => {
        catData.push({
          Categoria: cat.categoryName,
          Subcategoria: s.subcategoryName,
          Unidad: s.unit,
          Cantidad: s.totalQuantity,
          Horas: s.totalHours,
        });
      });
  });
  const ws2 = XLSX.utils.json_to_sheet(catData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Categorias');

  XLSX.writeFile(wb, `consolidado_${monthLabel.replace(/\s/g, '_')}.xlsx`);
}
