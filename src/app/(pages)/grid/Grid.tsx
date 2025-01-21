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

interface PossibleValue {
    value: number;
    definition: string;
  }
  
interface NotationCriteria {
name: string;
definition: string;
possible_values: PossibleValue[];
}

interface GridSection {
name: string;
rows: NotationCriteria[];
}

interface Grid {
    context?: string;
    rows: GridSection[];
}  

const GridC = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    const {mutate, isLoading, isSuccess} = usePatchFile({ fetchUrl: url as string });
    useEffect(() => {
        if (isSuccess) {
            setModified(false);
        }
    }, [isSuccess]);
    const convertToBlob = (data: Grid) => {
        const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
        return new File([blob], 'filename.grid', {lastModified: Date.now(), type: blob.type});
    }
    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({fetchUrl: url as string})
    // parse the json
    const [jsonNL, setJsonNL] = useState<Grid>();
    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            setJsonNL(JSON.parse(e.target?.result as string) as Grid);
        }
        reader.readAsText(data);
    }, [data]);
    const [modified, setModified] = useState<boolean>(false);
    const onSave = async () => {
        if (!jsonNL) return;
        mutate(convertToBlob(jsonNL));
    }

    
    const NotationCriteriaC = ({ notationCriteria }: { notationCriteria: NotationCriteria }) => {
        const [possibleValues, setPossibleValues] = useState(notationCriteria.possible_values);
    
        const handleDelete = (valueToDelete: number) => {
            const updatedValues = possibleValues.filter((item) => item.value !== valueToDelete);
            setPossibleValues(updatedValues);
            notationCriteria.possible_values = updatedValues;
            setModified(true);
        };
        const [newValue, setNewValue] = useState<number | null>(null);
        const [newDefinition, setNewDefinition] = useState<string>("");
        const [questionName, setQuestionName] = useState<string>(notationCriteria.name);
        const [questionDefinition, setQuestionDefinition] = useState<string>(notationCriteria.definition);
    
        return (
            <div className="flex flex-rows m-2 bg-gray-100 rounded-xl p-2 shadow-md
            ">
                <div className="basis-1/4 text-left">
                        <Input
                            type="text"
                            placeholder="Name"
                            className='text-lg p-0 border-none shadow-none font-bold'
                            value={questionName}
                            onChange={(e) => {
                                setQuestionName(e.target.value);
                                notationCriteria.name = e.target.value;
                                setModified(true);
                            }}
                        />
                        <Textarea
                            placeholder="Definition"
                            rows = {5}
                            className='text-sm p-0 border-none resize-none shadow-none w-full h-fit text-wrap'
                            value={questionDefinition}
                            onChange={(e) => {
                                setQuestionDefinition(e.target.value);
                                notationCriteria.definition = e.target.value;
                                setModified(true);
                            }}
                        />
                </div>
                <ul className="basis-3/4 items-left">
                    {possibleValues
                        .sort((a, b) => a.value - b.value)
                        .map((possibleValue) => (
                            <li
                                key={possibleValue.value}
                                className="relative w-fit text-left bg-gray-200 mx-2 mb-2 p-2 rounded-lg pr-7 shadow-md"
                            >
                                {possibleValue.value}: {possibleValue.definition}
                                <X
                                    className="hover:text-red-500 cursor-pointer w-6 h-6 absolute right-0 top-0"
                                    onClick={() => handleDelete(possibleValue.value)}
                                />
                            </li>
                        ))}
                    <li className="relative w-fit text-left bg-gray-200 mx-2 mb-2 p-1 rounded-lg pr-7 flex flex-rows shadow-md">
                        <Input
                            type="number"
                            placeholder="Value"
                            className="w-16"
                            value={newValue !== null ? newValue : ''}
                            onChange={(e) => {
                                // if not parsable to int, return
                                const value = Number(e.target.value);
                                if (value < 0 || value > 100) {return;}
                                setNewValue(value);
                                setNewValue(Number(e.target.value));
                            }}
                        />
                        <Input
                            type="text"
                            placeholder="Definition"
                            className="w-64"
                            value={newDefinition}
                            onChange={(e) => setNewDefinition(e.target.value)}
                        />
                        <span
                            className='cursor-pointer hover:text-blue-500  ml-2 my-1'
                            onClick={() => {
                                if (newValue === null) return;
                                const updatedValues = [...possibleValues, {value: newValue, definition: newDefinition}];
                                setPossibleValues(updatedValues);
                                notationCriteria.possible_values = updatedValues;
                                setModified(true);
                                setNewValue(null);
                                setNewDefinition("");
                            }}
                        >Create</span>
                    </li>
                </ul>
            </div>
        );
    };
    
    const GridSectionC = ({ gridSection }: { gridSection: GridSection }) => {
        const [sectionName, setSectionName] = useState(gridSection.name);
        const [rows, setRows] = useState(gridSection.rows); // Use state to track rows
        return (
            <div className="border-2 border-black p-2 flex flex-cols m-2 rounded-xl border-gray-900 bg-gray-50 shadow-xl">
                <Textarea
                    placeholder="Section Name"
                    className="text-lg p-0 p-1 resize-none border-none shadow-none font-bold basis-1/5"
                    value={sectionName}
                    onChange={(e) => {
                        if (e.target.value.match(/[^\w\s]/)) return;
                        if (e.target.value.match(/\n/)) return;
                        setSectionName(e.target.value);
                        gridSection.name = e.target.value;
                        setModified(true);
                    }}
                />
                <div className="basis-4/5 pt-6">
                    {rows.map((notationCriteria, index) => (
                        <div className="relative" key={notationCriteria.name}>
                            <NotationCriteriaC notationCriteria={notationCriteria} />
                            <X
                                className="hover:text-red-500 text-gray-500 cursor-pointer w-6 h-6 absolute right-3 top-1"
                                onClick={() => {
                                    const updatedRows = rows.filter((_, i) => i !== index);
                                    setRows(updatedRows); // Update the state
                                    gridSection.rows = updatedRows;
                                    setModified(true);
                                }}
                            />
                        </div>
                    ))}
                    <div className='flex items-left px-2'>
                    <Button
                        onClick={() => {
                            const updatedRows = [...rows, {name: "", definition: "", possible_values: []}];
                            setRows(updatedRows); // Update the state
                            gridSection.rows = updatedRows;
                            setModified(true);
                        }}
                    >Add Question</Button>
                    </div>
                </div>
            </div>
        );
    };
    
    const GridComponent = ({grid}: {grid: Grid}) => {
        const [gridSections, setGridSections] = useState(grid.rows);

        return (
            <div>
                {grid.rows.map((gridSection, index) => (
                    <div key={index} className='relative'>
                        <Trash2
                            className="hover:text-red-500 cursor-pointer w-6 h-6 absolute right-3 top-1 text-gray-500"
                            onClick={() => {
                                const updatedSections = gridSections.filter((_, i) => i !== index);
                                setGridSections(updatedSections);
                                grid.rows = updatedSections;
                                setModified(true);
                            }}
                        />
                        <GridSectionC gridSection={gridSection}/>
                    </div>
                ))}
                <div className='flex items-left px-2'>
                <Button
                    onClick={() => {
                        const updatedSections = [...gridSections, {name: "", rows: []}];
                        setGridSections(updatedSections);
                        grid.rows = updatedSections;
                        setModified(true);
                    }}
                >Add Section
                </Button>
                </div>
            </div>
        );
    }
    const [context, setContext] = useState(jsonNL?.context);
    useEffect(() => {
        if (jsonNL) {
            setContext(jsonNL.context);
        }
    }, [jsonNL]);
    const updateContext = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!jsonNL) return;
        jsonNL.context = e.target.value;
        setContext(e.target.value);
        setModified(true);
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
            {jsonNL && url && (
            <div>
                <div className="p-4 flex flex-col items-start">
                    <h1 className="text-2xl font-bold mb-2">Context</h1>
                    <Textarea
                        placeholder="Context"
                        className='text-lg w-full p-4 border rounded shadow-sm min-h-32 resize-none rounded-lg'
                        value={context}
                        onChange={updateContext}
                    />
                </div>
                <div className="p-2">
                    <GridComponent grid={jsonNL} />
                </div>
            </div>
            )}
        </div>
    );
}

const Grid = () => {
    return (
      // You could have a loading skeleton as the `fallback` too
      <Suspense>
        <GridC />
      </Suspense>
    )
}

export default Grid;
