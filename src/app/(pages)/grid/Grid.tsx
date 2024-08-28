"use client";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import JsonFetcher from './components/JsonFetcher'; // Import the JsonFetcher component
import Table4 from './components/Table4'; // Import the Table4 component

const Grid = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  return (
    <div className="w-screen relative bg-white-200 overflow-hidden">
      <JsonFetcher url={url}>
        {(data) => {
          return (
            <>
              <div>
                {/* <h1>This is Table4</h1> */}
                <Table4 jsonData={data.rows} /> {/* Pass data.rows to Table4 */}
              </div>
            </>
          );
        }}
      </JsonFetcher>
    </div>
  );
};

const GridPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Grid />
    </Suspense>
  );
};

export default GridPage;

