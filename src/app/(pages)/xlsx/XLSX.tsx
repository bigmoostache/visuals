"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

// Simple color pickers
const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00","#00FFFF","#FF00FF","#FFFFFF","#C0C0C0","#808080"];
const bgColors = ["#FFFFFF", "#EEE8AA","#FFD700","#ADFF2F","#7FFFD4","#87CEEB","#DDA0DD","#FFC0CB","#F5F5DC","#C0C0C0"];

// Font sizes
const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

// This component will:
// - Load xlsx from the server
// - Display sheets in a table
// - Provide a toolbar for styling (bold, italic, underline, font size, text color, cell bg color)
// - Allow selecting a sheet from a bottom menu
// - On ctrl+s or Save button, re-upload the modified XLSX

interface CellPosition {
  r: number;
  c: number;
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
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);

  // Styling states
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [fontSize, setFontSize] = useState<number|undefined>(undefined);
  const [fontColor, setFontColor] = useState<string|undefined>(undefined);
  const [fillColor, setFillColor] = useState<string|undefined>(undefined);

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
  }

  useEffect(() => {
    loadCurrentSheet();
  }, [workbook, currentSheet]);

  // Handle cell selection
  const handleCellClick = (r: number, c: number) => {
    setSelectedCell({r, c});
    // Load current style from the cell
    if (workbook && currentSheet) {
      const ws = workbook.Sheets[currentSheet];
      const cell_addr = XLSX.utils.encode_cell({r,c});
      const cell = ws[cell_addr];
      if (cell && cell.s && cell.s.font) {
        setBold(!!cell.s.font.bold);
        setItalic(!!cell.s.font.italic);
        setUnderline(!!cell.s.font.underline);
        setFontSize(cell.s.font.sz);
        setFontColor(cell.s.font.color?.rgb ? "#" + cell.s.font.color.rgb.slice(2) : undefined);
      } else {
        setBold(false);
        setItalic(false);
        setUnderline(false);
        setFontSize(undefined);
        setFontColor(undefined);
      }
      if (cell && cell.s && cell.s.fill && cell.s.fill.fgColor) {
        const fg = cell.s.fill.fgColor.rgb;
        if (fg) {
          setFillColor("#"+fg.slice(2));
        } else {
          setFillColor(undefined);
        }
      } else {
        setFillColor(undefined);
      }
    }
  };

  // Apply style changes to the selected cell
  const applyStyles = () => {
    if (!selectedCell || !workbook || !currentSheet) return;
    const ws = workbook.Sheets[currentSheet];
    const cell_addr = XLSX.utils.encode_cell({r:selectedCell.r,c:selectedCell.c});
    if (!ws[cell_addr]) {
      ws[cell_addr] = { t: 's', v: '', s:{}};
    }
    if (!ws[cell_addr].s) ws[cell_addr].s = {};
    if (!ws[cell_addr].s.font) ws[cell_addr].s.font = {};

    // Font styles
    ws[cell_addr].s.font.bold = bold || undefined;
    ws[cell_addr].s.font.italic = italic || undefined;
    ws[cell_addr].s.font.underline = underline ? true : undefined;
    ws[cell_addr].s.font.sz = fontSize || undefined;
    if (fontColor) {
      // Convert #RRGGBB to Argb form: FF + RRGGBB
      let hex = fontColor.replace('#','').toUpperCase();
      if (hex.length === 3) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      }
      ws[cell_addr].s.font.color = {rgb:"FF"+hex};
    } else {
      delete ws[cell_addr].s.font.color;
    }

    // Fill color
    if (fillColor) {
      let hex = fillColor.replace('#','').toUpperCase();
      if (hex.length === 3) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      }
      if (!ws[cell_addr].s.fill) ws[cell_addr].s.fill = {};
      ws[cell_addr].s.fill = {
        patternType: "solid",
        fgColor: {rgb:"FF"+hex},
        bgColor: {indexed:64}
      };
    } else {
      if (ws[cell_addr].s.fill) {
        delete ws[cell_addr].s.fill;
      }
    }

    // Refresh UI
    loadCurrentSheet();
  }

  useEffect(() => {
    applyStyles();
  }, [bold, italic, underline, fontSize, fontColor, fillColor]);

  const handleCellChange = (r: number, c: number, value: string) => {
    if (!workbook || !currentSheet) return;
    const ws = workbook.Sheets[currentSheet];
    const cell_addr = XLSX.utils.encode_cell({r,c});
    if (!ws[cell_addr]) {
      ws[cell_addr] = { t: 's', v: value };
    } else {
      ws[cell_addr].v = value;
      if (typeof value === 'number') {
        ws[cell_addr].t = 'n';
      } else {
        ws[cell_addr].t = 's';
      }
    }
    // Update local sheetData
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

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Top toolbar */}
      <div className="p-2 border-b border-gray-300 flex items-center gap-2 bg-gray-100">
        <Button variant={bold ? 'default': 'outline'} onClick={() => setBold(!bold)}>B</Button>
        <Button variant={italic ? 'default': 'outline'} onClick={() => setItalic(!italic)}><i>I</i></Button>
        <Button variant={underline ? 'default': 'outline'} onClick={() => setUnderline(!underline)}><u>U</u></Button>
        <select
          className="border rounded p-1"
          value={fontSize || ''}
          onChange={(e) => {
            const val = parseInt(e.target.value,10);
            setFontSize(isNaN(val) ? undefined : val);
          }}>
          <option value="">Font Size</option>
          {fontSizes.map(sz => <option key={sz} value={sz}>{sz}</option>)}
        </select>
        <select
          className="border rounded p-1"
          value={fontColor || ''}
          onChange={(e) => {
            const val = e.target.value;
            setFontColor(val || undefined);
          }}>
          <option value="">Text Color</option>
          {colors.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="border rounded p-1"
          value={fillColor || ''}
          onChange={(e) => {
            const val = e.target.value;
            setFillColor(val || undefined);
          }}>
          <option value="">Cell Color</option>
          {bgColors.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <Button onClick={saveFile} disabled={isLoading}>
          {isLoading ? 'Saving...' : isSuccess ? 'Saved!' : <Save/>}
        </Button>
      </div>

      {/* Main table */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse w-full">
          <tbody>
            {sheetData.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => {
                  // extract style
                  let cellStyle: React.CSSProperties = {};
                  if (workbook && currentSheet) {
                    const ws = workbook.Sheets[currentSheet];
                    const cell_addr = XLSX.utils.encode_cell({r,c});
                    const xcell = ws[cell_addr];
                    if (xcell && xcell.s) {
                      if (xcell.s.font) {
                        if (xcell.s.font.bold) cellStyle.fontWeight = 'bold';
                        if (xcell.s.font.italic) cellStyle.fontStyle = 'italic';
                        if (xcell.s.font.underline) cellStyle.textDecoration = 'underline';
                        if (xcell.s.font.sz) cellStyle.fontSize = xcell.s.font.sz+'px';
                        if (xcell.s.font.color && xcell.s.font.color.rgb) {
                          cellStyle.color = '#'+xcell.s.font.color.rgb.slice(2);
                        }
                      }
                      if (xcell.s.fill && xcell.s.fill.fgColor && xcell.s.fill.fgColor.rgb) {
                        cellStyle.backgroundColor = '#'+xcell.s.fill.fgColor.rgb.slice(2);
                      }
                    }
                  }
                  return (
                    <td key={c} 
                      onClick={() => handleCellClick(r,c)} 
                      style={{border:'1px solid #ccc', padding:'4px', ...cellStyle}}>
                      <input 
                        className="w-full bg-transparent border-none focus:outline-none"
                        value={cell || ''}
                        onChange={(e)=>handleCellChange(r,c,e.target.value)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom sheet selector */}
      <div className="p-2 border-t border-gray-300 flex justify-center bg-gray-100">
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
