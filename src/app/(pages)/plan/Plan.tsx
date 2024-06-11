"use client";
import { usePlan } from '@/app/(pages)/plan/context/PlanContext';
import { Suspense } from 'react';

import SourceCard from "@/app/(pages)/plan/components/Source";
import SectionCard from "@/app/(pages)/plan/components/Section";

const Plan = () => {
    const { plan, isLoading } = usePlan();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        plan &&
        <div className="max-w-[60rem] mx-auto p-4 bg-white">
            <SectionCard key={plan.contents.title} section={plan.contents} sources={plan.sources} index={0} />
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Sources</h2>
                {plan.sources.map((src,i) => (
                    <SourceCard key={src.id.concat('_',i)} {...src} />
                ))}
            </div>
        </div>
    );
};

const PlanPage = () => {
    return (
        <Suspense>
            <Plan />
        </Suspense>
    );
};

export default PlanPage;
