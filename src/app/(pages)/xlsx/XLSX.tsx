"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';

// Removed imports for Input, Switch, Textarea, Card, Label as not needed now
// (We keep Button for saving and a simple checkbox for 'Use first row')

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
  const [selectedCell, setSelectedCell] = useState<{r: number; c: number} | null>(null);

  // Removed styling states (bold, italic, underline, fontSize, fontColor, fillColor)
  // Removed any references to applyStyles

  // For resizing
  const [colWidths, setColWidths] = useState<number[]>([]);
  const [rowHeights, setRowHeights] = useState<number[]>([]);

  // By default, checked
  const [useFirstRowAsHeader, setUseFirstRowAsHeader] = useState(true);

  const tableRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    // After the data is loaded and rendered, adjust row heights according to the rendered table cells
    requestAnimationFrame(() => {
      if (!tableRef.current) return;
      const rows = tableRef.current.querySelectorAll('tbody tr');
      const newRowHeights = Array.from(rows).map((rowEl) => {
        const rect = (rowEl as HTMLTableRowElement).getBoundingClientRect();
        return rect.height || 24;
      });
      setRowHeights(newRowHeights);
    });
  }, [sheetData, useFirstRowAsHeader]);

  const handleCellClick = (r: number, c: number) => {
    setSelectedCell({r, c});
  };

  const handleCellChange = (r: number, c: number, value: string) => {
    if (!workbook || !currentSheet) return;
    const ws = workbook.Sheets[currentSheet];
    const cell_addr = XLSX.utils.encode_cell({r,c});
    if (!ws[cell_addr]) {
      ws[cell_addr] = { t: 's', v: value };
    } else {
      ws[cell_addr].v = value;
      if (!isNaN(Number(value)) && value.trim() !== '') {
        ws[cell_addr].t = 'n';
        ws[cell_addr].v = Number(value);
      } else {
        ws[cell_addr].t = 's';
      }
    }
    const newData = [...sheetData];
    newData[r][c] = value;
    setSheetData(newData);
  };

  const saveFile = () => {
    if (!workbook) return;
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true});
    const file = new File([wbout], 'filename.xlsx', {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    mutate(file);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    let colsCount = (sheetData[0] || []).length;
    if (useFirstRowAsHeader && sheetData.length > 0) {
      // Use first row as headers
      return (
        <tr style={{height: 24}}>
          <th style={{width:rowHeaderWidth, border:'1px solid #ccc', background:'#eee', minWidth: rowHeaderWidth}}></th>
          {colWidths.map((w, colIndex) => (
            <th key={colIndex} style={{border:'1px solid #ccc', position:'relative', width:w, minWidth:w}}>
              {sheetData[0][colIndex]}
              <div
                style={{position:'absolute', top:0, right:0, width:'5px', cursor:'col-resize', height:'100%'}}
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
            <th key={colIndex} style={{border:'1px solid #ccc', position:'relative', width:w, minWidth:w}}>
              {columnName(colIndex)}
              <div
                style={{position:'absolute', top:0, right:0, width:'5px', cursor:'col-resize', height:'100%'}}
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
            let cellStyle: React.CSSProperties = {
              width: colWidths[c],
              minWidth: colWidths[c],
              maxWidth: colWidths[c],
              overflow:'auto', // allow scroll if content grows
              wordWrap:'break-word', // wrap text
              padding:'4px', 
              border:'1px solid #ccc',
              display:'table-cell', // ensure table cell behavior
              verticalAlign:'top' // text starts at top
            };
            return (
              <td key={c} 
                onClick={() => handleCellClick(actualRowIndex,c)} 
                style={cellStyle}>
                <textarea
                  style={{
                    width:'100%',
                    height:'100%',
                    resize:'none',
                    boxSizing:'border-box',
                    background:'transparent',
                    border:'none',
                    overflow:'auto',
                    display:'block',
                    fontSize:'14px',
                    lineHeight:'1.2',
                  }}
                  value={cell || ''}
                  onChange={(e)=>handleCellChange(actualRowIndex,c,e.target.value)}
                />
              </td>
            );
          })}
        </tr>
      );
    });
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      {/* Top toolbar (removed text styling, only keep save and checkbox) */}
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
      {/* Combine headers and table into one single table to remove extra space */}
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
