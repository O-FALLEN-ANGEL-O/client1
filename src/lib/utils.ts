import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToStyledExcel(filename: string, paymentReportData: object[], powerBiData: object[]) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // --- Payment Report Sheet ---
  const wsPaymentReport = XLSX.utils.json_to_sheet(paymentReportData);

  // Define styles
  const headerStyle = { font: { bold: true }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };
  const cellStyle = { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };
  
  // Apply styles and calculate column widths for Payment Report
  const colWidthsPayment = Object.keys(paymentReportData[0] || {}).map(key => ({ wch: Math.max(key.length, 20) }));
  
  Object.keys(paymentReportData[0] || {}).forEach((key, i) => {
    const cellRef = XLSX.utils.encode_cell({c: i, r: 0});
    wsPaymentReport[cellRef].s = headerStyle;
  });

  paymentReportData.forEach((row, r) => {
    Object.keys(row).forEach((key, c) => {
      const cellRef = XLSX.utils.encode_cell({c: c, r: r + 1});
      if(wsPaymentReport[cellRef]) wsPaymentReport[cellRef].s = cellStyle;
    });
    colWidthsPayment.forEach((width, c) => {
        const cellValue = (row as any)[Object.keys(row)[c]];
        const cellLength = cellValue ? String(cellValue).length : 10;
        if(cellLength > width.wch) {
            width.wch = cellLength;
        }
    });
  });

  wsPaymentReport['!cols'] = colWidthsPayment;
  XLSX.utils.book_append_sheet(wb, wsPaymentReport, "Payment Report");

  // --- Power BI Data Sheet ---
  const wsPowerBi = XLSX.utils.json_to_sheet(powerBiData);

  // Apply styles and calculate column widths for Power BI Data
  const colWidthsPowerBi = Object.keys(powerBiData[0] || {}).map(key => ({ wch: Math.max(key.length, 20) }));

  Object.keys(powerBiData[0] || {}).forEach((key, i) => {
    const cellRef = XLSX.utils.encode_cell({c: i, r: 0});
    wsPowerBi[cellRef].s = headerStyle;
  });

  powerBiData.forEach((row, r) => {
    Object.keys(row).forEach((key, c) => {
      const cellRef = XLSX.utils.encode_cell({c: c, r: r + 1});
       if(wsPowerBi[cellRef]) wsPowerBi[cellRef].s = cellStyle;
    });
    colWidthsPowerBi.forEach((width, c) => {
        const cellValue = (row as any)[Object.keys(row)[c]];
        const cellLength = cellValue ? String(cellValue).length : 10;
        if(cellLength > width.wch) {
            width.wch = cellLength;
        }
    });
  });

  wsPowerBi['!cols'] = colWidthsPowerBi;
  XLSX.utils.book_append_sheet(wb, wsPowerBi, "Power BI Data");

  // Write the workbook and trigger download
  XLSX.writeFile(wb, filename);
}

export function exportToCsv(filename: string, rows: object[], headers?: Record<string, string>) {
  if (!rows || !rows.length) {
    return;
  }
  const separator = ',';
  const keys = Object.keys(rows[0]);
  
  const displayHeaders = headers ? keys.map(key => headers[key] || key) : keys;

  const csvContent =
    displayHeaders.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
        cell = cell instanceof Date 
          ? cell.toISOString().split('T')[0]
          : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
