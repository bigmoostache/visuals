"use client";

import React, { useState } from 'react';
import { Entry as _Entry, ValueMultiplicity} from '../Extraction';
import { Camera, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ValueType } from '../Extraction';

export default function Entry({data, onDeleteClick, setDocHasBeenModified}: {data: _Entry, onDeleteClick: () => void, setDocHasBeenModified: (value: boolean) => void}) {
    console.log(data)
    const [name, setName] = useState<string>(data.name);
    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {  const newValue = e.target.value; 
        // the value should be uppercase and underscores, but no spaces, no special characters, and no numbers
        if (!/^[A-Z_]*$/.test(newValue)) { return; }
        setName(newValue); data.name = newValue; 
        setDocHasBeenModified(true);} 

    const [description, setDescription] = useState<string>(data.description);
    const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {  const newValue = e.target.value; setDescription(newValue); data.description = newValue; setDocHasBeenModified(true); }

    const [examples, setExamples] = useState<(string | number | boolean)[]>(data.examples);
    const onAddExample = (e: React.KeyboardEvent<HTMLInputElement>) => {  const newValue = (e.target as HTMLInputElement).value; setExamples([...examples, newValue]); data.examples = [...examples, newValue]; setDocHasBeenModified(true); }
    const onDeleteExample = (index: number) => {  const newValue = examples.filter((_, i) => i !== index); setExamples(newValue); data.examples = newValue;  setDocHasBeenModified(true); }

    const [multiple, setMultiple] = useState<ValueMultiplicity>(data.multiple);
    // alternate between 'Single' and 'List'
    const onMultipleClick = () => { const newValue = multiple === ValueMultiplicity.SINGLE ? ValueMultiplicity.LIST : ValueMultiplicity.SINGLE; setMultiple(newValue); data.multiple = newValue; setDocHasBeenModified(true); }
    
    const [valueType, setValueType] = useState<ValueType>(data.value);
    const onValueTypeClick = (newValue: ValueType) => { setValueType(newValue); data.value = newValue; setDocHasBeenModified(true); }

    const [unit, setUnit] = useState<string>(data.unit);
    const onUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {  const newValue = e.target.value; setUnit(newValue); data.unit = newValue;  setDocHasBeenModified(true); }
    return (
        <div
        className="relative text-sm rounded border-l-4 p-2 border-blue-800 flex flex-col bg-blue-50"        >
            <X
                className='absolute top-2 right-2 cursor-pointer h-5 w-5 hover:text-red-500'
                onClick={onDeleteClick}
            />
            <span className='text-xs italic text-blue-500 font-bold'>Name</span>
            <input
                id="name"
                type="text"
                value={name}
                className='w-full mb-1 bg-transparent'
                placeholder='Variable Name'
                onChange={onNameChange}
            />
            <span className='text-xs italic text-blue-500 font-bold'>Description</span>
            <textarea
                id="description"
                value={description}
                rows={2}
                className='w-full mb-1 bg-transparent'
                placeholder='Precise description of this value'
                onChange={onDescriptionChange}
            />
            <span className='text-xs italic text-blue-500 font-bold'>Examples</span>
            <div className='flex flex-wrap'>
            {examples.map((example, index) => (
                <span 
                key={String(example) || index}
                className='relative inline bg-gray-200 rounded-full pl-2 pr-6 py-1 mr-1 mb-1 w-fit'
                >
                {example}
                <X
                    className='absolute top-[2px] right-[4px] cursor-pointer h-4 w-4 hover:text-red-500'
                    onClick={() => onDeleteExample(index)}
                />
                </span>
            ))}
            <Input
                className='inline bg-gray-200 rounded-full pl-2 pr-6 pb-2 mr-1 mb-1 w-fit'
                onKeyDown={(e) => {
                    e.key === 'Enter' && onAddExample(e);
                    // reset the input value
                    if (e.key === 'Enter') { (e.target as HTMLInputElement).value = ''; }
                }}
            ></Input>
            </div>
            <span className='text-xs italic text-blue-500 font-bold'>Should be a list?</span>
            <Switch
                id="multiple"
                className='mb-1'
                checked={multiple === ValueMultiplicity.LIST}
                onClick={onMultipleClick}
            />

            <span className='text-xs italic text-blue-500 font-bold'>Type</span>
            <div className='flex flex-wrap'>
                {Object.values(ValueType).map((type) => (
                    <span 
                        key={type}
                        className={`relative inline bg-gray-200 rounded-full px-2 py-1 mx-1 w-fit cursor-pointer ${valueType === type ? 'bg-blue-400 text-white' : ''}`}
                        onClick={() => onValueTypeClick(type as ValueType)}
                    >
                        {type.toUpperCase()}
                    </span>
                ))}
            </div>

            {multiple === ValueMultiplicity.LIST &&
            <div><span className='text-xs italic text-blue-500 font-bold'>Unit</span>
            <input
                id="unit"
                type="text"
                value={unit}
                className='w-full mb-1 bg-transparent'
                placeholder='Unit'
                onChange={onUnitChange}
            /></div>
            }
        </div>
    )
}