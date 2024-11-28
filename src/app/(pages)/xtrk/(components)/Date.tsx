"use client";

import React, { useState } from 'react';


export interface Date {
    date : 'date';
    date_format: 'AAAA-MM-JJTHH:MM:SS,ss-/+FF:ff' | 'AAAA-MM-JJ' | 'AAAA-MM-JJ';
}

export const DateEl = ({ date, onChange }: { date: Date, onChange: (updated: Date) => void }) => {
    const handleChange = (value: Date['date_format']) => {
        onChange({ date: date.date, date_format: value });
    };
    return (
        <div>
            <p>
                Format: 
                <select 
                    value={date.date_format} 
                    onChange={(e) => handleChange(e.target.value as Date['date_format'])}
                    className='ml-2 p-[4px] rounded-md border-2 border-gray-200'
                    >
                    <option value="AAAA-MM-JJTHH:MM:SS,ss-/+FF:ff">ISO 8601</option>
                    <option value="AAAA-MM-JJ">AAAA-MM-JJ</option>
                </select>
            </p>
        </div>
    );
};
