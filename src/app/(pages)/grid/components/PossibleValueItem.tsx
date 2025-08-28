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
      className="group relative flex items-center gap-2 p-3 bg-gradient-to-r from-white to-gray-50/30 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
        disabled={disabled}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      
      <div className="flex items-center gap-2 flex-1">
        <div className="relative">
          <Input
            type="number"
            value={possibleValue.value}
            onChange={handleValueChange}
            className="w-16 h-9 text-center font-medium bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            min={0}
            max={100}
            disabled={disabled}
            aria-label="Value"
          />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <Textarea
          ref={definitionRef}
          value={possibleValue.definition}
          onChange={handleDefinitionChange}
          placeholder="Enter definition..."
          className="flex-1 resize-none min-h-[36px] text-sm bg-white/80 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
          disabled={disabled}
          aria-label="Definition"
        />
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={disabled}
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
        aria-label="Delete value"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

PossibleValueItemComponent.displayName = 'PossibleValueItem';

export const PossibleValueItem = React.memo(PossibleValueItemComponent);