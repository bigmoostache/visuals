import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
// @ts-ignore
import { Article } from '@/app/(pages)/biblio/interfaces';
import {useSearchParams} from "next/navigation";
import useGetFile from "@/app/(pages)/(hooks)/useGetFile";

interface BiblioContextProps {
    biblio: Article[];
    filteredBiblio: Article[];
    filters: { [key: string]: number | string | null };
    sortState: { fieldId: string, order: 'asc' | 'desc' } | null;
    setBiblio: React.Dispatch<React.SetStateAction<Article[]>>;
    setFilteredBiblio: React.Dispatch<React.SetStateAction<Article[]>>;
    setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: number | string | null }>>;
    setSortState: React.Dispatch<React.SetStateAction<{ fieldId: string, order: 'asc' | 'desc' } | null>>;
    handleFilterChange: (newFilters: { [key: string]: number | string | null }) => void;
    handleSort: (fieldId: string, order: 'asc' | 'desc') => void;
    handleIncludeChange: (DOI: string) => void;
}

const BiblioContext = createContext<BiblioContextProps | undefined>(undefined);

export const BiblioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const { data } = useGetFile({ fetchUrl: url as string });


    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            const strBib = e.target?.result as string;
            const theBiblio = strBib.split('\n').map(s => JSON.parse(s));
            setBiblio(theBiblio);
        };
        reader.readAsText(data);
    }, [data]);


    const [biblio, setBiblio] = useState<Article[]>([]);
    const [filteredBiblio, setFilteredBiblio] = useState<Article[]>([]);
    const [filters, setFilters] = useState<{ [key: string]: number | string | null }>({});
    const [sortState, setSortState] = useState<{ fieldId: string, order: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
        console.log('Filters or Sort State changed:', filters, sortState);
        let filteredArticles = [...biblio];

        // Apply filters
        Object.keys(filters).forEach(key => {
            const filterValue = filters[key];
            if (key === 'author.full') {
                if (filterValue !== null && filterValue !== undefined) {
                    filteredArticles = filteredArticles.filter(article => article.author?.find((author:Author) => author.full === filterValue));
                }
            } else {
                if (filterValue !== null && filterValue !== undefined) {
                    filteredArticles = filteredArticles.filter(article => article[key] === filterValue);
                }
            }
        });

        // Apply sorting
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
        }

        setFilteredBiblio(filteredArticles);
    }, [filters, biblio, sortState]);

    const handleFilterChange = (newFilters: { [key: string]: number | string | null }) => {
        console.log('handleFilterChange', newFilters);
        setFilters(newFilters);
    };

    const handleSort = (fieldId: string, order: 'asc' | 'desc') => {
        console.log('handleSort', { fieldId, order });
        setSortState({ fieldId, order });
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
        <BiblioContext.Provider
            value={{
                biblio,
                filteredBiblio,
                filters,
                sortState,
                setBiblio,
                setFilteredBiblio,
                setFilters,
                setSortState,
                handleFilterChange,
                handleSort,
                handleIncludeChange,
            }}
        >
            {children}
        </BiblioContext.Provider>
    );
};

export const useBiblio = (): BiblioContextProps => {
    const context = useContext(BiblioContext);
    if (context === undefined) {
        throw new Error('useBiblio must be used within a BiblioProvider');
    }
    return context;
};
