import React, { useEffect, useState } from 'react';
import FilterElement from './FilterElement';
import FilterAuthorElement from "@/app/(pages)/biblio/components/FilterAuthorElement";
import { useBiblio } from '@/app/(pages)/biblio/contexts/BiblioContext';
import SearchByDoiElement from './SearchByDoi';

const filtersToMake = [
    { field: 'SCORE', displayName: 'Article Score', type:'number' },
    { field: 'INCLUDE_SCORE', displayName: 'Include Score' , type:'number'},
    { field: 'YEAR', displayName: 'Year', type:'number' },
    { field: 'DO_INCLUDE', displayName: 'Is Included', type:'boolean' },
    { field: 'BKT', displayName: 'Breakthrough' },
    { field: 'TYPE', displayName: 'Type of article' },
   
];

const FilterBar = () => {
    const { biblio, filteredBiblio, handleFilterChange, handleSort, sortState } = useBiblio();
    const [filters, setFilters] = useState<{ [key: string]: number | string | null }>({});
    const [articlesSelected, setArticlesSelected] = useState<number>(biblio.filter(a => !!a.DO_INCLUDE).length);

    const handleFilterChangeWrapper = (fieldId: string, value: number | string | null) => {
        const newFilters = { ...filters, [fieldId]: value };
        setFilters(newFilters);
        handleFilterChange(newFilters);
    };
 
    useEffect(() => {
        setArticlesSelected(biblio.filter(a => !!a.DO_INCLUDE).length);
    }, [biblio]);

    return (
        <div className="mb-4 p-4 bg-tertiary rounded-lg shadow-md">
            <div className="flex flex-wrap">
                {filtersToMake.map(filter => (
                    <FilterElement
                        key={filter.field}
                        type={filter.type}
                        fieldId={filter.field}
                        displayName={filter.displayName}
                        articles={biblio}
                        onChange={handleFilterChangeWrapper}
                        onSort={handleSort}
                        sortOrder={sortState?.fieldId === filter.field ? sortState.order : undefined}
                    />
                ))}
                <FilterAuthorElement
                    key={'Author-Filter'}
                    articles={biblio}
                    onChange={handleFilterChangeWrapper}
                />
                <SearchByDoiElement
                    onChange={handleFilterChangeWrapper}
                />
            </div>
            <div className="mt-4 flex justify-between">
                <div className="text-primary font-bold inline mx-2">Number of displayed elements: {filteredBiblio.length}</div>
                <div className="text-secondary-800 font-bold inline mx-2">Number of selected elements: {articlesSelected}</div>
            </div>
        </div>
    );
};

export default FilterBar;
