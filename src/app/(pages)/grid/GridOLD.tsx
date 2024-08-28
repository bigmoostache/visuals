"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
// import Table1 from './components/Table1'
// import Table2  from './components/Table2'
import Table3 from './components/Table3'
// import ParentComponent from './components/Table4'


const Grid = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')


  // http://localhost:3000/grid?url=https%3A//pipelines.blends.fr/dev/%3Ffile_name%3Debf3fa41-e46e-4d1f-8977-ded962b33caa_2024-08-20%2020%3A56%3A57.568963.grid%26dataset_id%3D1618%26file_access_token%3D65e6af6a-2830-4866-9a5a-75f46179fdf3_2024-08-20%2020%3A56%3A57.568919

    // console.log(url)



    // NO-CHANGE Retrieving BLOB
    // const { data } = useGetFile({fetchUrl: url as string})
    // // Local states, you may modify this for other types
    // console.log(data)



    // Local conversion blob -> local type
    // TODO
  // const { data } = useGetFile({ fetchUrl: url as string });

    // console.log(data)


  // useEffect(() => {
  //   if (data) {
  //     // Convert the Blob content to text and then parse it as JSON
  //     data.text().then((content) => {
  //       try {
  //         const jsonData = JSON.parse(content);
  //         console.log(jsonData); // Logs the parsed JSON object to the console
  //       } catch (error) {
  //         console.error("Error parsing JSON:", error);
  //       }
  //     });
  //   }
  // }, [data]);

    // Local conversion local type -> blob
    // TODO

    // NO-CHANGE Updating BLOB imports
    // const { mutate, isLoading, isSuccess } = usePatchFile(
    //     {fetchUrl: url as string}
    // );
    // // Updating BLOB local logic (especially, onSuccess)
    // const onSubmit = async () => {
    //     console.log('submit');
    //     setUpdatableAgain(false);
    //     mutate(convertBackToFile(text));
    // }

    return (


      <div className="w-screen  relative bg-white-200 overflow-hidden">
        {/* <div>
          <h1>Table: Detailed Format with Separate Columns</h1>
        </div> */}
        {/* <div>
          <h1>this is Table1</h1>
          <Table1 />
        </div> */}
        {/* <div>
          <h1>this is Table2</h1>
          <Table2 />
        </div> */}
        {/* <div>
          <h1>this is Table3</h1>
          <Table3 />
        </div> */}




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
