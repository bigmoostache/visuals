import BiblioPage from "./Biblio";
import React, { Suspense } from 'react';

export default function Home() {
    return (
        <Suspense>
        <main className="w-full h-full">
            <BiblioPage />
        </main>
        </Suspense>
    );
}
