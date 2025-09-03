"use client";
import React, { useRef, useEffect } from 'react';
import { useSpreadsheetContext } from '../../context/SpreadsheetContext';
import { useSpreadsheetSelection } from '../../hooks/useSpreadsheetSelection';
import { useSpreadsheetResize } from '../../hooks/useSpreadsheetResize';
import { columnName } from '../../utils/spreadsheet';
import { SPREADSHEET_CONSTANTS } from '../../constants';
import Cell from './Cell';
import ColumnHeader from './ColumnHeader';
import RowHeader from './RowHeader';

const Grid: React.FC = () => {
  const {
    sheetData,
    colWidths,
    rowHeights,
    useFirstRowAsHeader,
    selection,
    setEditValue,
  } = useSpreadsheetContext();
  
  const {
    editTextareaRef,
    handleCellClick,
    handleCellDoubleClick,
    handleEditKeyDown,
    commitEdit,
  } = useSpreadsheetSelection();
  
  const { onColMouseDown, onRowMouseDown } = useSpreadsheetResize();
  
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Focus table on mount for keyboard navigation
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.focus();
    }
  }, []);
  
  // Render column headers
  const renderColumnHeaders = () => {
    if (useFirstRowAsHeader && sheetData.length > 0) {
      return (
        <tr style={{ height: SPREADSHEET_CONSTANTS.HEADER_HEIGHT }}>
          <th
            style={{
              width: SPREADSHEET_CONSTANTS.ROW_HEADER_WIDTH,
              background: SPREADSHEET_CONSTANTS.COLORS.HEADER_BG,
              minWidth: SPREADSHEET_CONSTANTS.ROW_HEADER_WIDTH,
            }}
          />
          {colWidths.map((width, colIndex) => (
            <ColumnHeader
              key={colIndex}
              colIndex={colIndex}
              width={width}
              label={String(sheetData[0][colIndex] || '')}
              onResize={onColMouseDown}
            />
          ))}
        </tr>
      );
    } else {
      return (
        <tr style={{ height: SPREADSHEET_CONSTANTS.HEADER_HEIGHT }}>
          <th
            style={{
              width: SPREADSHEET_CONSTANTS.ROW_HEADER_WIDTH,
              border: `1px solid ${SPREADSHEET_CONSTANTS.COLORS.BORDER}`,
              background: SPREADSHEET_CONSTANTS.COLORS.HEADER_BG,
              minWidth: SPREADSHEET_CONSTANTS.ROW_HEADER_WIDTH,
            }}
          />
          {colWidths.map((width, colIndex) => (
            <ColumnHeader
              key={colIndex}
              colIndex={colIndex}
              width={width}
              label={columnName(colIndex)}
              onResize={onColMouseDown}
            />
          ))}
        </tr>
      );
    }
  };
  
  // Render data rows
  const renderRows = () => {
    const dataRows = useFirstRowAsHeader ? sheetData.slice(1) : sheetData;
    
    return dataRows.map((row, r) => {
      const actualRowIndex = useFirstRowAsHeader ? r + 1 : r;
      
      return (
        <tr key={r} style={{ height: rowHeights[actualRowIndex] || SPREADSHEET_CONSTANTS.DEFAULT_ROW_HEIGHT }}>
          <RowHeader
            rowIndex={actualRowIndex}
            height={rowHeights[actualRowIndex] || SPREADSHEET_CONSTANTS.DEFAULT_ROW_HEIGHT}
            label={actualRowIndex + 1}
            onResize={onRowMouseDown}
          />
          {row.map((cellValue, c) => {
            const isSelected = selection.selectedCell?.r === actualRowIndex && selection.selectedCell?.c === c;
            const isEditing = selection.editingCell?.r === actualRowIndex && selection.editingCell?.c === c;
            
            return (
              <Cell
                key={c}
                rowIndex={actualRowIndex}
                colIndex={c}
                value={cellValue}
                isSelected={isSelected}
                isEditing={isEditing}
                height={rowHeights[actualRowIndex] || SPREADSHEET_CONSTANTS.DEFAULT_ROW_HEIGHT}
                width={colWidths[c]}
                onCellClick={handleCellClick}
                onCellDoubleClick={handleCellDoubleClick}
                editValue={isEditing ? selection.editValue : undefined}
                onEditChange={isEditing ? setEditValue : undefined}
                onEditKeyDown={isEditing ? handleEditKeyDown : undefined}
                onEditBlur={isEditing ? commitEdit : undefined}
              />
            );
          })}
        </tr>
      );
    });
  };
  
  return (
    <div 
      className="flex-1 overflow-auto"
      ref={tableRef}
      style={{ position: 'relative' }}
      tabIndex={0}
    >
      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: 'max-content' }}>
        <thead style={{ position: 'sticky', top: 0, background: SPREADSHEET_CONSTANTS.COLORS.GRID_BG, zIndex: 2 }}>
          {renderColumnHeaders()}
        </thead>
        <tbody>
          {renderRows()}
        </tbody>
      </table>
    </div>
  );
};

export default Grid;