import { Suspense } from "react";
import XLSXPage from "./XLSX";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="w-full h-full">
        <XLSXPage/>
      </main>
    </Suspense>
  );
}
