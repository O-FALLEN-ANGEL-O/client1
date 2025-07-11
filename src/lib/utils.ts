
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToExcel(filename: string, reportData: any[]) {
  if (!reportData || reportData.length === 0) {
    console.warn("No data to export.");
    return;
  }

  // --- 1. Create Worksheet from Data ---
  const headers = Object.keys(reportData[0]);
  const data = [
    headers,
    ...reportData.map(row => headers.map(header => row[header]))
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // --- 2. Define Styles ---
  const headerStyle = {
    font: { bold: true },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const cellStyle = {
    alignment: { horizontal: "center", vertical: "center" },
     border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };

  // --- 3. Apply Styles and Calculate Column Widths ---
  const colWidths = [] as { wch: number }[];
  const range = XLSX.utils.decode_range(ws['!ref']!);

  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxWidth = 0;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell_address = { c: C, r: R };
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      
      // Ensure cell exists
      if (!ws[cell_ref]) continue;

      // Apply styles
      ws[cell_ref].s = (R === 0) ? headerStyle : cellStyle;

      // Calculate width
      const cellValue = ws[cell_ref].v;
      const cellTextLength = cellValue ? String(cellValue).length : 0;
      if (cellTextLength > maxWidth) {
        maxWidth = cellTextLength;
      }
    }
    // Add a little padding to the max width, with a minimum for headers
    const headerTextLength = headers[C] ? headers[C].length : 0;
    maxWidth = Math.max(maxWidth, headerTextLength);
    colWidths.push({ wch: maxWidth + 2 });
  }

  // Set column widths
  ws['!cols'] = colWidths;
  
  // --- 4. Create Workbook and Download ---
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payment Report");
  XLSX.writeFile(wb, filename);
}
