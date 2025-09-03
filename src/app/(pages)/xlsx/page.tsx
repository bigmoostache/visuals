import { Suspense } from "react";
import SpreadsheetEditor from "./components/SpreadsheetEditor";

export default function Home() {
  return (
    <Suspense fallback={<div className="w-screen h-screen flex items-center justify-center">Loading spreadsheet...</div>}>
      <main className="w-full h-full">
        <SpreadsheetEditor />
      </main>
    </Suspense>
  );
}
