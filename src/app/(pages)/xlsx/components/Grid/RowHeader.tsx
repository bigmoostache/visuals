"use client";
import React, { memo } from 'react';
import { RowHeaderProps } from '../../types/spreadsheet';
import { SPREADSHEET_CONSTANTS } from '../../constants';

const RowHeader: React.FC<RowHeaderProps> = memo(({
  rowIndex,
  height,
  label,
  onResize,
}) => {
  return (
    <th
      style={{
        width: SPREADSHEET_CONSTANTS.ROW_HEADER_WIDTH,
        border: `1px solid ${SPREADSHEET_CONSTANTS.COLORS.BORDER}`,
        position: 'relative',
        background: SPREADSHEET_CONSTANTS.COLORS.ROW_HEADER_BG,
        minWidth: SPREADSHEET_CONSTANTS.ROW_HEADER_WIDTH,
      }}
    >
      {label}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: `${SPREADSHEET_CONSTANTS.RESIZE_HANDLE_WIDTH}px`,
          cursor: 'row-resize',
          width: '100%',
        }}
        onMouseDown={(e) => onResize(e, rowIndex)}
      />
    </th>
  );
});

RowHeader.displayName = 'RowHeader';

export default RowHeader;