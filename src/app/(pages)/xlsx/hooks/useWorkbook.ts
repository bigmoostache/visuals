import { useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useSpreadsheetContext } from '../context/SpreadsheetContext';
import { extractSheetData } from '../utils/spreadsheet';
import { SPREADSHEET_CONSTANTS } from '../constants';

export const useWorkbook = (data: Blob | null) => {
  const {
    workbook,
    currentSheet,
    setWorkbook,
    setSheetNames,
    setCurrentSheet,
    setSheetData,
    setColWidths,
    setRowHeights,
  } = useSpreadsheetContext();
  
  // Load workbook from blob data
  useEffect(() => {
    if (!data) return;
    
    const fr = new FileReader();
    fr.onload = (e) => {
      const uint8Array = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(uint8Array, { type: 'array', cellStyles: true, cellNF: true });
      
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      if (wb.SheetNames.length > 0) {
        setCurrentSheet(wb.SheetNames[0]);
      }
    };
    fr.readAsArrayBuffer(data);
  }, [data, setWorkbook, setSheetNames, setCurrentSheet]);
  
  // Load current sheet data
  const loadCurrentSheet = useCallback(() => {
    if (!workbook || !currentSheet) return;
    
    const data = extractSheetData(workbook, currentSheet);
    setSheetData(data);
    
    // Initialize dimensions
    if (data.length > 0) {
      const colCount = Math.max(...data.map(row => row.length));
      const newColWidths = new Array(colCount).fill(SPREADSHEET_CONSTANTS.DEFAULT_COL_WIDTH);
      const newRowHeights = new Array(data.length).fill(SPREADSHEET_CONSTANTS.DEFAULT_ROW_HEIGHT);
      
      setColWidths(newColWidths);
      setRowHeights(newRowHeights);
    }
  }, [workbook, currentSheet, setSheetData, setColWidths, setRowHeights]);
  
  useEffect(() => {
    loadCurrentSheet();
  }, [loadCurrentSheet]);
  
  // Save workbook to file
  const saveWorkbook = useCallback((): File | null => {
    if (!workbook) return null;
    
    const wbout = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array', 
      cellStyles: true 
    });
    
    return new File(
      [wbout], 
      'spreadsheet.xlsx', 
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    );
  }, [workbook]);
  
  return {
    workbook,
    saveWorkbook,
    loadCurrentSheet,
  };
};