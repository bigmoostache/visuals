"use client";

import { Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface Enumeration {
    enumeration_choices: string[];
}

export const EnumerationEl = ({ enumeration, onChange }: { enumeration: Enumeration, onChange: (updated: Enumeration) => void }) => {
    const handleAddChoice = () => {
        const newChoice = prompt("Enter a new choice:", "");
        if (newChoice) {
            onChange({ enumeration_choices: [...enumeration.enumeration_choices, newChoice] });
        }
    };

    const handleRemoveChoice = (index: number) => {
        const updatedChoices = enumeration.enumeration_choices.filter((_, i) => i !== index);
        onChange({ enumeration_choices: updatedChoices });
    };
    const [confirmDelete, setConfirmDelete] = useState<string>('');
    useEffect(() => {
        if (confirmDelete) {
            const timeout = setTimeout(() => {
                setConfirmDelete('');
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [confirmDelete]);
    return (
        <div>
            <p>Choices:</p>
            <div className='w-full flex gap-2 flex-wrap '>
                {enumeration.enumeration_choices.map((choice, index) => (
                    <div 
                        key={index} 
                        className={`relative p-[4px] bg-gray-200 cursor-pointer hover:bg-red-200 w-fit rounded-md ${confirmDelete === choice ? 'bg-red-200' : ''}`}
                        onClick={() => {
                            if (confirmDelete === choice) {
                                handleRemoveChoice(index);
                                setConfirmDelete('');
                            } else {
                                setConfirmDelete(choice);
                            }
                        }}
                        >
                        {choice}
                        <p className='text-xs text-red-700'>{confirmDelete === choice ? 'Confirm Delete' : ' '}</p>
                    </div>
                ))}
                <div className='relative p-[4px] bg-gray-200 cursor-pointer hover:bg-gray-300 w-fit rounded-md'>
                    <Plus onClick={handleAddChoice}/>
                </div>
            </div>
        </div>
    );
};