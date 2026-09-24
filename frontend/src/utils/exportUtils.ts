import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ReportMeta {
  title: string;
  subtitle?: string;
  filename: string;
  institution?: string;
  summaryStats?: { label: string; value: string | number }[];
}

/**
 * Exports data to an Excel (.xlsx) spreadsheet
 */
export function exportToExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  // Convert rows into array of objects keyed by header
  const data = rows.map(row => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? '';
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths based on longest content
  const colWidths = headers.map((h, i) => {
    let maxLen = h.length;
    rows.forEach(r => {
      const val = String(r[i] ?? '');
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Exports data to a formatted, publication-grade PDF document
 */
export function exportToPDF(
  meta: ReportMeta,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const doc = new jsPDF({
    orientation: headers.length > 5 ? 'landscape' : 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Institution branding
  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(meta.institution || 'SMART ATTENDANCE MANAGEMENT SYSTEM', 30, 26);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Institutional Compliance & Attendance Records', 30, 42);

  // Date and Time on the right
  const nowStr = new Date().toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generated: ${nowStr}`, pageWidth - 30, 36, { align: 'right' });

  // Report Title & Subtitle
  let currentY = 85;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(meta.title, 30, currentY);

  if (meta.subtitle) {
    currentY += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(meta.subtitle, 30, currentY);
  }

  // Summary Metrics Bar
  if (meta.summaryStats && meta.summaryStats.length > 0) {
    currentY += 15;
    const boxHeight = 36;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(30, currentY, pageWidth - 60, boxHeight, 4, 4, 'FD');

    const statWidth = (pageWidth - 60) / meta.summaryStats.length;
    meta.summaryStats.forEach((stat, i) => {
      const startX = 30 + i * statWidth + 15;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(stat.label.toUpperCase(), startX, currentY + 14);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(stat.value), startX, currentY + 28);
    });

    currentY += boxHeight;
  }

  // Table Data
  currentY += 15;

  autoTable(doc, {
    startY: currentY,
    head: [headers],
    body: rows.map(r => r.map(c => String(c ?? ''))),
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 30, right: 30, bottom: 40 },
    didDrawPage: (data) => {
      // Footer on every page
      const pageStr = `Page ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(pageStr, pageWidth - 30, pageHeight - 15, { align: 'right' });
      doc.text(
        'Confidential • Smart Attendance Management Institutional Report',
        30,
        pageHeight - 15
      );
    },
  });

  const finalName = meta.filename.endsWith('.pdf') ? meta.filename : `${meta.filename}.pdf`;
  doc.save(finalName);
}
