"use client";
import React, { memo } from 'react';
import { ColumnHeaderProps } from '../../types/spreadsheet';
import { SPREADSHEET_CONSTANTS } from '../../constants';

const ColumnHeader: React.FC<ColumnHeaderProps> = memo(({
  colIndex,
  width,
  label,
  onResize,
}) => {
  return (
    <th
      style={{
        position: 'relative',
        background: SPREADSHEET_CONSTANTS.COLORS.COL_HEADER_BG,
        width,
        minWidth: width,
        fontSize: SPREADSHEET_CONSTANTS.HEADER_FONT_SIZE,
        lineHeight: '1.2',
        padding: '5px 10px',
      }}
    >
      {label}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          cursor: 'col-resize',
          height: '100%',
          width: `${SPREADSHEET_CONSTANTS.RESIZE_HANDLE_WIDTH}px`,
          background: SPREADSHEET_CONSTANTS.RESIZE_HANDLE_COLOR,
        }}
        onMouseDown={(e) => onResize(e, colIndex)}
      />
    </th>
  );
});

ColumnHeader.displayName = 'ColumnHeader';

export default ColumnHeader;