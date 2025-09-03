import { useEffect, useCallback } from 'react';
import { useSpreadsheetContext } from '../context/SpreadsheetContext';
import { CellPosition } from '../types/spreadsheet';

interface UseSpreadsheetKeyboardProps {
  onSave: () => void;
  startEditing: (position: CellPosition, initialValue?: string) => void;
  navigateToCell: (position: CellPosition) => void;
  getNavigationBounds: () => { minRow: number; maxRow: number; maxCol: number };
}

export const useSpreadsheetKeyboard = ({ 
  onSave,
  startEditing,
  navigateToCell,
  getNavigationBounds,
}: UseSpreadsheetKeyboardProps) => {
  const {
    selection,
    sheetData,
    useFirstRowAsHeader,
    setSelectedCell,
    setEditValue,
  } = useSpreadsheetContext();
  
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    // Save shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      return;
    }
    
    // If we're editing, don't interfere with edit controls
    if (selection.editingCell) return;
    
    // If no cell selected, select first cell
    if (!selection.selectedCell) {
      const firstRow = useFirstRowAsHeader ? 1 : 0;
      if (sheetData.length > firstRow) {
        setSelectedCell({ r: firstRow, c: 0 });
      }
      return;
    }
    
    const { r, c } = selection.selectedCell;
    const { minRow, maxRow, maxCol } = getNavigationBounds();
    
    let newR = r;
    let newC = c;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newR = Math.max(minRow, r - 1);
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        newR = Math.min(maxRow, r + 1);
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        newC = Math.max(0, c - 1);
        break;
        
      case 'ArrowRight':
      case 'Tab':
        e.preventDefault();
        newC = Math.min(maxCol, c + 1);
        break;
        
      case 'Enter':
        e.preventDefault();
        startEditing({ r, c });
        return;
        
      case 'F2':
        e.preventDefault();
        startEditing({ r, c });
        return;
        
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        // Clear cell content
        if (selection.selectedCell) {
          const { r, c } = selection.selectedCell;
          const newData = [...sheetData];
          if (newData[r]) {
            newData[r][c] = '';
          }
        }
        return;
        
      default:
        // If it's a printable character, start editing with that character
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          startEditing({ r, c }, e.key);
          return;
        }
        return;
    }
    
    // Update selection if we moved
    if (newR !== r || newC !== c) {
      navigateToCell({ r: newR, c: newC });
    }
  }, [
    selection,
    sheetData,
    useFirstRowAsHeader,
    onSave,
    setSelectedCell,
    startEditing,
    navigateToCell,
    getNavigationBounds,
  ]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);
  
  return {
    handleGlobalKeyDown,
  };
};