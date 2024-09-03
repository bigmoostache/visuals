"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Entries, ValueMultiplicity, ValueType } from "../Extraction"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import Entry from "./Entry"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import usePatchFile from "../../(hooks)/usePatchFile"

export default function Component(
  {data, url}: {data : Entries, url : string}
) {
  const [docHaBeenModified, setDocHasBeenModified] = useState<boolean>(false)

  const [oneEntry, setOneEntry] = useState<boolean>(data.one_entry_only_per_document)
  const onEntryClick = () => {  
    const newValue = !oneEntry; 
    setOneEntry(newValue); 
    data.one_entry_only_per_document = newValue; 
    setDocHasBeenModified(true);
  }

  const [entryDef, setEntryDef] = useState<string>(data.entry_definition)
  const onEntryDefChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {  
    const newValue = e.target.value; 
    setEntryDef(newValue); 
    data.entry_definition = newValue; 
    setDocHasBeenModified(true);
  }
  
  const [entries, setEntries] = useState(data.entries);
  const onAddEntry = () => {
    const newEntry = {
      name: '',
      description: '',
      examples: [],
      value: ValueType.STR,
      multiple: ValueMultiplicity.SINGLE,
      unit: ''
    };
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    data.entries = newEntries;
    setDocHasBeenModified(true);
  }
  const onDeleteEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    data.entries = newEntries;
    setDocHasBeenModified(true);
  }

  const {mutate, isLoading, isSuccess} = usePatchFile(
    {fetchUrl: url as string}
  );
  const convertToBlob = (data: Entries) => {
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    return new File([blob], 'filename.json', {lastModified: Date.now(), type: blob.type});
  }
  const onSave = async () => {
    mutate(convertToBlob(data));
  }
    


  return (
    <div className="relative grid gap-6 text-left">
      {docHaBeenModified &&
        <div className="absolute top-0 right-0">
          <Button
            onClick={onSave}
            disabled={isLoading}
          >Save
          </Button>
        </div>
      }
      <div className="grid gap-3">
        <Label htmlFor="description">One Row = One Document</Label>
        <Switch 
          id="one_entry_only_per_document" 
          checked={oneEntry}
          onClick={onEntryClick}
        />
      </div>
      {oneEntry ? null :
        <div className="grid gap-3">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="In case of multiple entries, describe how to define a single row of entries"
          className="min-h-32"
          value={entryDef}
          onChange={onEntryDefChange}
        />
      </div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">        
        {entries.map((entry, index) => (
          <Entry key={index} data={entry} onDeleteClick={() => onDeleteEntry(index)} setDocHasBeenModified={setDocHasBeenModified}/>
        ))}
        <div
          className="text-sm rounded p-2 flex flex-col bg-blue-50 hover:bg-blue-100 cursor-pointer items-center justify-center"
          onClick={onAddEntry}
        >
          <Plus
            className="h-12 w-12 text-blue-800"
          />
        </div>
      </div>
    </div>
  )
}
