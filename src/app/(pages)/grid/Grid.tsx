"use client";

import { Suspense } from 'react';
import { GridEditor } from './components/GridEditor';
import { GridSkeleton } from './components/GridSkeleton';

const Grid = () => {
  return (
    <Suspense fallback={<GridSkeleton />}>
      <GridEditor />
    </Suspense>
  );
};

export default Grid;