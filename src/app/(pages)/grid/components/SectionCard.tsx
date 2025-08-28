"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  GripVertical, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  AlertCircle 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GridSection, NotationCriteria, CONSTANTS } from '../types';
import { CriteriaCard } from './CriteriaCard';
import { createNewCriteria, validateSectionName } from '../utils';
import { toast } from 'sonner';

interface SectionCardProps {
  section: GridSection;
  onDelete: () => void;
  onUpdate: (section: GridSection) => void;
  disabled?: boolean;
}

const SectionCardComponent = ({ 
  section, 
  onDelete, 
  onUpdate,
  disabled = false
}: SectionCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = section.rows.findIndex(row => row.id === active.id);
      const newIndex = section.rows.findIndex(row => row.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(section.rows, oldIndex, newIndex);
        onUpdate({
          ...section,
          rows: newOrder
        });
      }
    }
  }, [section, onUpdate]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const error = validateSectionName(newName);
    setNameError(error?.message || null);
    
    if (!error) {
      onUpdate({
        ...section,
        name: newName
      });
    }
  }, [section, onUpdate]);

  const handleAddCriteria = useCallback(() => {
    const newCriteria = createNewCriteria();
    onUpdate({
      ...section,
      rows: [...section.rows, newCriteria]
    });
    toast.success('New question added');
  }, [section, onUpdate]);

  const handleDeleteCriteria = useCallback((criteriaId: string) => {
    onUpdate({
      ...section,
      rows: section.rows.filter(r => r.id !== criteriaId)
    });
  }, [section, onUpdate]);

  const handleUpdateCriteria = useCallback((criteriaId: string, updatedCriteria: NotationCriteria) => {
    onUpdate({
      ...section,
      rows: section.rows.map(r =>
        r.id === criteriaId ? updatedCriteria : r
      )
    });
  }, [section, onUpdate]);

  const sortableItems = useMemo(() => 
    section.rows.map(r => r.id),
    [section.rows]
  );

  const totalQuestions = section.rows.length;
  const totalValues = section.rows.reduce((acc, row) => acc + row.possible_values.length, 0);

  return (
    <Card ref={setNodeRef} style={style} className="group border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-white/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
            disabled={disabled}
            aria-label="Drag to reorder section"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-7 w-7 text-white hover:bg-white/20 transition-colors"
            aria-label={isCollapsed ? "Expand section" : "Collapse section"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          
          <div className="flex-1">
            <Input
              value={section.name}
              onChange={handleNameChange}
              placeholder="Section name..."
              className={`text-lg font-bold border-0 shadow-none bg-transparent text-white placeholder:text-white/50 hover:bg-white/10 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg px-3 transition-all ${
                nameError ? 'text-red-300' : ''
              }`}
              disabled={disabled}
              maxLength={CONSTANTS.MAX_SECTION_NAME_LENGTH}
              aria-label="Section name"
            />
            {nameError && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {nameError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex gap-1.5">
                    <Badge className="text-xs bg-white/20 hover:bg-white/30 text-white border-white/30">
                      {totalQuestions} {totalQuestions === 1 ? 'Q' : 'Qs'}
                    </Badge>
                    <Badge className="text-xs bg-white/20 hover:bg-white/30 text-white border-white/30">
                      {totalValues} {totalValues === 1 ? 'V' : 'Vs'}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This section contains {totalQuestions} questions with {totalValues} total values</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={disabled}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 text-white hover:bg-red-500/30 hover:text-white rounded-lg"
            aria-label="Delete section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <>
          <CardContent className="p-6 space-y-5 bg-gradient-to-b from-gray-50 to-white">
            {section.rows.length === 0 ? (
              <div className="text-center py-10 bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-dashed border-blue-200 rounded-xl">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm mb-3">
                  <Plus className="w-5 h-5 text-blue-500" />
                </div>
                <p className="mb-3 text-gray-500 font-medium">No questions yet</p>
                <Button
                  onClick={handleAddCriteria}
                  disabled={disabled}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            ) : (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortableItems}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {section.rows.map((criteria) => (
                      <CriteriaCard
                        key={criteria.id}
                        criteria={criteria}
                        onDelete={() => handleDeleteCriteria(criteria.id)}
                        onUpdate={(updatedCriteria) => 
                          handleUpdateCriteria(criteria.id, updatedCriteria)
                        }
                        disabled={disabled}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            
            {section.rows.length > 0 && (
              <Button
                variant="outline"
                onClick={handleAddCriteria}
                disabled={disabled}
                className="w-full h-11 border-dashed border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 text-blue-600 hover:text-blue-700 transition-all duration-200 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
};

SectionCardComponent.displayName = 'SectionCard';

export const SectionCard = React.memo(SectionCardComponent);