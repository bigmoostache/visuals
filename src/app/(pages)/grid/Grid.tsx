"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState, useRef, useCallback } from 'react'
import { Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Trash2, GripVertical, Save, ChevronDown, ChevronRight } from 'lucide-react';
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

// Auto-resizing textarea hook
const useAutoResize = (value: string) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.max(textarea.scrollHeight, 80)}px`;
        }
    }, [value]);

    return textareaRef;
};

// Generate stable IDs for sections
const generateSectionId = (section: GridSection, index: number) => {
    return section.name ? `section-${section.name}-${index}` : `section-empty-${index}`;
};

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

    const definitionRef = useAutoResize(possibleValue.definition);

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
                <Textarea
                    ref={definitionRef}
                    value={possibleValue.definition}
                    onChange={(e) => onUpdate(possibleValue.value, e.target.value)}
                    placeholder="Enter definition..."
                    className="flex-1 resize-none no-scrollbar min-h-[40px]"
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
    criteriaIndex,
    onDelete, 
    onUpdate,
    setModified 
}: { 
    notationCriteria: NotationCriteria; 
    criteriaIndex: number;
    onDelete: () => void;
    onUpdate: (criteria: NotationCriteria) => void;
    setModified: (modified: boolean) => void;
}) => {
    const criteriaId = `criteria-${notationCriteria.name}-${criteriaIndex}`;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: criteriaId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [possibleValues, setPossibleValues] = useState(notationCriteria.possible_values);
    const [newValue, setNewValue] = useState<number | null>(null);
    const [newDefinition, setNewDefinition] = useState<string>("");
    const definitionRef = useAutoResize(notationCriteria.definition);

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
                            ref={definitionRef}
                            value={notationCriteria.definition}
                            onChange={(e) => {
                                notationCriteria.definition = e.target.value;
                                onUpdate(notationCriteria);
                                setModified(true);
                            }}
                            placeholder="Question description..."
                            className="resize-none no-scrollbar min-h-[80px]"
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
    sectionIndex,
    onDelete, 
    onUpdate,
    setModified,
    isCollapsed,
    onToggleCollapse
}: { 
    gridSection: GridSection; 
    sectionIndex: number;
    onDelete: () => void;
    onUpdate: (section: GridSection) => void;
    setModified: (modified: boolean) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}) => {
    const sectionId = generateSectionId(gridSection, sectionIndex);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: sectionId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [rows, setRows] = useState(gridSection.rows);

    // Sync rows with gridSection.rows when it changes
    useEffect(() => {
        setRows(gridSection.rows);
    }, [gridSection.rows]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            // Find indices by checking if the active/over id matches the pattern
            let oldIndex = -1;
            let newIndex = -1;
            
            rows.forEach((row, idx) => {
                const criteriaId = `criteria-${row.name}-${idx}`;
                if (active.id.toString().startsWith(`criteria-${row.name}`)) {
                    oldIndex = idx;
                }
                if (over.id.toString().startsWith(`criteria-${row.name}`)) {
                    newIndex = idx;
                }
            });
            
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const newOrder = arrayMove(rows, oldIndex, newIndex);
                setRows(newOrder);
                gridSection.rows = newOrder;
                onUpdate(gridSection);
                setModified(true);
            }
        }
    };

    return (
        <Card ref={setNodeRef} style={style} className="group">
            <CardHeader className="border bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleCollapse}
                        className="p-1"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-6 h-6" />
                        ) : (
                            <ChevronDown className="w-6 h-6" />
                        )}
                    </Button>
                    
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
            
            {!isCollapsed && (
                <CardContent className="p-6 space-y-6">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={rows.map((row, idx) => `criteria-${row.name}-${idx}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {rows.map((notationCriteria, index) => (
                                    <SortableNotationCriteria
                                        key={`criteria-${notationCriteria.name}-${index}`}
                                        notationCriteria={notationCriteria}
                                        criteriaIndex={index}
                                        onDelete={() => {
                                            const updatedRows = rows.filter((_, i) => i !== index);
                                            setRows(updatedRows);
                                            gridSection.rows = updatedRows;
                                            onUpdate(gridSection);
                                            setModified(true);
                                        }}
                                        onUpdate={(criteria) => {
                                            const updatedRows = [...rows];
                                            updatedRows[index] = criteria;
                                            setRows(updatedRows);
                                            gridSection.rows = updatedRows;
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
            )}
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
    const [context, setContext] = useState(jsonNL?.context || '');
    const [gridSections, setGridSections] = useState<GridSection[]>([]);
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
    
    const contextRef = useAutoResize(context);

    useEffect(() => {
        if (jsonNL) {
            setContext(jsonNL.context || '');
            setGridSections([...jsonNL.rows]); // Create new array to force re-render
        }
    }, [jsonNL]);

    // Keyboard shortcut for save
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                if (modified && jsonNL) {
                    onSave();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modified, jsonNL]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = gridSections.findIndex((section, idx) => 
                generateSectionId(section, idx) === active.id
            );
            const newIndex = gridSections.findIndex((section, idx) => 
                generateSectionId(section, idx) === over.id
            );
            
            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(gridSections, oldIndex, newIndex);
                setGridSections([...newOrder]); // Force re-render with new array
                if (jsonNL) {
                    jsonNL.rows = newOrder;
                }
                setModified(true);
            }
        }
    };

    const onSave = useCallback(async () => {
        if (!jsonNL) return;
        mutate(convertToBlob(jsonNL));
    }, [jsonNL, mutate]);

    const updateContext = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!jsonNL) return;
        jsonNL.context = e.target.value;
        setContext(e.target.value);
        setModified(true);
    }

    const toggleSectionCollapse = (sectionIndex: number) => {
        const sectionId = generateSectionId(gridSections[sectionIndex], sectionIndex);
        const newCollapsed = new Set(collapsedSections);
        if (newCollapsed.has(sectionId)) {
            newCollapsed.delete(sectionId);
        } else {
            newCollapsed.add(sectionId);
        }
        setCollapsedSections(newCollapsed);
    };

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
                            {isLoading ? 'Saving...' : 'Save Changes (Ctrl+S)'}
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
                            ref={contextRef}
                            placeholder="Enter context or instructions..."
                            value={context}
                            onChange={updateContext}
                            className="no-scrollbar resize-none min-h-[80px]"
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
                                if (jsonNL) {
                                    jsonNL.rows = updatedSections;
                                }
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
                            items={gridSections.map((section, idx) => generateSectionId(section, idx))}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-6">
                                {gridSections.map((gridSection, index) => {
                                    const sectionId = generateSectionId(gridSection, index);
                                    return (
                                        <SortableGridSection
                                            key={sectionId}
                                            gridSection={gridSection}
                                            sectionIndex={index}
                                            isCollapsed={collapsedSections.has(sectionId)}
                                            onToggleCollapse={() => toggleSectionCollapse(index)}
                                            onDelete={() => {
                                                const updatedSections = gridSections.filter((_, i) => i !== index);
                                                setGridSections([...updatedSections]);
                                                if (jsonNL) {
                                                    jsonNL.rows = updatedSections;
                                                }
                                                setModified(true);
                                            }}
                                            onUpdate={(section) => {
                                                const updatedSections = [...gridSections];
                                                updatedSections[index] = section;
                                                setGridSections(updatedSections);
                                                if (jsonNL) {
                                                    jsonNL.rows = updatedSections;
                                                }
                                                setModified(true);
                                            }}
                                            setModified={setModified}
                                        />
                                    );
                                })}
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