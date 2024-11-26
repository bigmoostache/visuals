"use client";

import React, { useEffect, useState } from 'react';
import { Integer, IntegerEl } from './Integer';
import { Number, NumberEl } from './Number';
import { String, StringEl } from './String';
import { Enumeration, EnumerationEl } from './Enumeration';
import { Date, DateEl } from './Date';
import Select from './(components)/CheckboxButtons';
import { Switch } from '@/components/ui/switch';
import { Field } from '@headlessui/react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

function rep(s: string) {
    return s
        .toLowerCase()
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .normalize('NFKD') // Normalize the string using Unicode NFKD
        .replace(/[^\w]/g, ''); // Remove all characters except a-z, 0-9, and _
}

export interface Fields {
    object_name: string;
    object_description: string;
    object_required: boolean;
    object_type: boolean | Integer | Number | String | Enumeration | Date | Fields[];
}

export const FieldEl = ({ field, onChange, onDelete }: { field: Fields, onChange: (updatedFields: Fields) => void, onDelete: () => void }) => {
    const inferType = (object_type: any) => {
        if (typeof object_type === 'boolean') {
            return 'Boolean';
        } else if (object_type instanceof Array) {
            return 'Fields';
        } else if ('number_minimum' in object_type) {
            return 'Number';
        } else if ('string_maxLength' in object_type) {
            return 'String';
        } else if ('enumeration_choices' in object_type) {
            return 'Enumeration';
        } else if ('date_format' in object_type) {
            return 'Date';
        } else {
            return 'Integer';
        }
    }
    const [recomputeHook, setRecomputeHook] = useState(false);
    // history: dictionary String -> value to record previous values in case we change type and then revert back, in order to initialize directly with the previous value
    const [history, setHistory] = useState<{ [key: string]: any }>({});

    const handleTypeChange = (newType: string) => {
        // first, we record the current value of the field
        const type = inferType(field.object_type);
        setHistory({ ...history, [type]: field.object_type });
        if (history[newType]) {
            // if we have a history of the field, we initialize the new field with the previous value
            onChange({ ...field, object_type: history[newType] });
        } else {
            // else, we initialize the new field with the default value of the new type
            switch (newType) {
                case 'Boolean':
                    onChange({ ...field, object_type: false });
                    break;
                case 'Number':
                    onChange({ ...field, object_type: { number_minimum: null, number_maximum: null, number_unit: null } });
                    break;
                case 'String':
                    onChange({ ...field, object_type: { string_maxLength: null } });
                    break;
                case 'Enumeration':
                    onChange({ ...field, object_type: { enumeration_choices: [] } });
                    break;
                case 'Date':
                    onChange({ ...field, object_type: { date_format: 'AAAA-MM-JJ' } });
                    break;
                case 'Integer':
                    onChange({ ...field, object_type: { integer_minimum: null, integer_maximum: null } });
                    break;
                case 'Fields':
                    onChange({ ...field, object_type: [] });
                    break;
            }
        }
        setRecomputeHook(!recomputeHook);
    }

    const Details = (
    ) => {
        const field_is_array = field.object_type instanceof Array; 
        const field_is_boolean = typeof field.object_type === 'boolean';
        return (
            <>
            {!field_is_boolean && !field_is_array && 'integer_minimum' in (field.object_type as any) && <IntegerEl integer={field.object_type as Integer} onChange={(updated) => onChange({ ...field, object_type: updated })} />}
            {!field_is_boolean && !field_is_array && 'number_minimum' in (field.object_type as any) && <NumberEl number={field.object_type as Number} onChange={(updated) => onChange({ ...field, object_type: updated })} />}
            {!field_is_boolean && !field_is_array && 'string_maxLength' in (field.object_type as any) && <StringEl string={field.object_type as String} onChange={(updated) => onChange({ ...field, object_type: updated })} />}
            {!field_is_boolean && !field_is_array && 'enumeration_choices' in (field.object_type as any) && <EnumerationEl enumeration={field.object_type as Enumeration} onChange={(updated) => onChange({ ...field, object_type: updated })} />}
            {!field_is_boolean && !field_is_array && 'date_format' in (field.object_type as any) && <DateEl date={field.object_type as Date} onChange={(updated) => onChange({ ...field, object_type: updated })} />}
            {!field_is_boolean && field_is_array && (
                <div>
                    {(field.object_type as unknown as Fields[]).map((f, i) => (
                        <FieldEl
                            key={i}
                            field={f}
                            onDelete={() => { const updatedFields = field.object_type as Fields[]; updatedFields.splice(i, 1); onChange({ ...field, object_type: updatedFields }); }}
                            onChange={(updated) => {
                                const updatedFields = field.object_type as Fields[]; 
                                updatedFields[i] = updated;
                                onChange({ ...field, object_type: updatedFields });
                            }}
                        />
                    ))}
                    <Button
                    className='ml-2 mt-3'
                        onClick={() => {
                            onChange({ ...field, object_type: [...(field.object_type as Fields[]), { object_name: '', object_description: '', object_required: false, object_type: false }] });
                        }}
                        >
                        Add Column
                    </Button>
                </div>
            )}
            </>
        )
    }
    const [confirmDelete, setConfirmDelete] = useState(false);
    // after 2s, cancel confirmation
    useEffect(() => {
        if (confirmDelete) {
            const timer = setTimeout(() => {
                setConfirmDelete(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [confirmDelete]);
    const TypePublicNames: { [key: string]: string } = {
        'True / False': 'Boolean',
        'Count': 'Integer',
        'Number': 'Number',
        'Text': 'String',
        'Choice': 'Enumeration',
        'Date': 'Date',
        'List': 'Fields'
    }
    const Revesed = Object.keys(TypePublicNames).reduce((acc, key) => {
        acc[TypePublicNames[key]] = key;
        return acc;
    }, {} as { [key: string]: string });
    const options = Object.keys(TypePublicNames);
    return (
        <Card className='mx-2 mt-4 relative'>
            <div className='absolute top-1 right-1'>
                <Button 
                    variant={'ghost'}
                    id = 'delete'
                    onClick={() => {
                        if (confirmDelete) {
                            onDelete();
                        }
                        setConfirmDelete(!confirmDelete);
                    }}>
                    {confirmDelete ? 'Confirm' : <X />}
                </Button>
            </div>
            <CardHeader>
                <CardTitle>
                    <input
                        placeholder='Field Name'
                        className='w-full sm:w-1/2 md:w-1/4 lg:w-1/5 xl:w-1/6 text-lg font-bold'
                        value={field.object_name}
                        onChange={(e) => onChange({ ...field, object_name: rep(e.target.value) })}
                    />
                </CardTitle>
                <CardDescription>
                    <input
                        placeholder='Field Description'
                        className='w-full sm:w-1/2 md:w-1/4 lg:w-1/5 xl:w-1/6 text-md font-semibold'
                        value={field.object_description}
                        onChange={(e) => onChange({ ...field, object_description: e.target.value })}
                    />
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-2">
                    <div className="flex flex-col space-y-1.5">
                        <Label>Required</Label>
                        <Switch
                            checked={field.object_required}
                            onClick={() => onChange({ ...field, object_required: !field.object_required })}
                        />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label>Type</Label>
                        <Select
                            options = {options}
                            currentSelection={Revesed[inferType(field.object_type)]}
                            onChange={(option: string | null) => { if (option) handleTypeChange(TypePublicNames[option]) }}
                        />
                    </div>
                    <div className='mt-2 ml-8'>{Details()}</div>
                    
                </div>
            </CardContent>
        </Card>
    );
};