"use client";
import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
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
        reader.onload = function (e) {
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
            if (key === 'author.full') {
                const filterValue = filters[key];
                if (filterValue !== null && filterValue !== undefined) {
                    filteredArticles = filteredArticles.filter(article => article.author?.find((author: Author) => author.full === filterValue));
                }
            } else {
                const filterValue = filters[key];
                if (filterValue !== null && filterValue !== undefined) {
                    filteredArticles = filteredArticles.filter(article => article[key] === filterValue);
                }
            }
        });

        setFilteredBiblio(filteredArticles);
    }, [filters, biblio]);

    const handleFilterChange = (newFiltersOrSortedArticles: { [key: string]: number | string | null } | Article[]) => {
        if (Array.isArray(newFiltersOrSortedArticles)) {
            setFilteredBiblio(newFiltersOrSortedArticles);
        } else {
            setFilters(newFiltersOrSortedArticles);
        }
    };

    const handleIncludeChange = (DOI: string) => {
        const updatedBiblio = biblio.map(article => {
            if (article.DOI === DOI) {
                return { ...article, DO_INCLUDE: !article.DO_INCLUDE };
            }
            return article;
        });
        setBiblio(updatedBiblio);
    };

    return (
        <div className="max-w-[60rem] mx-auto p-4 bg-white">
            <h1 className="text-3xl font-bold mb-4 text-primary">Articles</h1>
            <FilterBar articles={biblio} filteredArticles={filteredBiblio} onFilterChange={handleFilterChange} />
            {filteredBiblio.map((article, index) => (
                <BiblioArticle
                    key={index}
                    article={article}
                    isIncluded={article.DO_INCLUDE ?? false}
                    onIncludeChange={handleIncludeChange}
                />
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
