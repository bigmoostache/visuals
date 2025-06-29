"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Sortable wrapper for possible values
const SortablePossibleValue = ({ 
    possibleValue, 
    onDelete, 
    onUpdate 
}: { 
    possibleValue: PossibleValue; 
    onDelete: () => void;
    onUpdate: (value: number, definition: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `value-${possibleValue.value}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
                <GripVertical className="w-4 h-4" />
            </div>
            
            <div className="flex items-center gap-3 flex-1">
                <Input
                    type="number"
                    value={possibleValue.value}
                    onChange={(e) => onUpdate(Number(e.target.value), possibleValue.definition)}
                    className="w-20 text-center"
                    min={0}
                    max={100}
                />
                <Input
                    value={possibleValue.definition}
                    onChange={(e) => onUpdate(possibleValue.value, e.target.value)}
                    placeholder="Enter definition..."
                    className="flex-1"
                />
            </div>
            
            <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
};

// Sortable wrapper for criteria
const SortableNotationCriteria = ({ 
    notationCriteria, 
    onDelete, 
    onUpdate,
    setModified 
}: { 
    notationCriteria: NotationCriteria; 
    onDelete: () => void;
    onUpdate: (criteria: NotationCriteria) => void;
    setModified: (modified: boolean) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `criteria-${notationCriteria.name}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [possibleValues, setPossibleValues] = useState(notationCriteria.possible_values);
    const [newValue, setNewValue] = useState<number | null>(null);
    const [newDefinition, setNewDefinition] = useState<string>("");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = possibleValues.findIndex(val => `value-${val.value}` === active.id);
            const newIndex = possibleValues.findIndex(val => `value-${val.value}` === over.id);
            const newOrder = arrayMove(possibleValues, oldIndex, newIndex);
            setPossibleValues(newOrder);
            notationCriteria.possible_values = newOrder;
            onUpdate(notationCriteria);
            setModified(true);
        }
    };

    const handleAddValue = () => {
        if (newValue === null || newDefinition.trim() === "") return;
        const newPossibleValue = { value: newValue, definition: newDefinition };
        const updatedValues = [...possibleValues, newPossibleValue];
        setPossibleValues(updatedValues);
        notationCriteria.possible_values = updatedValues;
        onUpdate(notationCriteria);
        setModified(true);
        setNewValue(null);
        setNewDefinition("");
    };

    return (
        <Card ref={setNodeRef} style={style} className="group">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                        <Input
                            value={notationCriteria.name}
                            onChange={(e) => {
                                notationCriteria.name = e.target.value;
                                onUpdate(notationCriteria);
                                setModified(true);
                            }}
                            placeholder="Question name..."
                            className="font-semibold text-lg"
                        />
                        <Textarea
                            value={notationCriteria.definition}
                            onChange={(e) => {
                                notationCriteria.definition = e.target.value;
                                onUpdate(notationCriteria);
                                setModified(true);
                            }}
                            placeholder="Question description..."
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Possible Values</h4>
                    
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={possibleValues.map(val => `value-${val.value}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {possibleValues.map((possibleValue) => (
                                    <SortablePossibleValue
                                        key={possibleValue.value}
                                        possibleValue={possibleValue}
                                        onDelete={() => {
                                            const updatedValues = possibleValues.filter(
                                                (item) => item.value !== possibleValue.value
                                            );
                                            setPossibleValues(updatedValues);
                                            notationCriteria.possible_values = updatedValues;
                                            onUpdate(notationCriteria);
                                            setModified(true);
                                        }}
                                        onUpdate={(value, definition) => {
                                            const updatedValues = possibleValues.map(item =>
                                                item.value === possibleValue.value
                                                    ? { ...item, value, definition }
                                                    : item
                                            );
                                            setPossibleValues(updatedValues);
                                            notationCriteria.possible_values = updatedValues;
                                            onUpdate(notationCriteria);
                                            setModified(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    
                    <div className="flex gap-2 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <Input
                            type="number"
                            placeholder="Value"
                            value={newValue !== null ? newValue : ''}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value < 0 || value > 100) return;
                                setNewValue(value);
                            }}
                            className="w-20 text-center"
                            min={0}
                            max={100}
                        />
                        <Input
                            placeholder="Definition"
                            value={newDefinition}
                            onChange={(e) => setNewDefinition(e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleAddValue}
                            disabled={newValue === null || newDefinition.trim() === ""}
                            size="sm"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Sortable wrapper for sections
const SortableGridSection = ({ 
    gridSection, 
    onDelete, 
    onUpdate,
    setModified 
}: { 
    gridSection: GridSection; 
    onDelete: () => void;
    onUpdate: (section: GridSection) => void;
    setModified: (modified: boolean) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `section-${gridSection.name}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [rows, setRows] = useState(gridSection.rows);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = rows.findIndex(row => `criteria-${row.name}` === active.id);
            const newIndex = rows.findIndex(row => `criteria-${row.name}` === over.id);
            const newOrder = arrayMove(rows, oldIndex, newIndex);
            setRows(newOrder);
            gridSection.rows = newOrder;
            onUpdate(gridSection);
            setModified(true);
        }
    };

    return (
        <Card ref={setNodeRef} style={style} className="group">
            <CardHeader className="border-b bg-gray-50">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <Input
                        value={gridSection.name}
                        onChange={(e) => {
                            if (e.target.value.match(/[^\w\s]/)) return;
                            gridSection.name = e.target.value;
                            onUpdate(gridSection);
                            setModified(true);
                        }}
                        placeholder="Section name..."
                        className="text-xl font-semibold border-none shadow-none bg-transparent"
                    />
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={rows.map(row => `criteria-${row.name}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {rows.map((notationCriteria, index) => (
                                <SortableNotationCriteria
                                    key={index}
                                    notationCriteria={notationCriteria}
                                    onDelete={() => {
                                        const updatedRows = rows.filter((_, i) => i !== index);
                                        setRows(updatedRows);
                                        gridSection.rows = updatedRows;
                                        onUpdate(gridSection);
                                        setModified(true);
                                    }}
                                    onUpdate={(criteria) => {
                                        rows[index] = criteria;
                                        onUpdate(gridSection);
                                    }}
                                    setModified={setModified}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                
                <Button
                    variant="outline"
                    onClick={() => {
                        const updatedRows = [...rows, { name: "", definition: "", possible_values: [] }];
                        setRows(updatedRows);
                        gridSection.rows = updatedRows;
                        onUpdate(gridSection);
                        setModified(true);
                    }}
                    className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                </Button>
            </CardContent>
        </Card>
    );
};

const GridC = () => {
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    const { mutate, isLoading, isSuccess } = usePatchFile({ fetchUrl: url as string });
    
    useEffect(() => {
        if (isSuccess) {
            setModified(false);
        }
    }, [isSuccess]);

    const convertToBlob = (data: Grid) => {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        return new File([blob], 'filename.grid', { lastModified: Date.now(), type: blob.type });
    }

    const { data } = useGetFile({ fetchUrl: url as string })
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
    const [context, setContext] = useState(jsonNL?.context);
    const [gridSections, setGridSections] = useState<GridSection[]>([]);

    useEffect(() => {
        if (jsonNL) {
            setContext(jsonNL.context);
            setGridSections(jsonNL.rows);
        }
    }, [jsonNL]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = gridSections.findIndex(section => `section-${section.name}` === active.id);
            const newIndex = gridSections.findIndex(section => `section-${section.name}` === over.id);
            const newOrder = arrayMove(gridSections, oldIndex, newIndex);
            setGridSections(newOrder);
            if (jsonNL) {
                jsonNL.rows = newOrder;
            }
            setModified(true);
        }
    };

    const onSave = async () => {
        if (!jsonNL) return;
        mutate(convertToBlob(jsonNL));
    }

    const updateContext = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!jsonNL) return;
        jsonNL.context = e.target.value;
        setContext(e.target.value);
        setModified(true);
    }

    if (!jsonNL || !url) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with save button */}
            <div className="sticky top-0 bg-white border-b shadow-sm z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Grid Editor</h1>
                    {modified && (
                        <Button onClick={onSave} disabled={isLoading} className="gap-2">
                            <Save className="w-4 h-4" />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Context Section */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Context</h2>
                        <p className="text-sm text-gray-600">
                            Provide context or instructions for this grid
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Enter context or instructions..."
                            value={context || ''}
                            onChange={updateContext}
                            className="min-h-32 resize-none"
                        />
                    </CardContent>
                </Card>

                {/* Grid Sections */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Sections</h2>
                        <Button
                            variant="outline"
                            onClick={() => {
                                const updatedSections = [...gridSections, { name: "", rows: [] }];
                                setGridSections(updatedSections);
                                jsonNL.rows = updatedSections;
                                setModified(true);
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Section
                        </Button>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={gridSections.map(section => `section-${section.name}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-6">
                                {gridSections.map((gridSection, index) => (
                                    <SortableGridSection
                                        key={index}
                                        gridSection={gridSection}
                                        onDelete={() => {
                                            const updatedSections = gridSections.filter((_, i) => i !== index);
                                            setGridSections(updatedSections);
                                            jsonNL.rows = updatedSections;
                                            setModified(true);
                                        }}
                                        onUpdate={(section) => {
                                            gridSections[index] = section;
                                            setModified(true);
                                        }}
                                        setModified={setModified}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </div>
    );
}

const Grid = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        }>
            <GridC />
        </Suspense>
    )
}

export default Grid;