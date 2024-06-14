import React, { useEffect, useState } from 'react';

interface FilterElementProps {
    articles: Article[];
    onChange: (fieldId: string, value: number | string | null) => void;
}

const FilterAuthorElement: React.FC<FilterElementProps> = ({ articles, onChange }) => {
    const fieldId = 'author.full'
    const displayName = 'Author'
    const [values, setValues] = useState<{ value: number | string; text: string }[]>([]);

    useEffect(() => {
        function getSortedAuthors(articles: Article[]): string[] {
            const allAuthorsSet = new Set<string>();

            articles.forEach((article) => {
                if (article.author) {
                    article.author.forEach((author) => {
                        allAuthorsSet.add(author.full);
                    });
                }
            });

            const allAuthorsArray = Array.from(allAuthorsSet);
            return allAuthorsArray.sort();
        }

        // @ts-ignore
        const uniqueValues = getSortedAuthors(articles)
        const valueOptions = uniqueValues.map(value => ({ value, text: value.toString() })).sort((a:any,b:any)=>{
            if (typeof a.value === 'number'){
                return a.value-b.value
            }else if(typeof a.value === 'string') {
                return a.value.localeCompare(b.value)
            }else {
                return 0
            }
        });
        setValues(valueOptions);
    }, [articles]);


    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value ? (isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)) : null;
        onChange(fieldId, value);
    };



    return (
        <div className={`m-2 p-4 bg-white rounded-lg shadow-md w-[48%]`}>
            <label htmlFor={fieldId} className="block text-primary font-bold mb-2">
                {displayName}
            </label>
            <select
                id={fieldId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
            >
                <option value="">Select {displayName}</option>
                {values.map((valueObj, index) => (
                    <option key={index} value={valueObj.value}>
                        {valueObj.text}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FilterAuthorElement;
