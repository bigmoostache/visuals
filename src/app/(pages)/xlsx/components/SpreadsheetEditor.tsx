"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useGetFile from '../../(hooks)/useGetFile';
import usePatchFile from '../../(hooks)/usePatchFile';
import { SpreadsheetProvider } from '../context/SpreadsheetContext';
import SpreadsheetContent from './SpreadsheetContent';

const SpreadsheetEditor: React.FC = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const { data } = useGetFile({ fetchUrl: url as string });
  const { mutate, isLoading, isSuccess } = usePatchFile({ fetchUrl: url as string });
  
  if (!data) {
    return <div className="w-screen h-screen flex items-center justify-center">Loading spreadsheet...</div>;
  }
  
  return (
    <SpreadsheetProvider>
      <SpreadsheetContent
        data={data}
        onSave={mutate}
        isSaving={isLoading}
        isSaved={isSuccess}
      />
    </SpreadsheetProvider>
  );
};

export default SpreadsheetEditor;