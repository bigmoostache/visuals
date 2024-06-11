"use client";
import {useSearchParams} from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import {useEffect, useState} from 'react';
import {Suspense} from 'react';


import {
    NewsletterInterface,
} from "@/app/(pages)/newsletter/interfaces";

import SummaryCard from "@/app/(pages)/newsletter/components/summary";
import MetricCard from "@/app/(pages)/newsletter/components/metrics";
import ArticleCard from "@/app/(pages)/newsletter/components/article";


const Newsletter = () => {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const {data} = useGetFile({fetchUrl: url as string});
    const [text, setText] = useState<string>('');
    const [jsonNL, setJsonNL] = useState<NewsletterInterface>();
    const [updatable, setUpdatable] = useState<boolean>(false);
    const [updatableAgain, setUpdatableAgain] = useState<boolean>(false);

    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            setJsonNL(JSON.parse(e.target?.result as string) as NewsletterInterface);
        }
        reader.readAsText(data);
    }, [data]);

    const convertBackToFile = (text: string) => {
        const blob = new Blob([text], {type: 'text/plain'});
        return new File([blob], 'filename.txt', {lastModified: Date.now(), type: blob.type});
    }

    const {mutate, isLoading, isSuccess} = usePatchFile(
        {fetchUrl: url as string}
    );

    const onSubmit = async () => {
        console.log('submit');
        setUpdatableAgain(false);
        mutate(convertBackToFile(text));
    }

    return (
        jsonNL &&
        <div className="max-w-[60rem] mx-auto p-4 bg-white">
            <div className="mb-2">
                <img
                    src="https://images.unsplash.com/photo-1516689948391-3379ec7c7df0?q=80&w=1974&h=450&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
            </div>
            <div className="text-right text-gray-600 mb-6">
                {new Date(jsonNL.timestamp).toLocaleDateString()}
            </div>
            <div className="bg-tertiary p-4 rounded-lg mb-8">
                <p className="text-gray-700">{jsonNL.summary_analysis}</p>
            </div>
            <h2 className="text-2xl text-gray-900 font-bold mt-8 mb-4">Metrics</h2>
            <div className="metrics-section flex gap-4 mb-4 flex-wrap justify-center">

                {jsonNL!.metrics.map((metric) => (
                    <MetricCard key={metric.metric} {...metric} />
                ))}
            </div>
            <h2 className="text-2xl text-gray-900 font-bold mb-4">Summary</h2>
            <div className="summary-section mb-8">
                {jsonNL.summary.map((summaryItem) => (
                    <SummaryCard key={summaryItem.title} {...summaryItem} />
                ))}
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">Articles</h2>
            <div className="articlesSection grid grid-cols-1 gap-2">
                {jsonNL.articles.map((article) => (
                    <ArticleCard key={article.reference_id} {...article} />
                ))}
            </div>
        </div>
    );
}

const NewsletterPage = () => {
    return (
        <Suspense>
            <Newsletter/>
        </Suspense>
    )
}

export default NewsletterPage;
