"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GripVertical, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { NotationCriteria, PossibleValue, CONSTANTS } from '../types';
import { PossibleValueItem } from './PossibleValueItem';
import { useAutoResize } from '../hooks/useAutoResize';
import { createNewPossibleValue, validatePossibleValue, validateCriteriaName } from '../utils';
import { toast } from 'sonner';

interface CriteriaCardProps {
  criteria: NotationCriteria;
  onDelete: () => void;
  onUpdate: (criteria: NotationCriteria) => void;
  disabled?: boolean;
}

const CriteriaCardComponent = ({ 
  criteria, 
  onDelete, 
  onUpdate,
  disabled = false
}: CriteriaCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: criteria.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [newValue, setNewValue] = useState<number | null>(null);
  const [newDefinition, setNewDefinition] = useState<string>("");
  const [nameError, setNameError] = useState<string | null>(null);
  const definitionRef = useAutoResize(criteria.definition);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = criteria.possible_values.findIndex(val => val.id === active.id);
      const newIndex = criteria.possible_values.findIndex(val => val.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(criteria.possible_values, oldIndex, newIndex);
        onUpdate({
          ...criteria,
          possible_values: newOrder
        });
      }
    }
  }, [criteria, onUpdate]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const error = validateCriteriaName(newName);
    setNameError(error?.message || null);
    
    if (!error) {
      onUpdate({
        ...criteria,
        name: newName
      });
    }
  }, [criteria, onUpdate]);

  const handleDefinitionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...criteria,
      definition: e.target.value
    });
  }, [criteria, onUpdate]);

  const handleAddValue = useCallback(() => {
    const error = validatePossibleValue(newValue, newDefinition, criteria.possible_values);
    
    if (error) {
      toast.error(error.message);
      return;
    }

    if (newValue !== null) {
      const newPossibleValue = createNewPossibleValue(newValue, newDefinition);
      onUpdate({
        ...criteria,
        possible_values: [...criteria.possible_values, newPossibleValue]
      });
      
      setNewValue(null);
      setNewDefinition("");
      toast.success('Value added successfully');
    }
  }, [newValue, newDefinition, criteria, onUpdate]);

  const handleDeleteValue = useCallback((valueId: string) => {
    onUpdate({
      ...criteria,
      possible_values: criteria.possible_values.filter(v => v.id !== valueId)
    });
  }, [criteria, onUpdate]);

  const handleUpdateValue = useCallback((valueId: string, value: number, definition: string) => {
    onUpdate({
      ...criteria,
      possible_values: criteria.possible_values.map(v =>
        v.id === valueId ? { ...v, value, definition } : v
      )
    });
  }, [criteria, onUpdate]);

  const sortableItems = useMemo(() => 
    criteria.possible_values.map(v => v.id),
    [criteria.possible_values]
  );

  return (
    <Card ref={setNodeRef} style={style} className="group relative border-gray-200 hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            aria-label="Drag to reorder criteria"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          <div className="flex-1 space-y-3">
            <div>
              <Input
                value={criteria.name}
                onChange={handleNameChange}
                placeholder="Question title"
                className={`font-medium text-base border-gray-200 focus:border-gray-400 focus:ring-0 ${nameError ? 'border-red-500' : ''}`}
                disabled={disabled}
                aria-label="Criteria name"
                maxLength={CONSTANTS.MAX_CRITERIA_NAME_LENGTH}
              />
              {nameError && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {nameError}
                </p>
              )}
            </div>
            
            <Textarea
              ref={definitionRef}
              value={criteria.definition}
              onChange={handleDefinitionChange}
              placeholder="Description"
              className="resize-none min-h-[60px] text-sm text-gray-600 border-gray-200 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              disabled={disabled}
              aria-label="Criteria description"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={disabled}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
            aria-label="Delete criteria"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Values</h4>
          <span className="text-xs text-gray-500">
            {criteria.possible_values.length} items
          </span>
        </div>
        
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableItems}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {criteria.possible_values.map((possibleValue) => (
                <PossibleValueItem
                  key={possibleValue.id}
                  possibleValue={possibleValue}
                  onDelete={() => handleDeleteValue(possibleValue.id)}
                  onUpdate={(value, definition) => 
                    handleUpdateValue(possibleValue.id, value, definition)
                  }
                  disabled={disabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        {criteria.possible_values.length === 0 && (
          <div className="text-center py-6 text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm">No values defined</p>
          </div>
        )}
        
        <div className="flex gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
          <Input
            type="number"
            placeholder="0"
            value={newValue !== null ? newValue : ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              if (value === null || (value >= 0 && value <= 100)) {
                setNewValue(value);
              }
            }}
            className="w-16 h-8 text-center text-sm border-gray-200 focus:border-gray-400 focus:ring-0"
            min={0}
            max={100}
            disabled={disabled}
            aria-label="New value"
          />
          <Input
            placeholder="Add description"
            value={newDefinition}
            onChange={(e) => setNewDefinition(e.target.value)}
            className="flex-1 h-8 text-sm border-gray-200 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            disabled={disabled}
            aria-label="New definition"
          />
          <Button
            onClick={handleAddValue}
            disabled={disabled || newValue === null || !newDefinition.trim()}
            size="icon"
            className="h-8 w-8"
            aria-label="Add value"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

CriteriaCardComponent.displayName = 'CriteriaCard';

export const CriteriaCard = React.memo(CriteriaCardComponent);