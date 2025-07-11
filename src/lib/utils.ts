import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToExcel(filename: string, reportData: object[]) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // --- Payment Report Sheet ---
  const ws = XLSX.utils.json_to_sheet(reportData);

  // Define styles
  const headerStyle = { 
    font: { bold: true }, 
    border: { 
      top: { style: "thin" }, 
      bottom: { style: "thin" }, 
      left: { style: "thin" }, 
      right: { style: "thin" } 
    } 
  };
  const cellStyle = { 
    border: { 
      top: { style: "thin" }, 
      bottom: { style: "thin" }, 
      left: { style: "thin" }, 
      right: { style: "thin" } 
    } 
  };
  
  // Apply styles and calculate column widths
  const colWidths = Object.keys(reportData[0] || {}).map(key => ({ wch: Math.max(key.length, 12) }));
  
  // Style Header
  Object.keys(reportData[0] || {}).forEach((key, i) => {
    const cellRef = XLSX.utils.encode_cell({c: i, r: 0});
    if (ws[cellRef]) {
        ws[cellRef].s = headerStyle;
    }
  });

  // Style Data Cells and update column widths
  reportData.forEach((row, r) => {
    Object.keys(row).forEach((_, c) => {
      const cellRef = XLSX.utils.encode_cell({c: c, r: r + 1});
      if(ws[cellRef]) ws[cellRef].s = cellStyle;
    });

    // Check cell content length for width calculation
    colWidths.forEach((width, c) => {
        const cellValue = (row as any)[Object.keys(row)[c]];
        const cellLength = cellValue ? String(cellValue).length : 0;
        if(cellLength > width.wch) {
            width.wch = cellLength + 2; // Add a little padding
        }
    });
  });

  ws['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(wb, ws, "Payment Report");

  // Write the workbook and trigger download
  XLSX.writeFile(wb, filename);
}
