"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Trash2, Save, Plus, Check, GripVertical, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from "@/components/ui/card";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ExclusionCriteria {
    exclusion_criteria_description: string; 
    name: string;
    code: string;
}
  
interface InclusionCriteria {
    inclusion_criteria_description: string;
    name: string; 
    code: string;
}

interface Select {
    context?: string;
    selection_criteria: (ExclusionCriteria | InclusionCriteria)[];
}

// This component wraps the Row with drag-and-drop functionality
const SortableRow = ({ criteria, index, onDelete }: {
  criteria: ExclusionCriteria | InclusionCriteria, 
  index: number,
  onDelete: (index: number) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  };

  const isInclusion = 'inclusion_criteria_description' in criteria;

  return (
    <div ref={setNodeRef} style={style} className={`mb-4 ${isDragging ? 'opacity-70' : ''}`}>
      <Card 
        className={`border-l-4 shadow-sm ${
          isInclusion ? 'border-l-emerald-500' : 'border-l-rose-500'
        } ${isDragging ? 'shadow-lg ring-2 ring-offset-2 ring-blue-200' : ''} 
        transition-all duration-200`}
      >
        <CardContent className="p-4">
          <Row 
            criteria={criteria} 
            index={index} 
            onDelete={onDelete}
            dragHandleProps={{ attributes, listeners }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const Row = ({
  criteria, 
  index, 
  onDelete,
  dragHandleProps
}: {
  criteria: ExclusionCriteria | InclusionCriteria, 
  index: number,
  onDelete: (index: number) => void,
  dragHandleProps?: any
}) => {
  const isInclusion = 'inclusion_criteria_description' in criteria;
  const [pendingDelete, setPendingDelete] = useState<boolean>(false);
  const [name, setName] = useState<string>(criteria.name);
  const [code, setCode] = useState<string>(criteria.code || '');
  const [description, setDescription] = useState<string>(
    isInclusion ? criteria.inclusion_criteria_description : criteria.exclusion_criteria_description
  );
  
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.toUpperCase().replace(/[^A-Z_]/g, '');
    setName(newValue);
    criteria.name = newValue;
  }
  
  const onCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(newValue);
    criteria.code = newValue;
  }
  
  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setDescription(newValue);
    if (isInclusion) {
      (criteria as InclusionCriteria).inclusion_criteria_description = newValue;
    } else {
      (criteria as ExclusionCriteria).exclusion_criteria_description = newValue;
    }
  }
  
  const handleDelete = () => {
    if (pendingDelete) {
      onDelete(index);
    } else {
      setPendingDelete(true);
      // Reset after 3 seconds if not confirmed
      setTimeout(() => setPendingDelete(false), 3000);
    }
  }
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {dragHandleProps && (
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          >
            <GripVertical size={18} />
          </button>
        )}
        <div className={`h-2 w-2 rounded-full ${isInclusion ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
        <div className="text-sm font-medium text-gray-700">
          {isInclusion ? 'Inclusion Criteria' : 'Exclusion Criteria'}
        </div>
        <div className="flex-grow"></div>
        <Button 
          onClick={handleDelete}
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${pendingDelete 
            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
            : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50'}`}
        >
          {pendingDelete ? <Check size={16} /> : <Trash2 size={16} />}
        </Button>
      </div>
      
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <div className="text-sm font-medium text-gray-700 mb-1">Name</div>
          <Input 
            value={name} 
            onChange={onNameChange}
            placeholder="CRITERIA_NAME"
            className="font-mono text-sm"
          />
        </div>
        <div className="col-span-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Code</div>
          <Input 
            value={code} 
            onChange={onCodeChange}
            placeholder="code"
            className="font-mono text-sm"
          />
        </div>
        <div className="col-span-12">
          <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
          <Textarea 
            value={description}
            onChange={onDescriptionChange}
            placeholder="Enter detailed description of the criteria..."
            rows={4}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
}

