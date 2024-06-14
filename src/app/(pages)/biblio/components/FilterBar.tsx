import React, { useEffect, useState } from 'react';
import FilterElement from './FilterElement';
import FilterAuthorElement from "@/app/(pages)/biblio/components/FilterAuthorElement";

interface FilterBarProps {
    articles: Article[];
    filteredArticles: Article[];
    onFilterChange: (filters: { [key: string]: number | string | null }) => void;
}

const filtersToMake = [
    { field: 'SCORE', displayName: 'Article Score' },
    { field: 'INCLUDE_SCORE', displayName: 'Include Score' },
    { field: 'BKT', displayName: 'Breakthrough' },
    { field: 'TYPE', displayName: 'Type of article' },
];

const FilterBar: React.FC<FilterBarProps> = ({ articles, filteredArticles, onFilterChange }) => {
    const [filters, setFilters] = useState<{ [key: string]: number | string | null }>({});
    const [articlesSelected, setArticlesSelected] = useState<number>(articles.filter(a => !!a.DO_INCLUDE).length);

    const handleFilterChange = (fieldId: string, value: number | string | null) => {
        const newFilters = { ...filters, [fieldId]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSort = (fieldId: string, order: 'asc' | 'desc') => {
        const sortedArticles = [...filteredArticles].sort((a, b) => {
            if (typeof a[fieldId] === 'number' && typeof b[fieldId] === 'number') {
                return order === 'asc' ? a[fieldId] - b[fieldId] : b[fieldId] - a[fieldId];
            } else if (typeof a[fieldId] === 'string' && typeof b[fieldId] === 'string') {
                return order === 'asc' ? a[fieldId].localeCompare(b[fieldId]) : b[fieldId].localeCompare(a[fieldId]);
            }
            return 0;
        });
        onFilterChange(sortedArticles);
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
                        onSort={handleSort}
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
