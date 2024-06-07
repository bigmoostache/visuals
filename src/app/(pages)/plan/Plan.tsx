"use client";
import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';

import SourceCard from "@/app/(pages)/plan/components/Source";
import SectionCard from "@/app/(pages)/plan/components/Section";


const Plan = () => {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const { data } = useGetFile({ fetchUrl: url as string });
    const [plan, setPlan] = useState<PlanInterface>();
    const [updatable, setUpdatable] = useState<boolean>(false);
    const [updatableAgain, setUpdatableAgain] = useState<boolean>(false);

    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            setPlan(JSON.parse(e.target?.result as string) as PlanInterface);
        };
        reader.readAsText(data);
    }, [data]);

    const convertBackToFile = (text: string) => {
        const blob = new Blob([text], { type: 'text/plain' });
        return new File([blob], 'filename.txt', { lastModified: Date.now(), type: blob.type });
    };

    const { mutate, isLoading, isSuccess } = usePatchFile({ fetchUrl: url as string });

    const onSubmit = async () => {
        console.log('submit');
        setUpdatableAgain(false);
        mutate(convertBackToFile(JSON.stringify(plan)));
    };

    return (
        plan &&
        <div className="max-w-[60rem] mx-auto p-4 bg-white">
            <SectionCard key={plan.contents.title} {...plan.contents} sources={plan.sources} parentId="" index={0} />
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Sources</h2>
                {plan.sources.map(src => (
                    <SourceCard key={src.id} {...src} />
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
