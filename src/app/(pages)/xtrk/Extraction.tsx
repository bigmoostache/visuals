"use client";
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { FieldEl, Fields } from './(components)/Fields';
import { json } from 'stream/consumers';
import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { Save } from 'lucide-react';

interface DataStructure {
    fields: Fields[];
}
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
                jsonNL.fields.map((field, index) => (
                    <FieldEl
                        key={index}
                        field={field}
                        onDelete={() => { const newFields = [...jsonNL.fields]; newFields.splice(index, 1); setJsonNL({ fields: newFields }); }}
                        onChange={(updatedFields: Fields) => {
                            const newFields = [...jsonNL.fields];
                            newFields[index] = updatedFields;
                            setJsonNL({ fields: newFields });
                        }}
                    />
                ))
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
