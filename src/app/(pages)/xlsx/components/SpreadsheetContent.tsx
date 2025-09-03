"use client";
import React, { useCallback } from 'react';
import { useSpreadsheetContext } from '../context/SpreadsheetContext';
import { useWorkbook } from '../hooks/useWorkbook';
import { useSpreadsheetKeyboard } from '../hooks/useSpreadsheetKeyboard';
import { useSpreadsheetSelection } from '../hooks/useSpreadsheetSelection';
import { useAutoSize } from '../hooks/useAutoSize';
import Toolbar from './Toolbar';
import Grid from './Grid';
import SheetTabs from './SheetTabs';

interface SpreadsheetContentProps {
  data: Blob;
  onSave: (file: File) => void;
  isSaving: boolean;
  isSaved: boolean;
}

const SpreadsheetContent: React.FC<SpreadsheetContentProps> = ({
  data,
  onSave,
  isSaving,
  isSaved,
}) => {
  const {
    sheetNames,
    currentSheet,
    useFirstRowAsHeader,
    setCurrentSheet,
    setUseFirstRowAsHeader,
  } = useSpreadsheetContext();
  
  const { saveWorkbook } = useWorkbook(data);
  const { autoSizeColumns } = useAutoSize();
  const {
    startEditing,
    navigateToCell,
    getNavigationBounds,
  } = useSpreadsheetSelection();
  
  const handleSave = useCallback(() => {
    const file = saveWorkbook();
    if (file) {
      onSave(file);
    }
  }, [saveWorkbook, onSave]);
  
  useSpreadsheetKeyboard({ 
    onSave: handleSave,
    startEditing,
    navigateToCell,
    getNavigationBounds,
  });
  
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <Toolbar
        onSave={handleSave}
        onAutoSize={autoSizeColumns}
        useFirstRowAsHeader={useFirstRowAsHeader}
        onToggleHeader={setUseFirstRowAsHeader}
        isSaving={isSaving}
        isSaved={isSaved}
      />
      
      <Grid />
      
      <SheetTabs
        sheetNames={sheetNames}
        currentSheet={currentSheet}
        onSheetChange={setCurrentSheet}
      />
    </div>
  );
};

export default SpreadsheetContent;