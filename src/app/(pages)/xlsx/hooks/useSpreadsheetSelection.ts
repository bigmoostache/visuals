import { useCallback, useRef, useEffect } from 'react';
import { useSpreadsheetContext } from '../context/SpreadsheetContext';
import { CellPosition } from '../types/spreadsheet';

export const useSpreadsheetSelection = () => {
  const {
    selection,
    sheetData,
    useFirstRowAsHeader,
    setSelectedCell,
    setEditingCell,
    setEditValue,
    commitEdit,
    cancelEdit,
  } = useSpreadsheetContext();
  
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus textarea when editing starts
  useEffect(() => {
    if (selection.editingCell && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.select();
    }
  }, [selection.editingCell]);
  
  const handleCellClick = useCallback((r: number, c: number) => {
    setSelectedCell({ r, c });
  }, [setSelectedCell]);
  
  const handleCellDoubleClick = useCallback((r: number, c: number) => {
    const cellValue = sheetData[r]?.[c] ?? '';
    setEditingCell({ r, c });
    setEditValue(String(cellValue));
  }, [sheetData, setEditingCell, setEditValue]);
  
  const startEditing = useCallback((position: CellPosition, initialValue?: string) => {
    const cellValue = initialValue ?? String(sheetData[position.r]?.[position.c] ?? '');
    setEditingCell(position);
    setEditValue(cellValue);
  }, [sheetData, setEditingCell, setEditValue]);
  
  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }, [commitEdit, cancelEdit]);
  
  const navigateToCell = useCallback((position: CellPosition) => {
    setSelectedCell(position);
    
    // Scroll cell into view
    setTimeout(() => {
      const cell = document.querySelector(`[data-cell="${position.r}-${position.c}"]`) as HTMLElement;
      if (cell) {
        cell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }, 0);
  }, [setSelectedCell]);
  
  const getNavigationBounds = useCallback(() => {
    const dataRows = useFirstRowAsHeader ? sheetData.slice(1) : sheetData;
    const minRow = useFirstRowAsHeader ? 1 : 0;
    const maxRow = minRow + dataRows.length - 1;
    const maxCol = sheetData[0]?.length - 1 || 0;
    
    return { minRow, maxRow, maxCol };
  }, [sheetData, useFirstRowAsHeader]);
  
  return {
    selection,
    editTextareaRef,
    handleCellClick,
    handleCellDoubleClick,
    startEditing,
    handleEditKeyDown,
    navigateToCell,
    getNavigationBounds,
    commitEdit,
    cancelEdit,
  };
};