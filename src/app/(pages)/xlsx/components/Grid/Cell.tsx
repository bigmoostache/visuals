"use client";
import React, { memo } from 'react';
import { CellProps } from '../../types/spreadsheet';
import { SPREADSHEET_CONSTANTS } from '../../constants';

const Cell: React.FC<CellProps> = memo(({
  rowIndex,
  colIndex,
  value,
  isSelected,
  isEditing,
  height,
  width,
  onCellClick,
  onCellDoubleClick,
  editValue,
  onEditChange,
  onEditKeyDown,
  onEditBlur,
}) => {
  const cellStyle: React.CSSProperties = {
    width,
    minWidth: width,
    maxWidth: width,
    wordWrap: 'break-word',
    padding: '4px',
    border: `1px solid ${SPREADSHEET_CONSTANTS.COLORS.BORDER}`,
    display: 'table-cell',
    verticalAlign: 'top',
    height,
    position: 'relative',
    backgroundColor: isSelected 
      ? SPREADSHEET_CONSTANTS.COLORS.SELECTED_CELL 
      : SPREADSHEET_CONSTANTS.COLORS.CELL_BG,
    cursor: 'cell',
    boxShadow: isSelected ? SPREADSHEET_CONSTANTS.CELL_FOCUS_SHADOW : 'none',
  };
  
  return (
    <td
      data-cell={`${rowIndex}-${colIndex}`}
      onClick={() => onCellClick(rowIndex, colIndex)}
      onDoubleClick={() => onCellDoubleClick(rowIndex, colIndex)}
      style={cellStyle}
    >
      {isEditing ? (
        <textarea
          style={{
            width: '100%',
            height: '100%',
            resize: 'none',
            boxSizing: 'border-box',
            background: 'white',
            border: `2px solid ${SPREADSHEET_CONSTANTS.COLORS.EDITING_BORDER}`,
            overflow: 'auto',
            display: 'block',
            fontSize: SPREADSHEET_CONSTANTS.FONT_SIZE,
            lineHeight: '1.2',
            padding: '2px',
          }}
          value={editValue}
          onChange={(e) => onEditChange?.(e.target.value)}
          onKeyDown={onEditKeyDown}
          onBlur={onEditBlur}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            fontSize: SPREADSHEET_CONSTANTS.FONT_SIZE,
            lineHeight: '1.3',
            overflow: 'hidden',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            display: 'flex',
            alignItems: 'flex-start',
            padding: '2px',
          }}
        >
          {value}
        </div>
      )}
    </td>
  );
});

Cell.displayName = 'Cell';

export default Cell;