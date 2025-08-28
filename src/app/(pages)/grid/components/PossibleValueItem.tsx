"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PossibleValue } from '../types';
import { useAutoResize } from '../hooks/useAutoResize';

interface PossibleValueItemProps {
  possibleValue: PossibleValue;
  onDelete: () => void;
  onUpdate: (value: number, definition: string) => void;
  disabled?: boolean;
}

const PossibleValueItemComponent = ({ 
  possibleValue, 
  onDelete, 
  onUpdate,
  disabled = false
}: PossibleValueItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: possibleValue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const definitionRef = useAutoResize(possibleValue.definition);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (newValue >= 0 && newValue <= 100) {
      onUpdate(newValue, possibleValue.definition);
    }
  };

  const handleDefinitionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(possibleValue.value, e.target.value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <div className="flex items-center gap-3 flex-1">
        <Input
          type="number"
          value={possibleValue.value}
          onChange={handleValueChange}
          className="w-16 h-8 text-center text-sm font-medium border-gray-200 focus:border-gray-400 focus:ring-0"
          min={0}
          max={100}
          disabled={disabled}
          aria-label="Value"
        />
        <Textarea
          ref={definitionRef}
          value={possibleValue.definition}
          onChange={handleDefinitionChange}
          placeholder="Description"
          className="flex-1 resize-none min-h-[32px] text-sm border-gray-200 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          disabled={disabled}
          aria-label="Definition"
        />
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={disabled}
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 disabled:opacity-50"
        aria-label="Delete value"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

PossibleValueItemComponent.displayName = 'PossibleValueItem';

export const PossibleValueItem = React.memo(PossibleValueItemComponent);