"use client";

import React, { Suspense, memo, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Save, Plus, Check, GripVertical, Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';

// ==================== TYPES & CONSTANTS ====================

/**
 * Base criteria interface with common properties
 */
interface BaseCriteria {
  readonly name: string;
  readonly code: string;
  readonly id: string; // Add unique ID for stable keys
}

/**
 * Exclusion criteria specific interface
 */
interface ExclusionCriteria extends BaseCriteria {
  readonly exclusion_criteria_description: string;
}

/**
 * Inclusion criteria specific interface
 */
interface InclusionCriteria extends BaseCriteria {
  readonly inclusion_criteria_description: string;
}

/**
 * Union type for all criteria types
 */
type SelectionCriteria = ExclusionCriteria | InclusionCriteria;

/**
 * Main configuration interface
 */
interface SelectionConfig {
  readonly context?: string;
  readonly selection_criteria: ReadonlyArray<SelectionCriteria>;
  readonly language?: string;
  readonly use_codes: boolean;
}

/**
 * Criteria form data for editing
 */
interface CriteriaFormData {
  name: string;
  code: string;
  description: string;
}

/**
 * Application constants
 */
const CONSTANTS = {
  DRAG_ACTIVATION_DISTANCE: 8,
  DELETE_CONFIRMATION_TIMEOUT: 3000,
  KEYBOARD_SHORTCUTS: {
    SAVE: { key: 's', ctrlKey: true }
  },
  VALIDATION: {
    NAME_PATTERN: /^[A-Z_]*$/,
    CODE_PATTERN: /^[A-Z0-9_]*$/,
    MAX_DESCRIPTION_LENGTH: 1000,
    MIN_NAME_LENGTH: 1
  },
  DEFAULT_VALUES: {
    INCLUSION_NAME: 'INCLUSION_',
    EXCLUSION_NAME: 'EXCLUSION_',
    USE_CODES: true
  },
  ARIA_LABELS: {
    DRAG_HANDLE: 'Drag to reorder criteria',
    DELETE_BUTTON: 'Delete criteria',
    CONFIRM_DELETE: 'Confirm deletion',
    SAVE_BUTTON: 'Save all changes',
    ADD_INCLUSION: 'Add new inclusion criteria',
    ADD_EXCLUSION: 'Add new exclusion criteria',
    USE_CODES_TOGGLE: 'Toggle use of codes in final decision'
  }
} as const;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return `criteria_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Type guard to check if criteria is inclusion type
 */
const isInclusionCriteria = (criteria: SelectionCriteria): criteria is InclusionCriteria => {
  return 'inclusion_criteria_description' in criteria;
};

/**
 * Extract description from criteria regardless of type
 */
const getCriteriaDescription = (criteria: SelectionCriteria): string => {
  return isInclusionCriteria(criteria) 
    ? criteria.inclusion_criteria_description 
    : criteria.exclusion_criteria_description;
};

/**
 * Create new criteria with updated description
 */
const updateCriteriaDescription = (
  criteria: SelectionCriteria, 
  description: string
): SelectionCriteria => {
  if (isInclusionCriteria(criteria)) {
    return { ...criteria, inclusion_criteria_description: description };
  }
  return { ...criteria, exclusion_criteria_description: description };
};

/**
 * Validate criteria form data
 */
const validateCriteriaData = (data: CriteriaFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.name || data.name.length < CONSTANTS.VALIDATION.MIN_NAME_LENGTH) {
    errors.push('Name is required');
  }
  
  if (!CONSTANTS.VALIDATION.NAME_PATTERN.test(data.name)) {
    errors.push('Name must contain only uppercase letters and underscores');
  }
  
  if (data.code && !CONSTANTS.VALIDATION.CODE_PATTERN.test(data.code)) {
    errors.push('Code must contain only uppercase letters and numbers');
  }
  
  if (data.description.length > CONSTANTS.VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be under ${CONSTANTS.VALIDATION.MAX_DESCRIPTION_LENGTH} characters`);
  }
  
  return errors;
};

/**
 * Convert configuration to blob for saving
 */
const configToBlob = (config: SelectionConfig): File => {
  // Remove IDs before saving
  const configForSaving = {
    ...config,
    selection_criteria: config.selection_criteria.map(({ id, ...criteria }) => criteria)
  };
  
  const blob = new Blob([JSON.stringify(configForSaving, null, 2)], {
    type: 'application/json'
  });
  return new File([blob], 'selection-criteria.json', {
    lastModified: Date.now(),
    type: blob.type
  });
};

/**
 * Create new criteria of specified type
 */
