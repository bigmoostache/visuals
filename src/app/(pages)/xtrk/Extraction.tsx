"use client";
import { useState } from 'react';
import { Suspense } from 'react';
import { FieldEl, Fields } from './(components)/Fields';
import { json } from 'stream/consumers';

interface DataStructure {
    fields: Fields[];
}
const actorsModel: DataStructure = {
    fields: [
        {
            object_name: "name",
            object_description: "The name of the actor",
            object_required: true,
            object_type: {
                string_maxLength: 100
            }
        },
        {
            object_name: "date_of_birth",
            object_description: "The date of birth of the actor",
            object_required: true,
            object_type: {
                date_format: 'AAAA-MM-JJ'
            }
        },
        {
            object_name: "country_of_birth",
            object_description: "The country where the actor was born",
            object_required: true,
            object_type: {
                string_maxLength: 100
            }
        },
        {
            object_name: "gender",
            object_description: "The gender of the actor",
            object_required: true,
            object_type: {
                enumeration_choices: ["male", "female"]
            }
        },
        {
            object_name: "list_of_movies",
            object_description: "A list of movies the actor has appeared in",
            object_required: false,
            object_type: [
                {
                    object_name: "title",
                    object_description: "The title of the movie",
                    object_required: true,
                    object_type: {
                        string_maxLength: 100
                    }
                },
                {
                    object_name: "year",
                    object_description: "The year the movie was released",
                    object_required: true,
                    object_type: {
                        integer_minimum: 1900,
                        integer_maximum: 2022
                    }
                }
            ] // List of subfields or just strings (could be expanded based on need)
        }
    ]
};

const Page = () => {
    // NO-CHANGE Retrieving URL
    /* const searchParams = useSearchParams()
    const url = searchParams.get('url')
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
    }, [data]); */
    const [jsonNL, setJsonNL] = useState<DataStructure>(actorsModel);
    return (
        <div>
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
