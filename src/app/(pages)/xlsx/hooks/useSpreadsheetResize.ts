import { useRef, useCallback } from 'react';
import { useSpreadsheetContext } from '../context/SpreadsheetContext';
import { ResizeState } from '../types/spreadsheet';
import { SPREADSHEET_CONSTANTS } from '../constants';

export const useSpreadsheetResize = () => {
  const { colWidths, rowHeights, setColWidths, setRowHeights } = useSpreadsheetContext();
  
  const resizingColRef = useRef<ResizeState | null>(null);
  const resizingRowRef = useRef<ResizeState | null>(null);
  
  // Column resizing handlers
  const onColMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, colIndex: number) => {
    e.preventDefault();
    resizingColRef.current = {
      index: colIndex,
      startPosition: e.clientX,
      startSize: colWidths[colIndex],
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!resizingColRef.current) return;
      
      const delta = e.clientX - resizingColRef.current.startPosition;
      const newWidth = Math.max(
        resizingColRef.current.startSize + delta, 
        SPREADSHEET_CONSTANTS.MIN_COL_WIDTH
      );
      
      const newColWidths = [...colWidths];
      newColWidths[resizingColRef.current.index] = Math.min(
        newWidth, 
        SPREADSHEET_CONSTANTS.MAX_COL_WIDTH
      );
      setColWidths(newColWidths);
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      resizingColRef.current = null;
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [colWidths, setColWidths]);
  
  // Row resizing handlers
  const onRowMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, rowIndex: number) => {
    e.preventDefault();
    resizingRowRef.current = {
      index: rowIndex,
      startPosition: e.clientY,
      startSize: rowHeights[rowIndex],
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!resizingRowRef.current) return;
      
      const delta = e.clientY - resizingRowRef.current.startPosition;
      const newHeight = Math.max(
        resizingRowRef.current.startSize + delta, 
        SPREADSHEET_CONSTANTS.MIN_ROW_HEIGHT
      );
      
      const newRowHeights = [...rowHeights];
      newRowHeights[resizingRowRef.current.index] = Math.min(
        newHeight, 
        SPREADSHEET_CONSTANTS.MAX_ROW_HEIGHT
      );
      setRowHeights(newRowHeights);
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      resizingRowRef.current = null;
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [rowHeights, setRowHeights]);
  
  return {
    onColMouseDown,
    onRowMouseDown,
  };
};