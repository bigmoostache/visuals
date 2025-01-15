"use client";

import { Label } from '@radix-ui/react-label';
import React, { useEffect, useState } from 'react';
import { FieldEl, Fields } from './Fields';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { on } from 'events';
export interface DataStructure {
    object_list : 'object_list';
    fields: Fields[];
}
export const DataStructureEl = ({ onAddField, data_structure, onChange, className, droppedField, setDroppedField }: { onAddField: () => void, data_structure: DataStructure, onChange: (updated: DataStructure) => void, className?: string, droppedField: string | null, setDroppedField: (field: string | null) => void }) => {
    // first, set the global_ids if they are not set
    const onAddBefore = (index: number, field: Fields) => {
        // first, delete the field from the list if it exists
        const updatedFields = [...data_structure.fields];
        updatedFields.splice(index, 0, field);
        // remove the old one
        const length = updatedFields.length;
        const final = updatedFields.filter((_, i) => (_.object_name !== field.object_name || i === index));
        if (final.length !== length) {setDroppedField(null)} // this willl prevent from deleting a second time
        onChange({ ...data_structure, fields: final });
    }
    return (
        <div className={className}>
            <div className='grid auto-rows-min gap-2 md:grid-cols-3'>
                {
                    data_structure.fields.map((field, index) => {
                        const contains_sub = 'object_list' in field.object_type;
                        const new_id = () => Math.random().toString(36).substring(7);
                        field.global_id = field.global_id || new_id();
                        return (
                            <div key={`${field.global_id}}`} className={`${contains_sub && 'col-span-3'}`}>
                                <FieldEl 
                                    field={field} 
                                    onChange={(updated) => {
                                        const updatedFields = [...data_structure.fields];
                                        updatedFields[index] = updated;
                                        onChange({ ...data_structure, fields: updatedFields });
                                    }} 
                                    onDelete={() => {
                                        const updatedFields = data_structure.fields.filter((_, i) => i !== index);
                                        onChange({ ...data_structure, fields: updatedFields });
                                    }} 
                                    onAddBefore={(field) => onAddBefore(index, field)}
                                    droppedField = {droppedField}
                                    setDroppedField = {setDroppedField}
                                />
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