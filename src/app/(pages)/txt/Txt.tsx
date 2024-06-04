"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'

const Txt = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({fetchUrl: url as string})
    // Local states, you may modify this for other types
    const [text, setText] = useState<string>('');
    const [updatable, setUpdatable] = useState<boolean>(false);
    const [updatableAgain, setUpdatableAgain] = useState<boolean>(false);
    // Local conversion blob -> local type
    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function(e) {
          setText(e.target?.result as string);
        }
        reader.readAsText(data);
      }, [data]);
    // Local conversion local type -> blob
    const convertBackToFile = (text: string) => {
        const blob = new Blob([text], {type: 'text/plain'});
        return new File([blob], 'filename.txt', { lastModified: Date.now(), type: blob.type });
    }
    // NO-CHANGE Updating BLOB imports
    const { mutate, isLoading, isSuccess } = usePatchFile(
        {fetchUrl: url as string}
    );
    // Updating BLOB local logic (especially, onSuccess)
    const onSubmit = async () => {
        console.log('submit');
        setUpdatableAgain(false);
        mutate(convertBackToFile(text));
    }

    return (
        <div>
            { updatable && 
            <div
                onClick={onSubmit}
                className='absolute top-2 right-4 px-2 py-1 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-400 transition-colors duration-300 ease-in-out text-sm'
            >
            {
                updatableAgain && 'Update'
            }
            {
                !updatableAgain && isLoading && 'Updating...'
            }
            {
                !updatableAgain && !isLoading && isSuccess && 
                <svg 

                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="size-5 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            }
            </div>
            }
            <textarea 
            className='w-screen h-screen text-black bg-white p-2'
            value={text} 
            onChange={(e) => {setText(e.target.value);setUpdatable(true);setUpdatableAgain(true)}}
            />
        </div>
    );
}

const TxtPage = () => {
    return (
      // You could have a loading skeleton as the `fallback` too
      <Suspense>
        <Txt />
      </Suspense>
    )
}

export default TxtPage;