const createNewCriteria = (type: 'inclusion' | 'exclusion'): SelectionCriteria => {
  const baseProps = {
    id: generateId(),
    name: type === 'inclusion' ? CONSTANTS.DEFAULT_VALUES.INCLUSION_NAME : CONSTANTS.DEFAULT_VALUES.EXCLUSION_NAME,
    code: ''
  };

  return type === 'inclusion' 
    ? { ...baseProps, inclusion_criteria_description: '' }
    : { ...baseProps, exclusion_criteria_description: '' };
};

// ==================== CUSTOM HOOKS ====================

/**
 * Hook for managing criteria state and operations
 */
const useCriteriaManager = (initialConfig?: SelectionConfig) => {
  const [config, setConfig] = React.useState<SelectionConfig | null>(null);
  const [isModified, setIsModified] = React.useState(false);

  React.useEffect(() => {
    if (initialConfig) {
      // Add IDs to criteria that don't have them and normalize
      const normalizedCriteria = initialConfig.selection_criteria.map(criteria => ({
        ...criteria,
        id: (criteria as any).id || generateId(),
        code: criteria.code || ''
      }));

      setConfig({
        ...initialConfig,
        selection_criteria: normalizedCriteria,
        use_codes: initialConfig.use_codes ?? CONSTANTS.DEFAULT_VALUES.USE_CODES
      });
    }
  }, [initialConfig]);

  const updateConfig = useCallback((updater: (prev: SelectionConfig) => SelectionConfig) => {
    setConfig(prev => {
      if (!prev) return null;
      const updated = updater(prev);
      setIsModified(true);
      return updated;
    });
  }, []);

  const addCriteria = useCallback((type: 'inclusion' | 'exclusion') => {
    const newCriteria = createNewCriteria(type);
    updateConfig(prev => ({
      ...prev,
      selection_criteria: [...prev.selection_criteria, newCriteria]
    }));
  }, [updateConfig]);

  const updateCriteria = useCallback((id: string, updates: Partial<SelectionCriteria>) => {
    updateConfig(prev => ({
      ...prev,
      selection_criteria: prev.selection_criteria.map(criteria => 
        criteria.id === id ? { ...criteria, ...updates } : criteria
      )
    }));
  }, [updateConfig]);

  const deleteCriteria = useCallback((id: string) => {
    updateConfig(prev => ({
      ...prev,
      selection_criteria: prev.selection_criteria.filter(criteria => criteria.id !== id)
    }));
  }, [updateConfig]);

  const reorderCriteria = useCallback((activeId: string, overId: string) => {
    updateConfig(prev => {
      const criteriaArray = [...prev.selection_criteria];
      const oldIndex = criteriaArray.findIndex(c => c.id === activeId);
      const newIndex = criteriaArray.findIndex(c => c.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      return {
        ...prev,
        selection_criteria: arrayMove(criteriaArray, oldIndex, newIndex)
      };
    });
  }, [updateConfig]);

  const toggleUseCodes = useCallback((useCodes: boolean) => {
    updateConfig(prev => ({ ...prev, use_codes: useCodes }));
  }, [updateConfig]);

  const markSaved = useCallback(() => {
    setIsModified(false);
  }, []);

  return {
    config,
    isModified,
    addCriteria,
    updateCriteria,
    deleteCriteria,
    reorderCriteria,
    toggleUseCodes,
    markSaved
  };
};

/**
 * Hook for managing drag and drop state
 */
const useDragAndDrop = (onReorder: (activeId: string, overId: string) => void) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: CONSTANTS.DRAG_ACTIVATION_DISTANCE }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }

    setActiveId(null);
  }, [onReorder]);

  return {
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd
  };
};

// ==================== COMPONENTS ====================

/**
 * Individual criteria row component
 */
interface CriteriaRowProps {
  readonly criteria: SelectionCriteria;
  readonly showCodes: boolean;
  readonly onUpdate: (updates: Partial<SelectionCriteria>) => void;
  readonly onDelete: () => void;
  readonly dragHandleProps?: Record<string, unknown>;
}

