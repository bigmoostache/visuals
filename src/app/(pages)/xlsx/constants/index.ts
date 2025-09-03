export const SPREADSHEET_CONSTANTS = {
  // Dimensions
  DEFAULT_COL_WIDTH: 100 as number,
  DEFAULT_ROW_HEIGHT: 24 as number,
  MIN_COL_WIDTH: 30 as number,
  MAX_COL_WIDTH: 300 as number,
  MIN_ROW_HEIGHT: 15 as number,
  MAX_ROW_HEIGHT: 200 as number,
  ROW_HEADER_WIDTH: 50 as number,
  HEADER_HEIGHT: 24 as number,
  
  // Cell padding and sizing
  CELL_PADDING: 16 as number,
  CELL_VERTICAL_PADDING: 12 as number,
  
  // Text and font
  FONT_SIZE: '12px',
  FONT_FAMILY: 'Arial',
  LINE_HEIGHT: 16 as number,
  HEADER_FONT_SIZE: '14px',
  
  // Resizing
  RESIZE_HANDLE_WIDTH: 5 as number,
  RESIZE_HANDLE_COLOR: '#cfc9c8',
  
  // Colors
  COLORS: {
    SELECTED_CELL: '#e3f2fd',
    SELECTED_BORDER: '#1976d2',
    EDITING_BORDER: '#2196f3',
    HEADER_BG: '#eee',
    GRID_BG: '#f5f5f5',
    BORDER: '#ccc',
    ROW_HEADER_BG: '#eee',
    COL_HEADER_BG: '#eee',
    CELL_BG: 'white',
    TOOLBAR_BG: '#f9f9f9',
  },
  
  // Performance
  DEBOUNCE_DELAY: 150,
  AUTO_SAVE_DELAY: 5000,
  
  // Keyboard shortcuts
  SAVE_SHORTCUT: 'ctrl+s',
  
  // Styling classes
  CELL_FOCUS_SHADOW: 'inset 0 0 0 2px #1976d2',
};

export const KEYBOARD_SHORTCUTS = {
  SAVE: ['ctrl+s', 'cmd+s'],
  EDIT: ['Enter', 'F2'],
  CANCEL_EDIT: ['Escape'],
  DELETE: ['Delete', 'Backspace'],
  NAVIGATE: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'],
} as const;