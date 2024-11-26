"use client";

import { Label } from '@radix-ui/react-label';
import React, { useState } from 'react';

export interface Number {
    number_minimum?: number | null;
    number_maximum?: number | null;
    number_unit?: string | null;
}
export const NumberEl = ({ number, onChange }: { number: Number, onChange: (updated: Number) => void }) => {
    const handleChange = (field: keyof Number, value: number | string | null) => {
        onChange({ ...number, [field]: value });
    };
    return (
        <div>
        <div className="flex flex-col space-y-1.5">
            <Label>Minimum value</Label>
            <input 
                placeholder='0' 
                type="number" 
                value={number.number_minimum || ''} 
                onChange={(e) => {
                    const value = e.target.value;
                    if (!isNaN(parseFloat(value))) {
                        console.log(312)
                        handleChange('number_minimum', value ? Number(value) : null);
                    }
                }} 
            />
            <Label>Maximum value</Label>
            <input 
                placeholder='100' 
                type="number" 
                value={number.number_maximum || ''} 
                onChange={(e) => {
                    const value = e.target.value;
                    if (!isNaN(parseFloat(value))) {
                        console.log(312)
                        handleChange('number_maximum', value ? Number(value) : null);
                    }
                }} 
            />
            <Label>Value Unit</Label>
            <input placeholder="%" type="text" value={number.number_unit || ''} onChange={(e) => handleChange('number_unit', e.target.value)} />
        </div>
        </div>
    );
};