import React, { Suspense } from 'react';
import Plan from "./Plan";
import { PlanProvider } from '@/app/(pages)/plan/context/PlanContext';

export default function Home() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PlanProvider>
                    <main className="w-full h-full">
                        <Plan />
                    </main>
            </PlanProvider>
        </Suspense>
    );
}
