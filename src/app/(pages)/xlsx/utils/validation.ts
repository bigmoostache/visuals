import { CellPosition } from '../types/spreadsheet';

/**
 * Validate if a cell position is within bounds
 */
export function isValidPosition(
  position: CellPosition,
  maxRow: number,
  maxCol: number
): boolean {
  return (
    position.r >= 0 &&
    position.r <= maxRow &&
    position.c >= 0 &&
    position.c <= maxCol
  );
}

/**
 * Validate cell value based on type
 */
export function validateCellValue(
  value: string,
  type?: 'string' | 'number' | 'date' | 'boolean'
): boolean {
  if (!type || type === 'string') return true;
  
  switch (type) {
    case 'number':
      return !isNaN(Number(value)) && value.trim() !== '';
    
    case 'date':
      return !isNaN(Date.parse(value));
    
    case 'boolean':
      return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase());
    
    default:
      return true;
  }
}

/**
 * Sanitize cell value for display
 */
export function sanitizeCellValue(value: any): string | number {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

/**
 * Check if a value is empty
 */
export function isEmpty(value: any): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Validate sheet name
 */
export function isValidSheetName(name: string): boolean {
  return (
    name.length > 0 &&
    name.length <= 31 &&
    !/[\\\/\?\*\[\]:]/.test(name)
  );
}