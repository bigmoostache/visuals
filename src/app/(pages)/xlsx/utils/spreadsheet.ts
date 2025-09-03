import * as XLSX from 'xlsx';
import { CellPosition } from '../types/spreadsheet';

/**
 * Convert number to Excel-like column name
 * 0 -> A, 1 -> B, 25 -> Z, 26 -> AA, etc.
 */
export function columnName(n: number): string {
  let str = "";
  while (n >= 0) {
    str = String.fromCharCode((n % 26) + 65) + str;
    n = Math.floor(n / 26) - 1;
  }
  return str;
}

/**
 * Convert Excel-like column name to number
 * A -> 0, B -> 1, Z -> 25, AA -> 26, etc.
 */
export function columnIndex(name: string): number {
  let index = 0;
  for (let i = 0; i < name.length; i++) {
    index = index * 26 + (name.charCodeAt(i) - 64);
  }
  return index - 1;
}

/**
 * Convert cell position to Excel cell address
 */
export function getCellAddress(position: CellPosition): string {
  return XLSX.utils.encode_cell({ r: position.r, c: position.c });
}

/**
 * Parse Excel cell address to position
 */
export function parseCellAddress(address: string): CellPosition {
  const decoded = XLSX.utils.decode_cell(address);
  return { r: decoded.r, c: decoded.c };
}

/**
 * Convert sheet data from workbook
 */
export function extractSheetData(workbook: XLSX.WorkBook, sheetName: string): (string | number)[][] {
  const ws = workbook.Sheets[sheetName];
  if (!ws) return [];
  
  const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
  const rows: (string | number)[][] = [];
  
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const row: (string | number)[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cell_address];
      row.push(cell ? cell.v : "");
    }
    rows.push(row);
  }
  
  return rows;
}

/**
 * Update cell value in workbook
 */
export function updateCellValue(
  workbook: XLSX.WorkBook,
  sheetName: string,
  position: CellPosition,
  value: string | number
): void {
  const ws = workbook.Sheets[sheetName];
  if (!ws) return;
  
  const cell_addr = getCellAddress(position);
  
  if (!ws[cell_addr]) {
    ws[cell_addr] = { t: 's', v: value };
  } else {
    ws[cell_addr].v = value;
    if (!isNaN(Number(value)) && String(value).trim() !== '') {
      ws[cell_addr].t = 'n';
      ws[cell_addr].v = Number(value);
    } else {
      ws[cell_addr].t = 's';
    }
  }
}

/**
 * Create a new empty workbook with one sheet
 */
export function createEmptyWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([[]]);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return wb;
}

/**
 * Calculate optimal dimensions for content
 */
export function calculateOptimalDimensions(
  data: (string | number)[][],
  maxWidth: number = 300,
  maxHeight: number = 200
): { widths: number[]; heights: number[] } {
  if (!data.length) {
    return { widths: [], heights: [] };
  }
  
  const colCount = Math.max(...data.map(row => row.length));
  const widths = new Array(colCount).fill(60);
  const heights = new Array(data.length).fill(24);
  
  // This is a simplified calculation
  // In the actual implementation, we'll use canvas measurement in the hook
  
  return { widths, heights };
}