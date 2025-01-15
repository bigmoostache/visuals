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
import { Grip, X } from 'lucide-react';
import { Boolean, BooleanEl } from './Boolean';
import { DataStructure, DataStructureEl } from './DataStructure';
import { on } from 'events';

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
    object_type: Boolean | Integer | Number | String | Enumeration | Date | DataStructure;
    global_id?: string;
}

export const FieldEl = (
    { field, onChange, onDelete, droppedField, setDroppedField, onAddBefore }
    : 
    { 
        field: Fields, 
        onChange: (updatedFields: Fields) => void, 
        onDelete: () => void,
        droppedField: string | null, 
        setDroppedField: (field: string | null) => void,
        onAddBefore: (field: Fields) => void
    }) => {
    const inferType = (object_type: any) => {
        if ('boolean' in object_type) {
            return 'Boolean';
        } else if ('object_list' in object_type) {
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
                    onChange({ ...field, object_type: { boolean : 'boolean'} });
                    break;
                case 'Number':
                    onChange({ ...field, object_type: { _float: 'float', number_minimum: null, number_maximum: null, number_unit: null } });
                    break;
                case 'String':
                    onChange({ ...field, object_type: { string: 'string', string_maxLength: null } });
                    break;
                case 'Enumeration':
                    onChange({ ...field, object_type: { enum: 'enum', enumeration_choices: [] } });
                    break;
                case 'Date':
                    onChange({ ...field, object_type: { date: 'date', date_format: 'AAAA-MM-JJ' } });
                    break;
                case 'Integer':
                    onChange({ ...field, object_type: { integer: 'integer', integer_minimum: null, integer_maximum: null } });
                    break;
                case 'Fields':
                    onChange({ ...field, object_type: { object_list: 'object_list', fields: [
                        { object_name: '', object_description: '', object_required: false, object_type: { string: 'string', string_maxLength: null } }
                    ] } });
            }
        }
        setRecomputeHook(!recomputeHook);
    }

    const Details = (
    ) => {
        return (
            <>
            {'boolean' in (field.object_type as any) && <BooleanEl />}
            {'integer' in (field.object_type as any) && <IntegerEl integer={field.object_type as Integer} onChange={(updated) => onChange({ ...field, object_type: updated })} />}
            {'_float' in (field.object_type as any) && <NumberEl number={field.object_type as Number} onChange={(updated) => onChange({ ...field, object_type: updated })} />}
            {'string' in (field.object_type as any) && <StringEl string={field.object_type as String} onChange={(updated) => onChange({ ...field, object_type: updated })} />}
            {'enum' in (field.object_type as any) && <EnumerationEl enumeration={field.object_type as Enumeration} onChange={(updated) => onChange({ ...field, object_type: updated })} />}
            {'date' in (field.object_type as any) && <DateEl date={field.object_type as Date} onChange={(updated) => onChange({ ...field, object_type: updated })} />}
            {'object_list' in (field.object_type as any) && 
                <DataStructureEl 
                    onAddField={() => {
                        if ('fields' in field.object_type) {
                            onChange({ ...field, object_type: { ...field.object_type, fields: [...field.object_type.fields, { object_name: '', object_description: '', object_required: false, object_type: { string: 'string', string_maxLength: null } }] } });
                        }
                    }}
                    data_structure={field.object_type as DataStructure} 
                    onChange={(updated) => onChange({ ...field, object_type: updated })} 
                    droppedField={droppedField}
                    setDroppedField={setDroppedField}
            />}
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
        'Sheet': 'Fields'
    }
    const Revesed = Object.keys(TypePublicNames).reduce((acc, key) => {
        acc[TypePublicNames[key]] = key;
        return acc;
    }, {} as { [key: string]: string });
    const options = Object.keys(TypePublicNames);
    const [isDraggedOver, setIsDraggedOver] = useState(false);
    const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        setDroppedField(null);
        e.dataTransfer.setData('text/plain2', JSON.stringify(field));
    }
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        setIsDraggedOver(false);
        console.log('received data', e.dataTransfer.getData('text/plain2'));
        const dropped = JSON.parse(e.dataTransfer.getData('text/plain2')) as Fields;
        setDroppedField(dropped.object_name);
        onAddBefore(dropped);
    }
    const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        const isMe = droppedField === field.object_name;
        console.log('drag ended, dropped field', droppedField, 'is me', isMe);
        if (isMe) onDelete();
    }
    return (
        <Card 
            className={`relative h-full rounded-lg`}>
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggedOver(true);
                }}
                onDrop={onDrop}
                onDragLeave={() => setIsDraggedOver(false)}
                className={`absolute h-full rounded-l-md border-gray-400 w-6 ${isDraggedOver && 'border-l-4'}`}>
            </div>
            <div 
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                draggable
                className='absolute top-0 right-8 text-gray-300'>
                <Grip className='absolute top-1 left-1 cursor-move'/>
            </div>
            <div className='absolute bottom-1 right-1'>
                <Button 
                    variant={'ghost'}
                    id = 'delete'
                    className={`hover:bg-gradient-to-r hover:from-red-100 hover:to-red-300  hover:ring-2 hover:ring-red-700 hover:ring-offset-2`}
                    onClick={() => {
                        if (confirmDelete) {
                            onDelete();
                        }
                        setConfirmDelete(!confirmDelete);
                    }}>
                    {confirmDelete ? 'Confirm' : 'Delete'}
                </Button>
            </div>
            <CardHeader>
                <CardTitle>
                    <input
                        placeholder='Field Name'
                        className='w-full text-lg font-bold'
                        value={field.object_name}
                        onChange={(e) => onChange({ ...field, object_name: rep(e.target.value) })}
                    />
                </CardTitle>
                <CardDescription>
                    <input
                        placeholder='Field Description'
                        className='w-full text-md font-semibold'
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
                    <div className='mt-1'>{Details()}</div>
                    
                </div>
            </CardContent>
        </Card>
    );
};