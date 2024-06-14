import React, { useState } from 'react';
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
    { field: 'BKT', displayName: 'Breakthrought' },
    // Ajoutez plus de filtres ici si nécessaire
];

const FilterBar: React.FC<FilterBarProps> = ({ articles, filteredArticles, onFilterChange }) => {
    const [filters, setFilters] = useState<{ [key: string]: number | string | null }>({});

    const handleFilterChange = (fieldId: string, value: number | string | null) => {
        const newFilters = { ...filters, [fieldId]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

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
                    />
                ))}
                <FilterAuthorElement
                    key={'Author-Filter'}
                    articles={articles}
                    onChange={handleFilterChange}
                />
            </div>
            <div className="mt-4">
                <p className="text-primary font-bold">Number of displayed elements: {filteredArticles.length}</p>
            </div>
        </div>
    );
};

export default FilterBar;