const CriteriaRow = memo<CriteriaRowProps>(({
  criteria,
  showCodes,
  onUpdate,
  onDelete,
  dragHandleProps
}) => {
  const [pendingDelete, setPendingDelete] = React.useState(false);
  const [formData, setFormData] = React.useState<CriteriaFormData>({
    name: criteria.name,
    code: criteria.code,
    description: getCriteriaDescription(criteria)
  });
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  // Sync form data with criteria props when they change
  useEffect(() => {
    setFormData({
      name: criteria.name,
      code: criteria.code,
      description: getCriteriaDescription(criteria)
    });
  }, [criteria]);

  const isInclusion = isInclusionCriteria(criteria);

  const validateAndUpdate = useCallback((newData: CriteriaFormData) => {
    const errors = validateCriteriaData(newData);
    setValidationErrors(errors);

    if (errors.length === 0) {
      const { name: _name, code: _code, ...descUpdate } = updateCriteriaDescription(criteria, newData.description);
      const updates: Partial<SelectionCriteria> = {
        name: newData.name,
        code: newData.code,
        ...descUpdate
      };
      onUpdate(updates);
    }
  }, [criteria, onUpdate]);

  const handleFieldChange = useCallback((field: keyof CriteriaFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    validateAndUpdate(newData);
  }, [formData, validateAndUpdate]);

  const handleDelete = useCallback(() => {
    if (pendingDelete) {
      onDelete();
    } else {
      setPendingDelete(true);
      const timeoutId = setTimeout(() => setPendingDelete(false), CONSTANTS.DELETE_CONFIRMATION_TIMEOUT);
      return () => clearTimeout(timeoutId);
    }
  }, [pendingDelete, onDelete]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {dragHandleProps && (
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={CONSTANTS.ARIA_LABELS.DRAG_HANDLE}
            {...dragHandleProps}
          >
            <GripVertical size={18} />
          </button>
        )}
        
        <div className={`h-2 w-2 rounded-full ${isInclusion ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        
        <span className="text-sm font-medium text-gray-700">
          {isInclusion ? 'Inclusion Criteria' : 'Exclusion Criteria'}
        </span>
        
        <div className="flex-1" />
        
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="icon"
          className={`h-8 w-8 transition-colors ${
            pendingDelete
              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50'
          }`}
          aria-label={pendingDelete ? CONSTANTS.ARIA_LABELS.CONFIRM_DELETE : CONSTANTS.ARIA_LABELS.DELETE_BUTTON}
        >
          {pendingDelete ? <Check size={16} /> : <Trash2 size={16} />}
        </Button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-md p-3">
          <ul className="text-sm text-rose-700 space-y-1">
            {validationErrors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-12 gap-4">
        <div className={showCodes ? "col-span-8" : "col-span-12"}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="CRITERIA_NAME"
            className="font-mono text-sm"
          />
        </div>
        
        {showCodes && (
          <div className="col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <Input
              value={formData.code}
              onChange={(e) => handleFieldChange('code', e.target.value)}
              placeholder="CODE123"
              className="font-mono text-sm"
            />
          </div>
        )}
        
        <div className="col-span-12">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Enter detailed description of the criteria..."
            rows={4}
            className="resize-none"
            maxLength={CONSTANTS.VALIDATION.MAX_DESCRIPTION_LENGTH}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.description.length}/{CONSTANTS.VALIDATION.MAX_DESCRIPTION_LENGTH} characters
          </div>
        </div>
      </div>
    </div>
  );
});

CriteriaRow.displayName = 'CriteriaRow';

/**
 * Sortable wrapper for criteria row
 */
interface SortableCriteriaRowProps extends Omit<CriteriaRowProps, 'dragHandleProps'> {}

const SortableCriteriaRow = memo<SortableCriteriaRowProps>((props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.criteria.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  };

  const isInclusion = isInclusionCriteria(props.criteria);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`mb-4 ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card
        className={`border-l-4 shadow-sm transition-all duration-200 ${
          isInclusion ? 'border-l-emerald-500' : 'border-l-rose-500'
        } ${isDragging ? 'shadow-lg ring-2 ring-offset-2 ring-blue-200' : ''}`}
      >
        <CardContent className="p-4">
          <CriteriaRow 
            {...props}
            dragHandleProps={{ ...attributes, ...listeners }}
          />
        </CardContent>
      </Card>
    </div>
  );
});

SortableCriteriaRow.displayName = 'SortableCriteriaRow';

/**
 * Drag overlay component
 */
interface CriteriaDragOverlayProps {
  readonly criteria: SelectionCriteria | null;
  readonly showCodes: boolean;
}

const CriteriaDragOverlay = memo<CriteriaDragOverlayProps>(({ 
  criteria, 
  showCodes 
}) => {
  if (!criteria) return null;

  const isInclusion = isInclusionCriteria(criteria);

  return (
    <div className="w-full max-w-4xl">
      <Card
        className={`border-l-4 shadow-xl ${
          isInclusion ? 'border-l-emerald-500' : 'border-l-rose-500'
        }`}
      >
        <CardContent className="p-4">
          <CriteriaRow
            criteria={criteria}
            showCodes={showCodes}
            onUpdate={() => {}} // No-op during drag
            onDelete={() => {}} // No-op during drag
          />
        </CardContent>
      </Card>
    </div>
  );
});

CriteriaDragOverlay.displayName = 'CriteriaDragOverlay';

/**
 * Main criteria manager component
 */
const SelectionCriteriaManager: React.FC = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  const { data: fileData } = useGetFile({ fetchUrl: url as string });
  const { mutate: saveFile, isLoading: isSaving, isSuccess } = usePatchFile({ 
    fetchUrl: url as string 
  });

  // Parse configuration from file data
  const parsedConfig = useMemo(() => {
    if (!fileData) return undefined;
    
    try {
      return new Promise<SelectionConfig>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target?.result as string) as SelectionConfig;
            resolve(config);
          } catch (parseError) {
            reject(parseError);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(fileData);
      });
    } catch (error) {
      console.error('Failed to parse configuration:', error);
      return undefined;
    }
  }, [fileData]);

  const [config, setConfig] = React.useState<SelectionConfig | null>(null);

  React.useEffect(() => {
    if (parsedConfig && typeof parsedConfig.then === 'function') {
      parsedConfig.then(setConfig).catch(console.error);
    }
  }, [parsedConfig]);

  const {
    config: managedConfig,
    isModified,
    addCriteria,
    updateCriteria,
    deleteCriteria,
    reorderCriteria,
    toggleUseCodes,
    markSaved
  } = useCriteriaManager(config ?? undefined);

  const {
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd
  } = useDragAndDrop(reorderCriteria);

  // Handle save success
  React.useEffect(() => {
    if (isSuccess) {
      markSaved();
    }
  }, [isSuccess, markSaved]);

  // Save handler
  const handleSave = useCallback(() => {
    if (!managedConfig) return;
    saveFile(configToBlob(managedConfig));
  }, [managedConfig, saveFile]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey } = event;
      const { SAVE } = CONSTANTS.KEYBOARD_SHORTCUTS;
      
      if ((ctrlKey || metaKey) && key.toLowerCase() === SAVE.key) {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (!managedConfig) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const criteriaList = [...managedConfig.selection_criteria];
  const activeCriteria = activeId ? criteriaList.find(c => c.id === activeId) || null : null;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Selection Criteria</h1>
          {isModified && (
            <p className="text-sm text-amber-600 mt-1">
              You have unsaved changes
            </p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || !isModified}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          aria-label={CONSTANTS.ARIA_LABELS.SAVE_BUTTON}
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          Save Changes
        </Button>
      </div>

      {/* Drag and Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={criteriaList.map(criteria => criteria.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {criteriaList.map((criteria) => (
              <SortableCriteriaRow
                key={criteria.id} // Use stable ID as key
                criteria={criteria}
                showCodes={managedConfig.use_codes}
                onUpdate={(updates) => updateCriteria(criteria.id, updates)}
                onDelete={() => deleteCriteria(criteria.id)}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          <CriteriaDragOverlay
            criteria={activeCriteria}
            showCodes={managedConfig.use_codes}
          />
        </DragOverlay>
      </DndContext>

      {/* Add Criteria Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <Button
          variant="outline"
          onClick={() => addCriteria('inclusion')}
          className="flex items-center justify-center gap-2 py-6"
          aria-label={CONSTANTS.ARIA_LABELS.ADD_INCLUSION}
        >
          <Plus size={20} />
          <span className="font-medium">Add Inclusion Criteria</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => addCriteria('exclusion')}
          className="flex items-center justify-center gap-2 py-6"
          aria-label={CONSTANTS.ARIA_LABELS.ADD_EXCLUSION}
        >
          <Plus size={20} />
          <span className="font-medium">Add Exclusion Criteria</span>
        </Button>
      </div>

      {/* Use Codes Toggle */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Use Codes</h3>
            <p className="text-sm text-gray-600">
              {managedConfig.use_codes
                ? "Codes will be included in the final decision process."
                : "Codes will be excluded from the final decision process."}
            </p>
          </div>
          <Switch
            checked={managedConfig.use_codes}
            onCheckedChange={toggleUseCodes}
            className="data-[state=checked]:bg-blue-600"
            aria-label={CONSTANTS.ARIA_LABELS.USE_CODES_TOGGLE}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Root component with Suspense wrapper
 */
const SelectionCriteriaApp: React.FC = () => {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
            <p className="text-gray-600">Loading application...</p>
          </div>
        </div>
      }
    >
      <SelectionCriteriaManager />
    </Suspense>
  );
};

export default SelectionCriteriaApp;