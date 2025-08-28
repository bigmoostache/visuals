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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
    <Card ref={setNodeRef} style={style} className="group relative overflow-hidden border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
      <CardHeader className="pb-4 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20">
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 mt-2 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
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
                placeholder="Question name..."
                className={`font-semibold text-base bg-transparent border-0 border-b-2 rounded-none px-0 focus:ring-0 focus:border-blue-400 placeholder:text-gray-400 ${nameError ? 'border-red-400' : 'border-gray-200'}`}
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
              placeholder="Question description..."
              className="resize-none min-h-[60px] text-sm text-gray-600 bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
              disabled={disabled}
              aria-label="Criteria description"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={disabled}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            aria-label="Delete criteria"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>
      
      <Separator className="opacity-50" />
      
      <CardContent className="pt-5 pb-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-medium text-xs uppercase tracking-wider text-gray-500">Possible Values</h4>
          <Badge variant="outline" className="text-xs font-normal border-gray-200 bg-white">
            {criteria.possible_values.length} {criteria.possible_values.length === 1 ? 'value' : 'values'}
          </Badge>
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
          <div className="text-center py-6 text-gray-400 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
            <p className="text-sm">No values defined yet</p>
            <p className="text-xs mt-1 text-gray-300">Add your first value below</p>
          </div>
        )}
        
        <div className="flex gap-2 p-2.5 bg-gradient-to-r from-blue-50/30 to-purple-50/30 rounded-xl border border-dashed border-blue-200/50">
          <Input
            type="number"
            placeholder="Val"
            value={newValue !== null ? newValue : ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              if (value === null || (value >= 0 && value <= 100)) {
                setNewValue(value);
              }
            }}
            className="w-16 h-8 text-center text-sm font-medium bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            min={0}
            max={100}
            disabled={disabled}
            aria-label="New value"
          />
          <Input
            placeholder="Enter definition..."
            value={newDefinition}
            onChange={(e) => setNewDefinition(e.target.value)}
            className="flex-1 h-8 text-sm bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
            disabled={disabled}
            aria-label="New definition"
          />
          <Button
            onClick={handleAddValue}
            disabled={disabled || newValue === null || !newDefinition.trim()}
            size="icon"
            className="h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-200 disabled:text-gray-400"
            aria-label="Add value"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

CriteriaCardComponent.displayName = 'CriteriaCard';

export const CriteriaCard = React.memo(CriteriaCardComponent);