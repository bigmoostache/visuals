"use client";
import {useSearchParams} from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import {useEffect, useState,useRef} from 'react';
import {Suspense} from 'react';
import BiblioArticle from "@/app/(pages)/biblio/components/BiblioArticle";
import FilterBar from "@/app/(pages)/biblio/components/FilterBar";
import {Article} from '@/app/(pages)/biblio/interfaces';

function clone<T>(obj: T): T  {
    return JSON.parse(JSON.stringify(obj))
}

const Biblio = () => {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');

    const {data} = useGetFile({fetchUrl: url as string});

    const [biblio, setBiblio] = useState<Article[]>([]);
    const [filteredBiblio, setFilteredBiblio] = useState<Article[]>([]);
    const [filters, setFilters] = useState<{ [key: string]: number | string | null }>({});
    const [sortState, setSortState] = useState<{ fieldId: string, order: 'asc' | 'desc' } | null>(null);


    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            const strBib = e.target?.result as string;
            const theBiblio = strBib.split('\n').map(s => JSON.parse(s)) as Article[];
            setBiblio(theBiblio);
            setFilteredBiblio(clone(theBiblio));

        };
        reader.readAsText(data);
    }, [data]);

    useEffect(() => {

        let filteredArticles = biblio;

        Object.keys(filters).forEach(key => {
            const filterValue = filters[key];
            if (key === 'author.full') {
                if (filterValue !== null && filterValue !== undefined) {
                    filteredArticles = filteredArticles.filter(article => article.author?.find((author: Author) => author.full === filterValue));
                }
            } else {
                if (filterValue !== null && filterValue !== undefined) {
                    filteredArticles = filteredArticles.filter(article => article[key] === filterValue);
                }
            }
        });
        console.log(sortState)
        if (sortState) {
            const fieldId = sortState.fieldId;
            const order = sortState.order;
            filteredArticles.sort((a, b) => {
                if (typeof a[fieldId] === 'number' && typeof b[fieldId] === 'number') {
                    return order === 'asc' ? a[fieldId] - b[fieldId] : b[fieldId] - a[fieldId];
                } else if (typeof a[fieldId] === 'string' && typeof b[fieldId] === 'string') {
                    return order === 'asc' ? a[fieldId].localeCompare(b[fieldId]) : b[fieldId].localeCompare(a[fieldId]);
                }
                return 0;
            });

            //console.log(filteredArticles.map(a=>a[fieldId]))
        }
        setFilteredBiblio(filteredArticles)

    }, [filters, biblio, sortState]);

    const handleFilterChange = (newFilters: { [key: string]: number | string | null }) => {
        setFilters(newFilters);
    };

    const handleSort = (fieldId: string, order: 'asc' | 'desc') => {
        setSortState({fieldId, order});
    };

    const handleIncludeChange = (DOI: string) => {
        const updatedBiblio = biblio.map(article => {
            if (article.DOI === DOI) {
                return {...article, DO_INCLUDE: !article.DO_INCLUDE};
            }
            return article;
        });

        setBiblio(updatedBiblio);
    };

    return (
        <div className="max-w-[60rem] mx-auto p-4 bg-white">
            <h1 className="text-3xl font-bold mb-4 text-primary">Articles</h1>
            <FilterBar
                articles={biblio}
                filteredArticles={filteredBiblio}
                onFilterChange={handleFilterChange}
                onSort={handleSort}
                sortState={sortState}
            />
            {filteredBiblio.map((article, index) => {
                if(index<10){console.log(index, article.SCORE)}
                else if(index===10){console.log('---------------------')}
                return (

                <BiblioArticle
                    key={index}
                    article={article}
                    isIncluded={article.DO_INCLUDE ?? false}
                    onIncludeChange={handleIncludeChange}
                />
            )})}
        </div>
    );
}

const BiblioPage = () => {
    return (
        <Suspense>
            <Biblio/>
        </Suspense>
    );
}

export default BiblioPage;
