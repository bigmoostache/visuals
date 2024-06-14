import React, { useEffect, useState } from 'react';

interface FilterElementProps {
    fieldId: string;
    displayName: string;
    articles: Article[];
    onChange: (fieldId: string, value: number | string | null) => void;
}

const FilterElement: React.FC<FilterElementProps> = ({ fieldId, displayName, articles, onChange }) => {
    const [values, setValues] = useState<{ value: number | string; text: string }[]>([]);

    useEffect(() => {
        // @ts-ignore
        const uniqueValues = Array.from(new Set(articles.map(article => article[fieldId]))).filter(value => value !== undefined && value !== null);
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
    }, [articles, fieldId]);


    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value ? (isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)) : null;
        onChange(fieldId, value);
    };

    const isNumber = typeof values[0]?.value === 'number';

    return (
        <div className={`m-2 p-4 bg-white rounded-lg shadow-md ${isNumber ? 'w-[23%]' : 'w-[48%]'}`}>
            <label htmlFor={fieldId} className="block text-primary font-bold mb-2">
                {displayName}
            </label>
            <select
                id={fieldId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
            >
                <option value="">Select</option>
                {values.map((valueObj, index) => (
                    <option key={index} value={valueObj.value}>
                        {valueObj.text}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FilterElement;
