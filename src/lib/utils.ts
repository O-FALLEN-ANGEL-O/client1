import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToExcel(filename: string, reportData: object[]) {
  if (!reportData.length) {
    console.warn("No data to export.");
    return;
  }

  // --- Data Preparation ---
  const ws_data = [
    Object.keys(reportData[0]), // Header row
    ...reportData.map(row => Object.values(row)) // Data rows
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // --- Styling ---
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

  // --- Apply Styles to all cells ---
  const range = XLSX.utils.decode_range(ws['!ref']!);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R };
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      if (ws[cell_ref]) {
         ws[cell_ref].s = (R === 0) ? headerStyle : cellStyle;
      }
    }
  }

  // --- Column Widths ---
  const colWidths = Object.keys(reportData[0]).map(key => {
    // Get the max length of header or data in the column
    const maxLength = Math.max(
      key.length,
      ...reportData.map(row => String((row as any)[key] || "").length)
    );
    return { wch: maxLength + 2 }; // Add padding
  });
  ws['!cols'] = colWidths;
  
  // --- Append and Download ---
  XLSX.utils.book_append_sheet(wb, ws, "Payment Report");
  XLSX.writeFile(wb, filename);
}
