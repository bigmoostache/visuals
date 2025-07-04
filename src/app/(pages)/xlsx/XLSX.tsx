"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';

// Utility to convert number to Excel-like column name: 0 -> A, 1 -> B, ...
function columnName(n: number) {
  let str = "";
  while(n >= 0) {
    str = String.fromCharCode((n % 26) + 65) + str;
    n = Math.floor(n / 26) - 1;
  }
  return str;
}

export default function XLSXPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const { data } = useGetFile({fetchUrl: url as string});
  const { mutate, isLoading, isSuccess } = usePatchFile({fetchUrl: url as string});
  
  const [workbook, setWorkbook] = useState<XLSX.WorkBook>();
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string>('');
  const [sheetData, setSheetData] = useState<(string|number)[][]>([]);
  
  // Selection and editing state
  const [selectedCell, setSelectedCell] = useState<{r: number; c: number} | null>(null);
  const [editingCell, setEditingCell] = useState<{r: number; c: number} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // For resizing
  const [colWidths, setColWidths] = useState<number[]>([]);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  
  // By default, checked
  const [useFirstRowAsHeader, setUseFirstRowAsHeader] = useState(true);
  
  const tableRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const resizingColRef = useRef<{index: number; startX: number; startWidth: number} | null>(null);
  const resizingRowRef = useRef<{index: number; startY: number; startHeight: number} | null>(null);
  
  const rowHeaderWidth = 50; // Fixed width for row header

  useEffect(() => {
    if (!data) return;
    const fr = new FileReader();
    fr.onload = (e) => {
      const uint8Array = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(uint8Array, {type: 'array', cellStyles: true, cellNF: true});
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setCurrentSheet(wb.SheetNames[0]);
    };
    fr.readAsArrayBuffer(data);
  }, [data]);

  const loadCurrentSheet = () => {
    if (!workbook || !currentSheet) return;
    const ws = workbook.Sheets[currentSheet];
    if (!ws) return;
    
    // Convert to array
    const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
    const rows = [];
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const row = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({r:R,c:C});
        const cell = ws[cell_address];
        row.push(cell ? cell.v : "");
      }
      rows.push(row);
    }
    setSheetData(rows);
    
    const defaultColWidth = 100;
    const defaultRowHeight = 24;
    const newColWidths = new Array((rows[0]||[]).length).fill(defaultColWidth);
    const newRowHeights = new Array(rows.length).fill(defaultRowHeight);
    setColWidths(newColWidths);
    setRowHeights(newRowHeights);
  }

  useEffect(() => {
    loadCurrentSheet();
  }, [workbook, currentSheet]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (editingCell && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.select();
    }
  }, [editingCell]);

  const handleCellClick = (r: number, c: number) => {
    setSelectedCell({r, c});
  };

  const handleCellDoubleClick = (r: number, c: number) => {
    setEditingCell({r, c});
    setEditValue(String(sheetData[r][c] || ''));
  };

  const commitEdit = () => {
    if (!editingCell || !workbook || !currentSheet) return;
    
    const { r, c } = editingCell;
    const ws = workbook.Sheets[currentSheet];
    const cell_addr = XLSX.utils.encode_cell({r, c});
    
    if (!ws[cell_addr]) {
      ws[cell_addr] = { t: 's', v: editValue };
    } else {
      ws[cell_addr].v = editValue;
      if (!isNaN(Number(editValue)) && editValue.trim() !== '') {
        ws[cell_addr].t = 'n';
        ws[cell_addr].v = Number(editValue);
      } else {
        ws[cell_addr].t = 's';
      }
    }
    
    const newData = [...sheetData];
    newData[r][c] = editValue;
    setSheetData(newData);
    
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  // Global keyboard navigation
  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    // Save shortcut
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveFile();
      return;
    }

    // If we're editing, don't interfere with edit controls
    if (editingCell) return;

    // If no cell selected, select first cell
    if (!selectedCell) {
      const firstRow = useFirstRowAsHeader ? 1 : 0;
      if (sheetData.length > firstRow) {
        setSelectedCell({r: firstRow, c: 0});
      }
      return;
    }

    const { r, c } = selectedCell;
    const dataRows = useFirstRowAsHeader ? sheetData.slice(1) : sheetData;
    const maxRow = (useFirstRowAsHeader ? 1 : 0) + dataRows.length - 1;
    const maxCol = sheetData[0]?.length - 1 || 0;
    const minRow = useFirstRowAsHeader ? 1 : 0;

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
        // Enter starts editing mode
        handleCellDoubleClick(r, c);
        return;
      case 'F2':
        e.preventDefault();
        // F2 also starts editing mode
        handleCellDoubleClick(r, c);
        return;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        // Clear cell content
        // handleCellChange(r, c, '');
        return;
      default:
        // If it's a printable character, start editing with that character
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          setEditingCell({r, c});
          setEditValue(e.key);
          return;
        }
        return;
    }

    // Update selection if we moved
    if (newR !== r || newC !== c) {
      setSelectedCell({r: newR, c: newC});
      
      // Scroll selected cell into view
      setTimeout(() => {
        const cell = document.querySelector(`[data-cell="${newR}-${newC}"]`) as HTMLElement;
        if (cell) {
          cell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      }, 0);
    }
  };

  // Auto-size functionality - calculates optimal column widths and row heights
  const autoSizeColumns = () => {
    if (!sheetData.length) return;

    // Create a temporary canvas to measure text dimensions accurately
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = '12px Arial'; // Match cell font exactly
    
    const newColWidths = [...colWidths];
    const newRowHeights = [...rowHeights];
    
    const minColWidth = 60;
    const maxColWidth = 300;
    const minRowHeight = 24;
    const maxRowHeight = 200;
    const padding = 16; // Account for cell padding

    // Step 1: Calculate optimal column widths based on content
    for (let c = 0; c < sheetData[0]?.length || 0; c++) {
      let maxWidth = minColWidth;
      
      // Check header width if using first row as header
      if (useFirstRowAsHeader && sheetData[0]) {
        const headerText = String(sheetData[0][c] || '');
        const headerWidth = ctx.measureText(headerText).width + padding;
        maxWidth = Math.max(maxWidth, headerWidth);
      }
      
      // Check all data rows for maximum content width
      const dataRows = useFirstRowAsHeader ? sheetData.slice(1) : sheetData;
      for (let r = 0; r < dataRows.length; r++) {
        const cellText = String(dataRows[r][c] || '');
        // For long text, we'll let it wrap, so don't make columns too wide
        const singleLineWidth = ctx.measureText(cellText).width + padding;
        const reasonableWidth = Math.min(singleLineWidth, maxColWidth * 0.8);
        maxWidth = Math.max(maxWidth, reasonableWidth);
      }
      
      newColWidths[c] = Math.min(maxWidth, maxColWidth);
    }

    // Step 2: Calculate optimal row heights considering text wrapping
    const dataRows = useFirstRowAsHeader ? sheetData.slice(1) : sheetData;
    for (let r = 0; r < dataRows.length; r++) {
      const actualRowIndex = useFirstRowAsHeader ? r + 1 : r;
      let maxHeight = minRowHeight;
      
      for (let c = 0; c < dataRows[r].length; c++) {
        const cellText = String(dataRows[r][c] || '');
        const colWidth = newColWidths[c] - padding;
        
        if (cellText.length > 0) {
          // Simulate text wrapping to calculate height
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
          
          // Also account for explicit line breaks
          const explicitLines = cellText.split('\n').length;
          lines = Math.max(lines, explicitLines);
          
          const lineHeight = 16; // Approximate line height for 12px font
          const estimatedHeight = lines * lineHeight + 12; // Add padding
          maxHeight = Math.max(maxHeight, estimatedHeight);
        }
      }
      
      newRowHeights[actualRowIndex] = Math.min(maxHeight, maxRowHeight);
    }

    // Apply the calculated dimensions
    setColWidths(newColWidths);
    setRowHeights(newRowHeights);
  };

  const saveFile = () => {
    if (!workbook) return;
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true});
    const file = new File([wbout], 'filename.xlsx', {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    mutate(file);
  }

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedCell, editingCell, sheetData, useFirstRowAsHeader, workbook]);

  // Column resizing
  const onColMouseDown = (e: React.MouseEvent<HTMLDivElement>, colIndex: number) => {
    e.preventDefault();
    resizingColRef.current = {
      index: colIndex,
      startX: e.clientX,
      startWidth: colWidths[colIndex],
    };
    document.addEventListener('mousemove', onColMouseMove);
    document.addEventListener('mouseup', onColMouseUp);
  };

  const onColMouseMove = (e: MouseEvent) => {
    if (!resizingColRef.current) return;
    const delta = e.clientX - resizingColRef.current.startX;
    const newWidth = Math.max(resizingColRef.current.startWidth + delta, 30);
    const newColWidths = [...colWidths];
    newColWidths[resizingColRef.current.index] = newWidth;
    setColWidths(newColWidths);
  };

  const onColMouseUp = (e: MouseEvent) => {
    document.removeEventListener('mousemove', onColMouseMove);
    document.removeEventListener('mouseup', onColMouseUp);
    resizingColRef.current = null;
  };

  // Row resizing
  const onRowMouseDown = (e: React.MouseEvent<HTMLDivElement>, rowIndex: number) => {
    e.preventDefault();
    resizingRowRef.current = {
      index: rowIndex,
      startY: e.clientY,
      startHeight: rowHeights[rowIndex],
    };
    document.addEventListener('mousemove', onRowMouseMove);
    document.addEventListener('mouseup', onRowMouseUp);
  };

  const onRowMouseMove = (e: MouseEvent) => {
    if (!resizingRowRef.current) return;
    const delta = e.clientY - resizingRowRef.current.startY;
    const newHeight = Math.max(resizingRowRef.current.startHeight + delta, 15);
    const newRowHeights = [...rowHeights];
    newRowHeights[resizingRowRef.current.index] = newHeight;
    setRowHeights(newRowHeights);
  };

  const onRowMouseUp = (e: MouseEvent) => {
    document.removeEventListener('mousemove', onRowMouseMove);
    document.removeEventListener('mouseup', onRowMouseUp);
    resizingRowRef.current = null;
  };

  // Render column headers
  const renderColumnHeaders = () => {
    if (useFirstRowAsHeader && sheetData.length > 0) {
      // Use first row as headers
      return (
        <tr style={{height: 24}}>
          <th style={{width:rowHeaderWidth, background:'#eee', minWidth: rowHeaderWidth}}></th>
          {colWidths.map((w, colIndex) => (
            <th
            key={colIndex}
            style={{position:'relative', background:'#eee', width:w, minWidth:w, fontSize:'14px', lineHeight:'1.2', padding:'5px 10px'}}
            >
              {sheetData[0][colIndex]}
                <div
                style={{position:'absolute', top:0, right:0, cursor:'col-resize', height:'100%', width:'2px', background:'#cfc9c8'}}
                onMouseDown={(e)=>onColMouseDown(e,colIndex)}
                ></div>
            </th>
          ))}
        </tr>
      );
    } else {
      // Use normal A,B,C...
      return (
        <tr style={{height: 24}}>
          <th style={{width:rowHeaderWidth, border:'1px solid #ccc', background:'#eee', minWidth: rowHeaderWidth}}></th>
          {colWidths.map((w, colIndex) => (
            <th key={colIndex} style={{position:'relative', background:'#eee', width:w, minWidth:w, fontSize:'14px', lineHeight:'1.2', padding:'5px 10px'}}>
              {columnName(colIndex)}
              <div
                style={{position:'absolute', top:0, right:0, cursor:'col-resize', height:'100%', width:'2px', background:'#cfc9c8'}}
                onMouseDown={(e)=>onColMouseDown(e,colIndex)}
              ></div>
            </th>
          ))}
        </tr>
      );
    }
  };

  // Render rows
  const renderRows = () => {
    const dataRows = useFirstRowAsHeader ? sheetData.slice(1) : sheetData;
    return dataRows.map((row, r) => {
      const actualRowIndex = useFirstRowAsHeader ? r+1 : r;
      return (
        <tr key={r} style={{height:rowHeights[actualRowIndex] || 24}}>
          <th style={{width:rowHeaderWidth, border:'1px solid #ccc', position:'relative', background:'#eee', minWidth: rowHeaderWidth}}>
            {actualRowIndex+1}
            <div
              style={{position:'absolute', bottom:0, left:0, height:'5px', cursor:'row-resize', width:'100%'}}
              onMouseDown={(e)=>onRowMouseDown(e,actualRowIndex)}
            ></div>
          </th>
          {row.map((cell, c) => {
            const cellHeight = rowHeights[actualRowIndex] || 24;
            const isSelected = selectedCell?.r === actualRowIndex && selectedCell?.c === c;
            const isEditing = editingCell?.r === actualRowIndex && editingCell?.c === c;
            
            let cellStyle: React.CSSProperties = {
              width: colWidths[c],
              minWidth: colWidths[c],
              maxWidth: colWidths[c],
              wordWrap: 'break-word',
              padding: '4px',
              border: '1px solid #ccc',
              display: 'table-cell',
              verticalAlign: 'top',
              height: cellHeight,
              position: 'relative',
              backgroundColor: isSelected ? '#e3f2fd' : 'white',
              cursor: 'cell',
              // Add visual focus indicator
              boxShadow: isSelected ? 'inset 0 0 0 2px #1976d2' : 'none'
            };
            
            return (
              <td 
                key={c}
                data-cell={`${actualRowIndex}-${c}`}
                onClick={() => handleCellClick(actualRowIndex, c)}
                onDoubleClick={() => handleCellDoubleClick(actualRowIndex, c)}
                style={cellStyle}
              >
                {isEditing ? (
                  <textarea
                    ref={editTextareaRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      resize: 'none',
                      boxSizing: 'border-box',
                      background: 'white',
                      border: '2px solid #2196f3',
                      overflow: 'auto',
                      display: 'block',
                      fontSize: '12px',
                      lineHeight: '1.2',
                      padding: '2px',
                    }}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={commitEdit}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      fontSize: '12px',
                      lineHeight: '1.3',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '2px'
                    }}
                  >
                    {cell}
                  </div>
                )}
              </td>
            );
          })}
        </tr>
      );
    });
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      {/* Top toolbar */}
      <div className="p-2 border-b border-gray-300 flex items-center gap-2 bg-gray-100">
        <Button onClick={saveFile} disabled={isLoading}>
          {isLoading ? 'Saving...' : isSuccess ? 'Saved!' : 'Save'}
        </Button>
        <Button onClick={autoSizeColumns} variant="outline">
          📏 Auto-size & Wrap
        </Button>
        <label className="flex items-center gap-2 ml-4">
          <input
            type="checkbox"
            checked={useFirstRowAsHeader}
            onChange={(e)=>setUseFirstRowAsHeader(e.target.checked)}
          />
          Use first row as column titles
        </label>
      </div>
      
      {/* Main table container */}
      <div 
        className="flex-1 overflow-auto" 
        ref={tableRef} 
        style={{position:'relative'}}
        tabIndex={0}
        onFocus={() => {
          // Auto-select first cell if none selected
          if (!selectedCell && sheetData.length > 0) {
            const firstRow = useFirstRowAsHeader ? 1 : 0;
            if (sheetData.length > firstRow) {
              setSelectedCell({r: firstRow, c: 0});
            }
          }
        }}
      >
        <table style={{borderCollapse:'collapse', tableLayout:'fixed', width:'max-content'}}>
          <thead style={{position:'sticky', top:0, background:'#f5f5f5', zIndex:2}}>
            {renderColumnHeaders()}
          </thead>
          <tbody>
            {renderRows()}
          </tbody>
        </table>
      </div>
      
      {/* Bottom sheet selector */}
      <div className="p-2 border-t border-gray-300 flex justify-start bg-gray-100">
        {sheetNames.map(sn => (
          <Button
            key={sn}
            variant={sn===currentSheet?'default':'outline'}
            onClick={()=>setCurrentSheet(sn)}
            className="mx-1"
          >
            {sn}
          </Button>
        ))}
      </div>
    </div>
  );
}