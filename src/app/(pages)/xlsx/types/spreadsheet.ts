import * as XLSX from 'xlsx';

export interface CellPosition {
  r: number;
  c: number;
}

export interface CellData {
  value: string | number;
  type?: 'string' | 'number' | 'date' | 'boolean';
  format?: string;
}

export interface SheetData {
  rows: (string | number)[][];
  colWidths: number[];
  rowHeights: number[];
}

export interface SpreadsheetSelection {
  selectedCell: CellPosition | null;
  editingCell: CellPosition | null;
  editValue: string;
}

export interface ResizeState {
  index: number;
  startPosition: number;
  startSize: number;
}

export interface SpreadsheetState {
  workbook: XLSX.WorkBook | undefined;
  sheetNames: string[];
  currentSheet: string;
  sheetData: (string | number)[][];
  colWidths: number[];
  rowHeights: number[];
  useFirstRowAsHeader: boolean;
  selection: SpreadsheetSelection;
}

export type KeyboardCommand = 
  | 'ArrowUp' 
  | 'ArrowDown' 
  | 'ArrowLeft' 
  | 'ArrowRight' 
  | 'Tab' 
  | 'Enter' 
  | 'Escape' 
  | 'Delete' 
  | 'Backspace' 
  | 'F2';

export interface SpreadsheetProps {
  url: string;
}

export interface CellProps {
  rowIndex: number;
  colIndex: number;
  value: string | number;
  isSelected: boolean;
  isEditing: boolean;
  height: number;
  width: number;
  onCellClick: (r: number, c: number) => void;
  onCellDoubleClick: (r: number, c: number) => void;
  editValue?: string;
  onEditChange?: (value: string) => void;
  onEditKeyDown?: (e: React.KeyboardEvent) => void;
  onEditBlur?: () => void;
}

export interface ColumnHeaderProps {
  colIndex: number;
  width: number;
  label: string;
  onResize: (e: React.MouseEvent<HTMLDivElement>, colIndex: number) => void;
}

export interface RowHeaderProps {
  rowIndex: number;
  height: number;
  label: string | number;
  onResize: (e: React.MouseEvent<HTMLDivElement>, rowIndex: number) => void;
}

export interface ToolbarProps {
  onSave: () => void;
  onAutoSize: () => void;
  useFirstRowAsHeader: boolean;
  onToggleHeader: (value: boolean) => void;
  isSaving: boolean;
  isSaved: boolean;
}

export interface SheetTabsProps {
  sheetNames: string[];
  currentSheet: string;
  onSheetChange: (sheetName: string) => void;
}