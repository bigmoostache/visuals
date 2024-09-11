"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { on } from 'events';

interface ExclusionCriteria {
    exclusion_criteria_description: string; // Describe precisely the situation where this exclusion criteria should be applied.
    name: string; // The name of the exclusion criteria. Should be upper, no special characters, spaces replaced by underscores and no numbers.
  }
  
interface InclusionCriteria {
inclusion_criteria_description: string; // Describe precisely the situation where this inclusion criteria should be applied.
name: string; // The name of the selection criteria. Should be upper, no special characters, spaces replaced by underscores and no numbers.
}

interface Select {
selection_criteria: (ExclusionCriteria | InclusionCriteria)[]; // List of selection criteria
}

  
const SelectC = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    const {mutate, isLoading, isSuccess} = usePatchFile({ fetchUrl: url as string });
    useEffect(() => {
        if (isSuccess) {
            setModified(false);
        }
    }, [isSuccess]);
    const convertToBlob = (data: Select) => {
        const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
        return new File([blob], 'filename.select', {lastModified: Date.now(), type: blob.type});
    }
    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({fetchUrl: url as string})
    // parse the json
    const [jsonNL, setJsonNL] = useState<Select>();
    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            setJsonNL(JSON.parse(e.target?.result as string) as Select);
        }
        reader.readAsText(data);
    }, [data]);
    const [modified, setModified] = useState<boolean>(false);
    const onSave = async () => {
        if (!jsonNL) return;
        mutate(convertToBlob(jsonNL));
    }

    const [rows, setRows] = useState<(ExclusionCriteria | InclusionCriteria)[]>([]);
    useEffect(() => {
        if (jsonNL) {
            setRows(jsonNL.selection_criteria);
        }
    }
    , [jsonNL]);

    const Row = ({criteria, index}: {criteria: ExclusionCriteria | InclusionCriteria, index: number}) => {
        const [name, setName] = useState<string>(criteria.name);
        const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let newValue = e.target.value.toUpperCase().replace(/[^A-Z_]/g, '');
            setName(newValue);
            criteria.name = newValue;
            setModified(true);
        }
        const [description, setDescription] = useState<string>(
            'inclusion_criteria_description' in criteria ? criteria.inclusion_criteria_description : criteria.exclusion_criteria_description
        );
        const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            setDescription(newValue);
            if ('inclusion_criteria_description' in criteria) {
                criteria.inclusion_criteria_description = newValue;
            } else {
                criteria.exclusion_criteria_description = newValue;
            }
            setModified(true);
        }
        const onDelete = () => {
            if (!jsonNL) return;
            setRows(rows.filter((_, i) => i !== index));
            jsonNL.selection_criteria = rows.filter((_, i) => i !== index);
            setModified(true);
        }
        const isInclusion = 'inclusion_criteria_description' in criteria;
        return (
            <div className={`flex flex-row gap-x-2 justify-center my-2 p-3 ${isInclusion ? 'bg-green-50' : 'bg-red-50'} border-2 ${isInclusion ? 'border-green-100' : 'border-red-100'} rounded-xl shadow-xl`}>
                <Input 
                    value={name} 
                    onChange={onNameChange} 
                    className='border-none shadow-none'
                />
                <Textarea 
                    value={description} 
                    rows = {7}
                    onChange={onDescriptionChange}
                    className='border-none shadow-none resize-none'
                />
                <Button 
                    onClick={onDelete}
                    variant='destructive'
                >
                    <Trash2 
                    size={18}
                    className='hover:text-red-200'
                    />
                </Button>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen relative overflow-y-auto text-center ">
            {modified &&
                <div className='p-2 flex justify-end'>
                    <Button
                        onClick={onSave}
                        disabled={isLoading}
                    >Save
                    </Button>
                </div>
                    }
            {
                rows.map((criteria, index) => (
                    <Row key={index} criteria={criteria} index={index} />
                ))
            }
            {jsonNL && <Button 
                variant='outline'
                className='w-full shadow-xl mt-1 bg-red-50 border-2 border-red-200'
                onClick={() => {
                    const new_rows =  [...rows, {
                        exclusion_criteria_description: '',
                        name: 'EXCLUSION_'
                    }]
                    setRows(new_rows);
                    setModified(true);
                    jsonNL.selection_criteria = new_rows;
                }}>
                Add Exclusion Criteria
            </Button>}
            {jsonNL && <Button 
                variant='outline'
                className='w-full shadow-xl mt-1 bg-green-50 border-green-200 border-2'
                onClick={() => {
                    const new_rows =  [...rows, {
                        exclusion_criteria_description: '',
                        name: 'INCLUSION_'
                    }]
                    setRows(new_rows);
                    setModified(true);
                    jsonNL.selection_criteria = new_rows;
                }}>
                Add Inclusion Criteria
            </Button>}
        </div>
    );
}

const Select = () => {
    return (
      // You could have a loading skeleton as the `fallback` too
      <Suspense>
        <SelectC />
      </Suspense>
    )
}

export default Select;
