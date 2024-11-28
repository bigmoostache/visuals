"use client";

import React, { useState } from 'react';

export interface String {
    string : 'string';
    string_maxLength?: number | null;
}
export const StringEl = ({ string, onChange }: { string: String, onChange: (updated: String) => void }) => {
    const handleChange = (value: number | null) => {
        onChange({ string: 'string', string_maxLength: value });
    };
    return (
        <div>
            <p>
                Max length: <input type="number" value={string.string_maxLength || ''} onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)} />
            </p>
        </div>
    );
};
