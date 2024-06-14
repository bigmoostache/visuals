"use client";
import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import BiblioArticle from "@/app/(pages)/biblio/components/BiblioArticle";
import FilterBar from "@/app/(pages)/biblio/components/FilterBar";
import { Article } from '@/app/(pages)/biblio/interfaces';

const Biblio = () => {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const { data } = useGetFile({ fetchUrl: url as string });

    const [biblio, setBiblio] = useState<Article[]>([]);
    const [filteredBiblio, setFilteredBiblio] = useState<Article[]>([]);
    const [filters, setFilters] = useState<{ [key: string]: number | string | null }>({});

    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const strBib = e.target?.result as string;
            const theBiblio = strBib.split('\n').map(s => JSON.parse(s));
            setBiblio(theBiblio);
            setFilteredBiblio(theBiblio);
        };
        reader.readAsText(data);
    }, [data]);

    useEffect(() => {
        let filteredArticles = biblio;

        Object.keys(filters).forEach(key => {
            const filterValue = filters[key];
            if (filterValue !== null && filterValue !== undefined) {
                filteredArticles = filteredArticles.filter(article => article[key] === filterValue);
            }
        });

        setFilteredBiblio(filteredArticles);
    }, [filters, biblio]);

    const handleFilterChange = (newFilters: { [key: string]: number | string | null }) => {
        setFilters(newFilters);
    };

    return (
        <div className="max-w-[60rem] mx-auto p-4 bg-white">
            <h1 className="text-3xl font-bold mb-4 text-primary">Articles</h1>
            <FilterBar articles={biblio}   filteredArticles={filteredBiblio} onFilterChange={handleFilterChange} />
            {filteredBiblio.map((article, index) => (
                <BiblioArticle key={index} article={article} />
            ))}
        </div>
    );
}

const BiblioPage = () => {
    return (
        <Suspense>
            <Biblio />
        </Suspense>
    );
}

export default BiblioPage;
