"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { SheetTabsProps } from '../types/spreadsheet';

const SheetTabs: React.FC<SheetTabsProps> = ({
  sheetNames,
  currentSheet,
  onSheetChange,
}) => {
  return (
    <div className="p-2 border-t border-gray-300 flex justify-start bg-gray-100">
      {sheetNames.map((sheetName) => (
        <Button
          key={sheetName}
          variant={sheetName === currentSheet ? 'default' : 'outline'}
          onClick={() => onSheetChange(sheetName)}
          className="mx-1"
        >
          {sheetName}
        </Button>
      ))}
    </div>
  );
};

export default SheetTabs;