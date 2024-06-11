"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'

const Redaction = () => {
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
        <h1>HELLO WORD</h1>
    );
}

const RedactionPage = () => {
    return (
      // You could have a loading skeleton as the `fallback` too
      <Suspense>
        <Redaction />
      </Suspense>
    )
}

export default RedactionPage;
