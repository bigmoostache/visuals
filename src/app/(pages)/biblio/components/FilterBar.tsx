import React, { useEffect, useState } from 'react';
import FilterElement from './FilterElement';
import FilterAuthorElement from "@/app/(pages)/biblio/components/FilterAuthorElement";
import { Article } from '@/app/(pages)/biblio/interfaces';

interface FilterBarProps {
    articles: Article[];
    filteredArticles: Article[];
    onFilterChange: (filters: { [key: string]: number | string | null }) => void;
    onSort: (fieldId: string, order: 'asc' | 'desc') => void;
    sortState: { fieldId: string, order: 'asc' | 'desc' } | null;
}

const filtersToMake = [
    { field: 'SCORE', displayName: 'Article Score' },
    { field: 'INCLUDE_SCORE', displayName: 'Include Score' },
    { field: 'BKT', displayName: 'Breakthrough' },
    { field: 'TYPE', displayName: 'Type of article' },
];

const FilterBar: React.FC<FilterBarProps> = ({ articles, filteredArticles, onFilterChange, onSort, sortState }) => {
    const [filters, setFilters] = useState<{ [key: string]: number | string | null }>({});
    const [articlesSelected, setArticlesSelected] = useState<number>(articles.filter(a => !!a.DO_INCLUDE).length);

    const handleFilterChange = (fieldId: string, value: number | string | null) => {
        const newFilters = { ...filters, [fieldId]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    useEffect(() => {
        setArticlesSelected(articles.filter(a => !!a.DO_INCLUDE).length);
    }, [articles]);

    return (
        <div className="mb-4 p-4 bg-tertiary rounded-lg shadow-md">
            <div className="flex flex-wrap">
                {filtersToMake.map(filter => (
                    <FilterElement
                        key={filter.field}
                        fieldId={filter.field}
                        displayName={filter.displayName}
                        articles={articles}
                        onChange={handleFilterChange}
                        onSort={onSort}
                        sortOrder={sortState?.fieldId === filter.field ? sortState.order : undefined}
                    />
                ))}
                <FilterAuthorElement
                    key={'Author-Filter'}
                    articles={articles}
                    onChange={handleFilterChange}
                />
            </div>
            <div className="mt-4 flex justify-between">
                <div className="text-primary font-bold inline mx-2">Number of displayed elements: {filteredArticles.length}</div>
                <div className="text-secondary-800 font-bold inline mx-2">Number of selected elements: {articlesSelected}</div>
            </div>
        </div>
    );
};

export default FilterBar;
