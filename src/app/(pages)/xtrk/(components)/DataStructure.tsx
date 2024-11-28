"use client";

import { Label } from '@radix-ui/react-label';
import React, { useState } from 'react';
import { FieldEl, Fields } from './Fields';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
export interface DataStructure {
    object_list : 'object_list';
    fields: Fields[];
}
export const DataStructureEl = ({ onAddField, data_structure, onChange, className }: { onAddField: () => void, data_structure: DataStructure, onChange: (updated: DataStructure) => void, className?: string }) => {
    return (
        <div className={className}>
            <div className='grid auto-rows-min gap-2 md:grid-cols-3'>
                {
                    data_structure.fields.map((field, index) => {
                        const contains_sub = 'object_list' in field.object_type;
                        console.log(contains_sub);
                        return (
                            <div key={index} className={`${contains_sub && 'col-span-3'}`}>
                                <FieldEl field={field} onChange={(updated) => {
                                    const updatedFields = [...data_structure.fields];
                                    updatedFields[index] = updated;
                                    onChange({ ...data_structure, fields: updatedFields });
                                }} onDelete={() => {
                                    const updatedFields = data_structure.fields.filter((_, i) => i !== index);
                                    onChange({ ...data_structure, fields: updatedFields });
                                }} />
                            </div>
                        );
                    })
                }
            </div>
            <Button
                className='mt-2 rounded-2xl'
                    onClick={onAddField}
                    >
                    <Plus className='mr-2'/>
                    Add Column
            </Button>
        </div>
    );
};