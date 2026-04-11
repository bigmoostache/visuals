"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useGetFile from '../../(hooks)/useGetFile';
import usePatchFile from '../../(hooks)/usePatchFile';
import { getFetchUrl } from '../../utils/getFetchUrl';
import { SpreadsheetProvider } from '../context/SpreadsheetContext';
import SpreadsheetContent from './SpreadsheetContent';

const SpreadsheetEditor: React.FC = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const fetchUrl = getFetchUrl(url);
  const { data, error: fetchError } = useGetFile({ fetchUrl: fetchUrl || '' });
  const { mutate, isLoading, isSuccess } = usePatchFile({ fetchUrl: url as string });
  
  if (fetchError) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="font-medium text-red-600 mb-2">Failed to load spreadsheet</p>
          <p className="text-sm text-slate-600 break-words">{fetchError.message}</p>
        </div>
      </div>
    );
  }
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