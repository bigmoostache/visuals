"use client";
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { FieldEl, Fields } from './(components)/Fields';
import { json } from 'stream/consumers';
import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { Save } from 'lucide-react';
import { DataStructure, DataStructureEl } from './(components)/DataStructure';

const Page = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    const {mutate, isLoading, isSuccess} = usePatchFile({ fetchUrl: url as string });
    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({fetchUrl: url as string})
    // parse the json
    const [jsonNL, setJsonNL] = useState<DataStructure>();
    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            setJsonNL(JSON.parse(e.target?.result as string) as DataStructure);
        }
        reader.readAsText(data);
    }, [data]);
    // Save the file
    const convertToBlob = (data: DataStructure) => {
        const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
        return new File([blob], 'filename.grid', {lastModified: Date.now(), type: blob.type});
    }
    const saveFile = () => {
        mutate(convertToBlob(jsonNL as DataStructure));
    }
    // ctrl + s to save
    useEffect(() => {
        const handleSave = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                saveFile();
            }
        }
        window.addEventListener('keydown', handleSave);
        return () => window.removeEventListener('keydown', handleSave);
    }, [jsonNL]);
    return (
        <div>
            <div className="flex justify-end p-4 cursor-pointer" onClick={saveFile}>
                {isLoading ? 'Saving' : <Save/>}
            </div>
            {jsonNL && (
                <DataStructureEl
                className='p-2 pt-0'
                    data_structure={jsonNL}
                    onChange={setJsonNL}
                    onAddField={() => {
                        setJsonNL({...jsonNL, fields: [...jsonNL.fields, {object_name: '', object_description: '', object_required: true, object_type: {string: 'string', string_maxLength : null}}]});
                    }}
                />
            )}
        </div>
    );
}

const ExtractionPage = () => {
    return (
      <Suspense>
        <Page />
      </Suspense>
    )
}

export default ExtractionPage;
