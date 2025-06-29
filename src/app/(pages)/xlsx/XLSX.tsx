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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const saveFile = () => {
    if (!workbook) return;
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true});
    const file = new File([wbout], 'filename.xlsx', {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    mutate(file);
  }

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [workbook]);

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
              overflow: 'hidden',
              wordWrap: 'break-word',
              padding: '4px',
              border: '1px solid #ccc',
              display: 'table-cell',
              verticalAlign: 'top',
              height: cellHeight,
              position: 'relative',
              backgroundColor: isSelected ? '#e3f2fd' : 'white',
              cursor: 'cell'
            };
            
            return (
              <td 
                key={c}
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
                    onKeyDown={handleKeyDown}
                    onBlur={commitEdit}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      fontSize: '12px',
                      lineHeight: '1.2',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {cell || ''}
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
      <div className="flex-1 overflow-auto" ref={tableRef} style={{position:'relative'}}>
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