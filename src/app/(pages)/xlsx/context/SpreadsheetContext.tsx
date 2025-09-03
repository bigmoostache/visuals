"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as XLSX from 'xlsx';
import { SpreadsheetState, CellPosition, SpreadsheetSelection } from '../types/spreadsheet';
import { SPREADSHEET_CONSTANTS } from '../constants';
import { updateCellValue } from '../utils/spreadsheet';

interface SpreadsheetContextType extends SpreadsheetState {
  setWorkbook: (workbook: XLSX.WorkBook) => void;
  setSheetNames: (names: string[]) => void;
  setCurrentSheet: (sheet: string) => void;
  setSheetData: (data: (string | number)[][]) => void;
  setColWidths: (widths: number[]) => void;
  setRowHeights: (heights: number[]) => void;
  setUseFirstRowAsHeader: (value: boolean) => void;
  
  // Selection methods
  setSelectedCell: (position: CellPosition | null) => void;
  setEditingCell: (position: CellPosition | null) => void;
  setEditValue: (value: string) => void;
  
  // Cell operations
  updateCell: (row: number, col: number, value: string | number) => void;
  commitEdit: () => void;
  cancelEdit: () => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

export const useSpreadsheetContext = () => {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheetContext must be used within a SpreadsheetProvider');
  }
  return context;
};

interface SpreadsheetProviderProps {
  children: ReactNode;
}

export const SpreadsheetProvider: React.FC<SpreadsheetProviderProps> = ({ children }) => {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook>();
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string>('');
  const [sheetData, setSheetData] = useState<(string | number)[][]>([]);
  const [colWidths, setColWidths] = useState<number[]>([]);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [useFirstRowAsHeader, setUseFirstRowAsHeader] = useState(true);
  
  const [selection, setSelection] = useState<SpreadsheetSelection>({
    selectedCell: null,
    editingCell: null,
    editValue: '',
  });
  
  const setSelectedCell = useCallback((position: CellPosition | null) => {
    setSelection(prev => ({ ...prev, selectedCell: position }));
  }, []);
  
  const setEditingCell = useCallback((position: CellPosition | null) => {
    setSelection(prev => ({ ...prev, editingCell: position }));
  }, []);
  
  const setEditValue = useCallback((value: string) => {
    setSelection(prev => ({ ...prev, editValue: value }));
  }, []);
  
  const updateCell = useCallback((row: number, col: number, value: string | number) => {
    if (!workbook || !currentSheet) return;
    
    // Update workbook
    updateCellValue(workbook, currentSheet, { r: row, c: col }, value);
    
    // Update local data
    setSheetData(prev => {
      const newData = [...prev];
      if (!newData[row]) newData[row] = [];
      newData[row][col] = value;
      return newData;
    });
  }, [workbook, currentSheet]);
  
  const commitEdit = useCallback(() => {
    const { editingCell, editValue } = selection;
    if (!editingCell) return;
    
    updateCell(editingCell.r, editingCell.c, editValue);
    setSelection(prev => ({
      ...prev,
      editingCell: null,
      editValue: '',
    }));
  }, [selection, updateCell]);
  
  const cancelEdit = useCallback(() => {
    setSelection(prev => ({
      ...prev,
      editingCell: null,
      editValue: '',
    }));
  }, []);
  
  const value: SpreadsheetContextType = {
    workbook,
    sheetNames,
    currentSheet,
    sheetData,
    colWidths,
    rowHeights,
    useFirstRowAsHeader,
    selection,
    
    setWorkbook,
    setSheetNames,
    setCurrentSheet,
    setSheetData,
    setColWidths,
    setRowHeights,
    setUseFirstRowAsHeader,
    
    setSelectedCell,
    setEditingCell,
    setEditValue,
    
    updateCell,
    commitEdit,
    cancelEdit,
  };
  
  return (
    <SpreadsheetContext.Provider value={value}>
      {children}
    </SpreadsheetContext.Provider>
  );
};