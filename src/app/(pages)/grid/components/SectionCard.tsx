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
    <Card ref={setNodeRef} style={style} className="group border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            aria-label="Drag to reorder section"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-7 w-7 text-gray-600 hover:text-gray-900"
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
              placeholder="Section name"
              className={`text-base font-semibold border-0 shadow-none bg-transparent placeholder:text-gray-400 hover:bg-white focus:bg-white px-2 -mx-2 ${nameError ? 'text-red-500' : ''}`}
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

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{totalQuestions} {totalQuestions === 1 ? 'question' : 'questions'}</span>
            <span>•</span>
            <span>{totalValues} {totalValues === 1 ? 'value' : 'values'}</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={disabled}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
            aria-label="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <>
          <CardContent className="p-4 space-y-4">
            {section.rows.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500 mb-3">No questions in this section</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddCriteria}
                  disabled={disabled}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
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
                className="w-full border-dashed border-gray-300 hover:border-gray-400 text-gray-600"
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