"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import useGetFileHead from '../(hooks)/useGetFileHead';

const Pdf = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({fetchUrl: url as string})

    //const url2 = URL.createObjectURL(data);
    const [url2, setUrl2] = useState<string | null>(null);
    useEffect(() => {
        if (data) {
            console.log('data', data);
            const pdfBlob = new Blob([data], { type: "application/pdf" });
            const blobUrl = URL.createObjectURL(pdfBlob);
            setUrl2(blobUrl);
        }
    }, [data]);
    return (
        <div>
           {url2 &&  
           <iframe 
                src={url2}
                className="w-screen h-screen"/>
            }
        </div>
    );
}

const PdfPage = () => {
    return (
      // You could have a loading skeleton as the `fallback` too
      <Suspense>
        <Pdf />
      </Suspense>
    )
}

export default PdfPage;
