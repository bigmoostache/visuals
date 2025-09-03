"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { ToolbarProps } from '../types/spreadsheet';

const Toolbar: React.FC<ToolbarProps> = ({
  onSave,
  onAutoSize,
  useFirstRowAsHeader,
  onToggleHeader,
  isSaving,
  isSaved,
}) => {
  return (
    <div className="p-2 border-b border-gray-300 flex items-center gap-2 bg-gray-100">
      <Button onClick={onSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save'}
      </Button>
      
      <Button onClick={onAutoSize} variant="outline">
        Auto-size & Wrap
      </Button>
      
      <label className="flex items-center gap-2 ml-4">
        <input
          type="checkbox"
          checked={useFirstRowAsHeader}
          onChange={(e) => onToggleHeader(e.target.checked)}
        />
        Use first row as column titles
      </label>
    </div>
  );
};

export default Toolbar;