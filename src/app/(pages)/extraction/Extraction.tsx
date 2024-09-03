"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import { Button } from "@/components/ui/button"
import Component from './(components)/MainComponent';

export enum ValueType {
    STR = 'str',
    INT = 'int',
    FLOAT = 'float',
    BOOLEAN = 'boolean',
    DATE = 'date',
    DURATION = 'duration'
}

export const ValueTypeToType = {
    "str": String,
    "int": Number,
    "float": Number,
    "boolean": Boolean,
    "date": String,
    "duration": String
};

export enum ValueMultiplicity {
    SINGLE = 'Single',
    LIST = 'List'
}

export interface Entry {
    name: string;  // Uppercase and underscores, but no spaces, no special characters, and no numbers
    description: string;  // Precise description of this value
    examples: (string | number | boolean)[];  // Examples of values
    value: ValueType;  // Type of the value
    multiple: ValueMultiplicity;  // Whether the value is a list or a single value
    unit: string;  // Unit of the value. For str, boolean, date, and duration values, just use 'na'. For int and float, you MUST provide a unit.
}

export interface Entries {
    entries: Entry[];
    one_entry_per_document_justification: boolean;  // Justify your answer: will each provided document to analyze have one, or multiple rows to extract?
    one_entry_only_per_document: boolean;  // Will each provided document to analyze have one, or multiple rows to extract?
    entry_definition: string;  // If one_entry_only_per_document is false, describe here how to define a single row of entries. If true, return 'na' here.
}


const Txt = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({fetchUrl: url as string})
    // parse the json
    const [jsonNL, setJsonNL] = useState<Entries>();
    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            setJsonNL(JSON.parse(e.target?.result as string) as Entries);
        }
        reader.readAsText(data);
    }, [data]);

    return (
        <div className="w-screen h-screen relative overflow-y-auto text-center ">
            {jsonNL && url && (
                <div className='p-4'>
                    <Component data={jsonNL} url={url}/>
                </div>
            )}
        </div>
    );
}

const ExtractionPage = () => {
    return (
      // You could have a loading skeleton as the `fallback` too
      <Suspense>
        <Txt />
      </Suspense>
    )
}

export default ExtractionPage;
