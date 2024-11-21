"use client";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import JsonFetcher from './components/JsonFetcher'; // Import the JsonFetcher component
import Table4 from './components/Table4'; // Import the Table4 component
import Table5 from './components/Table5';
import Table2 from './components/Table2';
import Table3 from './components/Table3';

const Grid = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

//   return (
//     <div className="w-screen relative bg-white-200 overflow-hidden">
//       <JsonFetcher url={url}>
//         {(data) => {
//           return (
//             <>
//               <div>
//                 <h1>This is Table4</h1>
//                 <Table4 jsonData={data.rows} /> {/* Pass data.rows to Table4 */}
//               </div>
//             </>
//           );
//         }}
//       </JsonFetcher>
//     </div>
//   );
// };

  return (
    <div className="w-screen h-screen relative bg-white-200 ">
      {/* Hello World */}
   <h1>This is Table5</h1>

      <Table5 />

      {/* <h1>This is Table2</h1>

      <Table2 />

      <h1>This is Table3</h1>

      <Table3 /> */}

    </div>
  );
}

const GridPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Grid />
    </Suspense>
  );
};

export default GridPage;

