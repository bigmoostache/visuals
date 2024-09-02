import React, { useState } from 'react';

interface FilterElementProps {
    onChange: (fieldId: string, value: string | null) => void;
}

const SearchByDoiElement: React.FC<FilterElementProps> = ({ onChange }) => {
    const [inputValue, setInputValue] = useState<string>('');

    const displayName = 'Search a DOI';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        onChange('doi', value || null);
    };

    const clearInput = () => {
        setInputValue('');
        onChange('doi', null);
    };

    return (
        <div className={`m-2 p-4 bg-white rounded-lg shadow-md w-[48%] `}>
            <label className="block text-primary font-bold mb-2">
                {displayName}

                {inputValue && (
                    <button
                        type="button"
                        onClick={clearInput}
                        //className="absolute inset-y-0 right-2 flex items-center justify-center"
                        className="inline ml-3 "
                    >
                        <span className="text-sm">&times;</span>
                    </button>
                )}
            </label>
            <div className="">
                <input
                    type='text'
                    id='searchDOI'
                    value={inputValue}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded pr-10"
                />
                
            </div>
        </div>
    );
};

export default SearchByDoiElement;
