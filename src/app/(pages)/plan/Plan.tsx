"use client";

import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { Suspense, useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plan as PlanInterface } from './interfaces';
import { Trash2, Minus, Plus, FileText, Target, List, Save, Loader2, GripVertical } from 'lucide-react';
import { LucarioComponent } from '../lucario/Lucario';

// dnd-kit imports
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

// Auto-resizing Input component
const AutoResizeInput = ({ 
  value, 
  onChange, 
  onBlur, 
  placeholder, 
  className, 
  style, 
  ...props 
}: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (inputRef.current) {
      // Reset height to auto to get the correct scrollHeight
      inputRef.current.style.height = 'auto';
      // Set height based on scrollHeight
      inputRef.current.style.height = `${Math.max(40, inputRef.current.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      style={{
        ...style,
        resize: 'none',
        overflow: 'hidden',
        minHeight: '40px',
      }}
      {...props}
    />
  );
};

// Auto-resizing Textarea component
const AutoResizeTextarea = ({ 
  value, 
  onChange, 
  onBlur, 
  placeholder, 
  className, 
  rows = 2,
  ...props 
}: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height based on scrollHeight
      textareaRef.current.style.height = `${Math.max(60, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      style={{
        resize: 'none',
        overflow: 'hidden',
        minHeight: '60px',
      }}
      {...props}
    />
  );
};

// Enhanced bullet points input with better UX and auto-resize
const BulletPointsInput = ({ initialBulletText, onBulletChange }: { initialBulletText: string, onBulletChange: (lines: string[]) => void }) => {
  const [bulletText, setBulletText] = useState(initialBulletText);
  
  useEffect(() => {
    setBulletText(initialBulletText);
  }, [initialBulletText]);

  return (
    <div className="group relative">
      <div className="absolute left-3 top-3 pointer-events-none z-10">
        <List className="h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
      </div>
      <AutoResizeTextarea
        value={bulletText}
        onChange={(e: any) => setBulletText(e.target.value)}
        onBlur={() => onBulletChange(bulletText.split('\n'))}
        placeholder="• Enter bullet points, each on a new line"
        className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400/30 transition-all duration-200 bg-slate-50/50 hover:bg-white"
        rows={4}
      />
    </div>
  );
};

// Ultra-modern word count input
const WordCountInput = ({ 
  initialWordCount, 
  onWordCountChange 
}: { 
  initialWordCount: number, 
  onWordCountChange: (count: number) => void 
}) => {
  const [wordCount, setWordCount] = useState(initialWordCount);

  useEffect(() => {
    setWordCount(initialWordCount);
  }, [initialWordCount]);

  const handleDecrement = () => {
    const newCount = Math.max(0, wordCount - 25);
    setWordCount(newCount);
    onWordCountChange(newCount);
  };

  const handleIncrement = () => {
    const newCount = wordCount + 25;
    setWordCount(newCount);
    onWordCountChange(newCount);
  };

  const handleDirectChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, numValue);
    setWordCount(clampedValue);
    onWordCountChange(clampedValue);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg border border-slate-200/60">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-slate-500" />
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Target Words</span>
      </div>
      <div className="flex items-center bg-white rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDecrement}
          disabled={wordCount <= 0}
          className="h-8 w-8 p-0 rounded-l-md rounded-r-none border-r border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={wordCount}
          onChange={(e) => handleDirectChange(e.target.value)}
          className="w-16 h-8 text-center text-sm font-semibold border-none bg-transparent focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="0"
          step="25"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleIncrement}
          className="h-8 w-8 p-0 rounded-r-md rounded-l-none border-l border-slate-200 hover:bg-slate-100 transition-all duration-150"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

// Sortable wrapper for draggable sections
const SortableSection = ({ 
  section, 
  onUpdate, 
  onDelete, 
  depth = 0,
  isDraggable = false 
}: { 
  section: PlanInterface, 
  onUpdate: (updated: PlanInterface) => void, 
  onDelete?: () => void, 
  depth?: number,
  isDraggable?: boolean
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.section_id || Math.random().toString(36) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <PlanSection
        section={section}
        onUpdate={onUpdate}
        onDelete={onDelete}
        depth={depth}
        isDraggable={isDraggable}
        dragHandleProps={isDraggable ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
};

const PlanSection = ({ 
  section, 
  onUpdate, 
  onDelete, 
  depth = 0, 
  isDraggable = false,
  dragHandleProps
}: { 
  section: PlanInterface, 
  onUpdate: (updated: PlanInterface) => void, 
  onDelete?: () => void, 
  depth?: number,
  isDraggable?: boolean,
  dragHandleProps?: any
}) => {
  const updateField = (field: keyof PlanInterface, value: any) => {
    onUpdate({ ...section, [field]: value });
  };

  const [localTitle, setLocalTitle] = useState(section.title);
  const [localAbstract, setLocalAbstract] = useState(section.abstract || "");

  useEffect(() => {
    setLocalTitle(section.title);
  }, [section.title]);

  useEffect(() => {
    setLocalAbstract(section.abstract || "");
  }, [section.abstract]);

  const isLeaf = section.section_type === 'leaf';
  const hasSubsections = (section.section_type === 'root' || section.section_type === 'node') && 
                        'contents' in section && 
                        (section.contents as any).subsections;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    if (hasSubsections) {
      const subsections = (section.contents as any).subsections;
      const oldIndex = subsections.findIndex((sub: PlanInterface) => 
        (sub.section_id || Math.random().toString(36)) === active.id
      );
      const newIndex = subsections.findIndex((sub: PlanInterface) => 
        (sub.section_id || Math.random().toString(36)) === over.id
      );
      
      if (oldIndex !== newIndex) {
        const newSubsections = arrayMove(subsections, oldIndex, newIndex);
        updateField("contents", { subsections: newSubsections });
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className={`group relative transition-all duration-200 ${depth > 0 ? 'ml-4' : ''}`}>
      <div className={`
        bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md 
        transition-all duration-200 overflow-hidden
        ${depth > 0 ? 'border-l-4 border-l-slate-300' : ''}
      `}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50/50 to-transparent border-b border-slate-100">
          {isDraggable && (
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <div className="flex items-center gap-2 flex-1">
            <FileText className="h-4 w-4 text-slate-500" />
            <AutoResizeInput
              value={localTitle}
              onChange={(e: any) => setLocalTitle(e.target.value)}
              onBlur={() => updateField("title", localTitle)}
              placeholder="Section title"
              className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none font-semibold text-slate-800 placeholder:text-slate-400"
              style={{ fontSize: `${1.2 - 0.1 * depth}rem` }}
            />
          </div>
          {onDelete && (
            <Button 
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <Trash2 className='h-4 w-4'/>
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Abstract */}
          <div className="relative">
            <AutoResizeTextarea
              value={localAbstract}
              onChange={(e: any) => setLocalAbstract(e.target.value)}
              onBlur={() => updateField("abstract", localAbstract)}
              placeholder="Brief description of this section's content and purpose"
              className="border-slate-200 focus:border-slate-400 focus:ring-slate-400/30 transition-all duration-200 bg-slate-50/30 hover:bg-white text-sm"
              rows={2}
            />
          </div>

          {/* Leaf Content */}
          {isLeaf && 'contents' in section && (section.contents as any).leaf_bullet_points !== undefined && (
            <div className="space-y-3">
              {/* <WordCountInput
                initialWordCount={(section.contents as any).target_number_of_words || 250}
                onWordCountChange={(count) => {
                  const currentContents = section.contents as any;
                  updateField("contents", { 
                    ...currentContents, 
                    target_number_of_words: count 
                  });
                }}
              /> */}
              <BulletPointsInput
                initialBulletText={(section.contents as any).leaf_bullet_points.join("\n")}
                onBulletChange={(lines) => {
                  const currentContents = section.contents as any;
                  updateField("contents", { 
                    ...currentContents, 
                    leaf_bullet_points: lines 
                  });
                }}
              />
            </div>
          )}

          {/* Subsections with Drag and Drop */}
          {hasSubsections && (
            <div className="space-y-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={(section.contents as any).subsections.map((sub: PlanInterface) => 
                    sub.section_id || Math.random().toString(36)
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {(section.contents as any).subsections.map((subsection: PlanInterface, index: number) => {
                      const isLeafSection = subsection.section_type === 'leaf';
                      
                      return isLeafSection ? (
                        <SortableSection
                          key={subsection.section_id || index}
                          section={subsection}
                          depth={depth + 1}
                          isDraggable={true}
                          onUpdate={(updatedSub) => {
                            const updatedSubs = (section.contents as any).subsections.slice();
                            updatedSubs[index] = updatedSub;
                            updateField("contents", { subsections: updatedSubs });
                          }}
                          onDelete={() => {
                            const updatedSubs = (section.contents as any).subsections.filter((_: any, i: number) => i !== index);
                            updateField("contents", { subsections: updatedSubs });
                          }}
                        />
                      ) : (
                        <PlanSection
                          key={subsection.section_id || index}
                          section={subsection}
                          depth={depth + 1}
                          onUpdate={(updatedSub) => {
                            const updatedSubs = (section.contents as any).subsections.slice();
                            updatedSubs[index] = updatedSub;
                            updateField("contents", { subsections: updatedSubs });
                          }}
                          onDelete={() => {
                            const updatedSubs = (section.contents as any).subsections.filter((_: any, i: number) => i !== index);
                            updateField("contents", { subsections: updatedSubs });
                          }}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
              
              <Button 
                onClick={() => {
                  const newSubsection: PlanInterface = {
                    section_id: Math.random().toString(36).substring(2, 11),
                    prefix: "",
                    title: "New Section",
                    abstract: "",
                    section_type: "leaf",
                    contents: { 
                      leaf_bullet_points: [],
                      target_number_of_words: 250
                    },
                    references: []
                  };
                  const updatedSubs = (section.contents as any).subsections ? 
                    [...(section.contents as any).subsections, newSubsection] : [newSubsection];
                  updateField("contents", { subsections: updatedSubs });
                }}
                variant="outline"
                className="w-full h-10 border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-600 hover:text-slate-700 transition-all duration-200 font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subsection
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PlanPage = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const { data } = useGetFile({ fetchUrl: url as string });
  const { mutate, isLoading } = usePatchFile({ fetchUrl: url as string });

  const [plan, setPlan] = useState<PlanInterface | null>(null);
  
  useEffect(() => {
    if (!data) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as PlanInterface;
        setPlan(parsed);
      } catch (err) {
        console.error("Failed to parse plan JSON", err);
      }
    };
    reader.readAsText(data);
  }, [data]);

  const onSave = () => {
    if (!plan) return;
    const blob = new Blob([JSON.stringify(plan)], { type: 'application/json' });
    const file = new File([blob], 'plan.json', { lastModified: Date.now(), type: blob.type });
    mutate(file);
  };

  const saveLucarioData = (updatedLucario: any) => {
    if (!plan) return;
    setPlan({ ...plan, lucario: updatedLucario });
  };

  // Add keyboard shortcut for saving (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // Prevent browser's default save behavior
        onSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [plan, isLoading]); // Dependencies to ensure onSave has access to current state

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="mx-auto p-6">
        {plan ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Document Plan</h1>
                <p className="text-sm text-slate-500">Structure and organize your content • Drag leaf sections to reorder</p>
              </div>
              <Button 
                onClick={onSave} 
                disabled={isLoading}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-2.5 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>

            {/* Plan Section */}
            <PlanSection 
              section={plan} 
              onUpdate={(updated) => setPlan(prev => ({ ...prev, ...updated }))} 
            />

            {/* Lucario Component */}
            {plan.lucario && (
                <LucarioComponent 
                  lucario={plan.lucario} 
                  setLucario={(updatedLucario) => {
                    if (updatedLucario) {
                      saveLucarioData(updatedLucario);
                    }
                  }}
                  saveLucario={saveLucarioData}
                  isMutating={isLoading}
                />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
                <FileText className="h-5 w-5 text-slate-400 absolute top-3.5 left-1/2 -translate-x-1/2" />
              </div>
              <p className="text-slate-600 font-medium">Loading document plan...</p>
              <p className="text-slate-400 text-sm mt-1">Please wait while we prepare your workspace</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PlanPageC = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <PlanPage />
    </Suspense>
  );
};

export default PlanPageC;