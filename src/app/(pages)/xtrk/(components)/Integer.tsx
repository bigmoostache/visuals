"use client";

import { Label } from '@radix-ui/react-label';
import React, { useState } from 'react';
export interface Integer {
    integer : 'integer';
    integer_minimum?: number | null;
    integer_maximum?: number | null;
    integer_unit?: string | null;
}
export const IntegerEl = ({ integer, onChange }: { integer: Integer, onChange: (updated: Integer) => void }) => {
    const handleChange = (field: keyof Integer, value: number | string | null) => {
        onChange({ ...integer, [field]: value });
    };
    return (
        <div>
            <div className="flex flex-col space-y-1.5">
                <Label>Minimum value</Label>
                <input 
                    placeholder='0' 
                    type="number" 
                    value={integer.integer_minimum || ''} 
                    onChange={(e) => {
                        const value = e.target.value;
                        if (!isNaN(parseInt(value, 10))) {
                            console.log(312)
                            handleChange('integer_minimum', value ? Number(value) : null);
                        }
                    }} 
                />
                <Label>Maximum value</Label>
                <input 
                    placeholder='100' 
                    type="number" 
                    value={integer.integer_maximum || ''} 
                    onChange={(e) => {
                        const value = e.target.value;
                        if (!isNaN(parseInt(value, 10))) {
                            console.log(312)
                            handleChange('integer_maximum', value ? Number(value) : null);
                        }
                    }} 
                />
                <Label>Value Unit</Label>
                <input placeholder="%" type="text" value={integer.integer_unit || ''} onChange={(e) => handleChange('integer_unit', e.target.value)} />
            </div>
        </div>
    );
};