const SelectC = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    const {mutate, isLoading, isSuccess} = usePatchFile({ fetchUrl: url as string });
    
    useEffect(() => {
        if (isSuccess) {
            setModified(false);
        }
    }, [isSuccess]);
    
    const convertToBlob = (data: Select) => {
        const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
        return new File([blob], 'filename.select', {lastModified: Date.now(), type: blob.type});
    }
    
    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({fetchUrl: url as string})
    // parse the json
    const [jsonNL, setJsonNL] = useState<Select>();
    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            setJsonNL(JSON.parse(e.target?.result as string) as Select);
        }
        reader.readAsText(data);
    }, [data]);
    
    const [modified, setModified] = useState<boolean>(false);
    const onSave = async () => {
        if (!jsonNL) return;
        mutate(convertToBlob(jsonNL));
    }

    const [rows, setRows] = useState<(ExclusionCriteria | InclusionCriteria)[]>([]);
    useEffect(() => {
        if (jsonNL) {
            // Initialize code field if it doesn't exist
            const updatedCriteria = jsonNL.selection_criteria.map((criteria) => {
                if (!('code' in criteria)) {
                    return { ...criteria as object, code: '' } as ExclusionCriteria | InclusionCriteria;
                }
                return criteria;
            });
            jsonNL.selection_criteria = updatedCriteria;
            setRows(updatedCriteria);
        }
    }, [jsonNL]);

    // Add keyboard shortcut for save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                onSave();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [modified, jsonNL, onSave]);
    
    // Set up sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Minimum drag distance to activate
            },
        })
    );
    
    const [activeId, setActiveId] = useState<number | null>(null);
    
    // Handle the start of a drag operation
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(parseInt(event.active.id as string));
    };
    
    // Handle the end of a drag operation
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            const oldIndex = parseInt(active.id as string);
            const newIndex = parseInt(over.id as string);
            
            setRows((items) => {
                const newOrder = arrayMove(items, oldIndex, newIndex);
                if (jsonNL) {
                    jsonNL.selection_criteria = newOrder;
                    setModified(true);
                }
                return newOrder;
            });
        }
        
        setActiveId(null);
    };
    
    // Handle criteria deletion
    const handleDelete = (index: number) => {
        if (!jsonNL) return;
        setRows(rows.filter((_, i) => i !== index));
        jsonNL.selection_criteria = jsonNL.selection_criteria.filter((_, i) => i !== index);
        setModified(true);
    };

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Selection Criteria</h1>
                    <Button
                        onClick={onSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        variant="default"
                    >
                        {isLoading?
                        <Loader2 className="animate-spin" size={16} />
                        :<><Save size={16} />
                        Save Changes
                        </>}
                    </Button>
            </div>
            
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={rows.map((_, index) => index.toString())}
                    strategy={verticalListSortingStrategy}
                >
                    <div>
                        {rows.map((criteria, index) => (
                            <SortableRow 
                                key={`${index} ${criteria.name}`} 
                                criteria={criteria} 
                                index={index} 
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </SortableContext>
                
                <DragOverlay adjustScale={true}>
                    {activeId !== null && rows[activeId] ? (
                        <div className="w-full max-w-4xl">
                            <Card 
                                className={`border-l-4 shadow-xl ${
                                    'inclusion_criteria_description' in rows[activeId] 
                                        ? 'border-l-emerald-500' 
                                        : 'border-l-rose-500'
                                }`}
                            >
                                <CardContent className="p-4">
                                    <Row 
                                        criteria={rows[activeId]} 
                                        index={activeId} 
                                        onDelete={handleDelete}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
            
            {jsonNL && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <Button 
                        variant="outline"
                        className="flex items-center justify-center gap-2 border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-6 rounded-lg shadow-sm transition-all duration-200 h-auto"
                        onClick={() => {
                            const new_rows = [...rows, {
                                inclusion_criteria_description: '',
                                name: 'INCLUSION_',
                                code: ''
                            }]
                            setRows(new_rows);
                            setModified(true);
                            jsonNL.selection_criteria = new_rows;
                        }}>
                        <Plus size={20} />
                        <span className="font-medium">Add Inclusion Criteria</span>
                    </Button>
                    <Button 
                        variant="outline"
                        className="flex items-center justify-center gap-2 border-2 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 p-6 rounded-lg shadow-sm transition-all duration-200 h-auto"
                        onClick={() => {
                            const new_rows = [...rows, {
                                exclusion_criteria_description: '',
                                name: 'EXCLUSION_',
                                code: ''
                            }]
                            setRows(new_rows);
                            setModified(true);
                            jsonNL.selection_criteria = new_rows;
                        }}>
                        <Plus size={20} />
                        <span className="font-medium">Add Exclusion Criteria</span>
                    </Button>
                </div>
            )}
        </div>
    );
}

const Select = () => {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <SelectC />
      </Suspense>
    )
}

export default Select;