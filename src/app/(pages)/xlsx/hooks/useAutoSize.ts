import { useCallback } from 'react';
import { useSpreadsheetContext } from '../context/SpreadsheetContext';
import { SPREADSHEET_CONSTANTS } from '../constants';

export const useAutoSize = () => {
  const {
    sheetData,
    useFirstRowAsHeader,
    setColWidths,
    setRowHeights,
  } = useSpreadsheetContext();
  
  const autoSizeColumns = useCallback(() => {
    if (!sheetData.length) return;
    
    // Create a temporary canvas to measure text dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.font = `${SPREADSHEET_CONSTANTS.FONT_SIZE} ${SPREADSHEET_CONSTANTS.FONT_FAMILY}`;
    
    const newColWidths: number[] = [];
    const newRowHeights: number[] = [];
    
    const { MIN_COL_WIDTH, MAX_COL_WIDTH, MIN_ROW_HEIGHT, MAX_ROW_HEIGHT, CELL_PADDING } = SPREADSHEET_CONSTANTS;
    
    // Step 1: Calculate optimal column widths
    for (let c = 0; c < (sheetData[0]?.length || 0); c++) {
      let maxWidth = MIN_COL_WIDTH;
      
      // Check header width if using first row as header
      if (useFirstRowAsHeader && sheetData[0]) {
        const headerText = String(sheetData[0][c] || '');
        const headerWidth = ctx.measureText(headerText).width + CELL_PADDING;
        maxWidth = Math.max(maxWidth, headerWidth);
      }
      
      // Check all data rows for maximum content width
      const dataRows = useFirstRowAsHeader ? sheetData.slice(1) : sheetData;
      for (let r = 0; r < dataRows.length; r++) {
        const cellText = String(dataRows[r][c] || '');
        const singleLineWidth = ctx.measureText(cellText).width + CELL_PADDING;
        const reasonableWidth = Math.min(singleLineWidth, MAX_COL_WIDTH * 0.8);
        maxWidth = Math.max(maxWidth, reasonableWidth);
      }
      
      newColWidths[c] = Math.min(maxWidth, MAX_COL_WIDTH);
    }
    
    // Step 2: Calculate optimal row heights considering text wrapping
    const dataRows = useFirstRowAsHeader ? sheetData.slice(1) : sheetData;
    
    // Header row height (if using first row as header)
    if (useFirstRowAsHeader) {
      newRowHeights[0] = SPREADSHEET_CONSTANTS.HEADER_HEIGHT;
    }
    
    for (let r = 0; r < dataRows.length; r++) {
      const actualRowIndex = useFirstRowAsHeader ? r + 1 : r;
      let maxHeight = MIN_ROW_HEIGHT;
      
      for (let c = 0; c < dataRows[r].length; c++) {
        const cellText = String(dataRows[r][c] || '');
        const colWidth = newColWidths[c] - CELL_PADDING;
        
        if (cellText.length > 0) {
          // Estimate wrapped lines
          const words = cellText.split(/\s+/);
          let lines = 1;
          let currentLineWidth = 0;
          
          for (const word of words) {
            const wordWidth = ctx.measureText(word + ' ').width;
            
            if (currentLineWidth + wordWidth > colWidth && currentLineWidth > 0) {
              lines++;
              currentLineWidth = wordWidth;
            } else {
              currentLineWidth += wordWidth;
            }
          }
          
          // Account for explicit line breaks
          const explicitLines = cellText.split('\n').length;
          lines = Math.max(lines, explicitLines);
          
          const estimatedHeight = lines * SPREADSHEET_CONSTANTS.LINE_HEIGHT + SPREADSHEET_CONSTANTS.CELL_VERTICAL_PADDING;
          maxHeight = Math.max(maxHeight, estimatedHeight);
        }
      }
      
      newRowHeights[actualRowIndex] = Math.min(maxHeight, MAX_ROW_HEIGHT);
    }
    
    // Apply the calculated dimensions
    setColWidths(newColWidths);
    setRowHeights(newRowHeights);
  }, [sheetData, useFirstRowAsHeader, setColWidths, setRowHeights]);
  
  return {
    autoSizeColumns,
  };
};