"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import DataTable  from './components/Table'

const Grid = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({fetchUrl: url as string})
    // Local states, you may modify this for other types
    console.log(data)

    // Local conversion blob -> local type
    // TODO

    // Local conversion local type -> blob
    // TODO

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
        <div className="w-screen h-screen relative bg-white-200 overflow-hidden">
            {/* Hello World */}
        <DataTable />

        </div>
    );
}

const GridPage = () => {
    return (
      // You could have a loading skeleton as the `fallback` too
      <Suspense>
        <Grid />
      </Suspense>
    )
}

export default GridPage;
