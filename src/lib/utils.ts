
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
  // Create a worksheet from the JSON data.
  // The keys of the first object are used as headers.
  const ws = XLSX.utils.json_to_sheet(reportData);

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

  // Get the range of the worksheet
  const range = XLSX.utils.decode_range(ws['!ref']!);
  const colWidths = [];

  // --- Apply Styles and Calculate Column Widths ---
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxWidth = 0;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell_address = { c: C, r: R };
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      if (ws[cell_ref]) {
        // Apply styles
         ws[cell_ref].s = (R === 0) ? headerStyle : cellStyle;

         // Calculate width
         const cellValue = ws[cell_ref].v;
         const cellTextLength = cellValue ? String(cellValue).length : 0;
         if (cellTextLength > maxWidth) {
           maxWidth = cellTextLength;
         }
      }
    }
     // Add a little padding to the max width
    colWidths.push({ wch: maxWidth + 2 });
  }

  // Set column widths
  ws['!cols'] = colWidths;
  
  // --- Create Workbook and Download ---
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payment Report");
  XLSX.writeFile(wb, filename);
}
