"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast, Toaster } from 'sonner';
import useGetFile from '../../(hooks)/useGetFile';
import usePatchFile from '../../(hooks)/usePatchFile';
import { Grid, GridSection, CONSTANTS } from '../types';
import { SectionCard } from './SectionCard';
import { GridSkeleton } from './GridSkeleton';
import { useAutoResize } from '../hooks/useAutoResize';
import { createNewSection, ensureIds, removeIds, debounce } from '../utils';

export const GridEditor = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  // Data fetching hooks
  const { data, isLoading: isLoadingFile, error: loadError } = useGetFile({ 
    fetchUrl: url as string,
    onSucess: () => toast.success('File loaded successfully')
  });
  
  const { mutate: saveFile, isLoading: isSaving, isSuccess: isSaveSuccess } = usePatchFile({ 
    fetchUrl: url as string 
  });

  // State management
  const [grid, setGrid] = useState<Grid | null>(null);
  const [modified, setModified] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'section' | 'criteria', id: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);
  
  const contextRef = useAutoResize(grid?.context || '');

  // Parse file data
  useEffect(() => {
    if (!data) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const gridWithIds = ensureIds(parsed);
        setGrid(gridWithIds);
        setLastSaved(new Date());
      } catch (error) {
        toast.error('Failed to parse file data');
        console.error('Parse error:', error);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(data);
  }, [data]);

  // Save success handler
  useEffect(() => {
    if (isSaveSuccess) {
      setModified(false);
      setLastSaved(new Date());
      toast.success('Changes saved successfully', {
        icon: <CheckCircle2 className="w-4 h-4" />,
      });
    }
  }, [isSaveSuccess]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Save function
  const handleSave = useCallback(() => {
    if (!grid) return;
    
    const gridWithoutIds = removeIds(grid);
    const blob = new Blob([JSON.stringify(gridWithoutIds)], { type: 'application/json' });
    const file = new File([blob], 'grid.json', { lastModified: Date.now(), type: blob.type });
    
    saveFile(file);
  }, [grid, saveFile]);

  // Autosave
  const autosave = useMemo(() => 
    debounce(() => {
      if (modified && autosaveEnabled && grid) {
        handleSave();
      }
    }, CONSTANTS.AUTOSAVE_DELAY),
    [modified, autosaveEnabled, grid, handleSave]
  );

  useEffect(() => {
    if (modified && autosaveEnabled) {
      autosave();
    }
  }, [grid, modified, autosaveEnabled, autosave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (modified && grid) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modified, grid, handleSave]);

  // Context update handler
  const updateContext = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!grid) return;
    setGrid({
      ...grid,
      context: e.target.value
    });
    setModified(true);
  }, [grid]);

  // Section handlers
  const handleAddSection = useCallback(() => {
    if (!grid) return;
    const newSection = createNewSection();
    setGrid({
      ...grid,
      rows: [...grid.rows, newSection]
    });
    setModified(true);
    toast.success('New section added');
  }, [grid]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    if (!grid) return;
    setGrid({
      ...grid,
      rows: grid.rows.filter(s => s.id !== sectionId)
    });
    setModified(true);
    setDeleteConfirm(null);
    toast.success('Section deleted');
  }, [grid]);

  const handleUpdateSection = useCallback((sectionId: string, updatedSection: GridSection) => {
    if (!grid) return;
    setGrid({
      ...grid,
      rows: grid.rows.map(s => s.id === sectionId ? updatedSection : s)
    });
    setModified(true);
  }, [grid]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (!grid) return;
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = grid.rows.findIndex(s => s.id === active.id);
      const newIndex = grid.rows.findIndex(s => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(grid.rows, oldIndex, newIndex);
        setGrid({
          ...grid,
          rows: newOrder
        });
        setModified(true);
      }
    }
  }, [grid]);

  // Memoized values
  const sortableItems = useMemo(() => 
    grid?.rows.map(s => s.id) || [],
    [grid?.rows]
  );

  const totalStats = useMemo(() => {
    if (!grid) return { sections: 0, questions: 0, values: 0 };
    
    const questions = grid.rows.reduce((acc, section) => acc + section.rows.length, 0);
    const values = grid.rows.reduce((acc, section) => 
      acc + section.rows.reduce((acc2, criteria) => acc2 + criteria.possible_values.length, 0), 0
    );
    
    return {
      sections: grid.rows.length,
      questions,
      values
    };
  }, [grid]);

  // Loading state
  if (isLoadingFile) {
    return <GridSkeleton />;
  }

  // Error state
  if (loadError || !url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Error Loading File</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {loadError ? 'Failed to load the file. Please check the URL and try again.' : 'No URL provided'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!grid) {
    return <GridSkeleton />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b shadow-sm z-10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Grid Editor</h1>
                <div className="flex gap-2">
                  <Badge variant="outline">{totalStats.sections} sections</Badge>
                  <Badge variant="outline">{totalStats.questions} questions</Badge>
                  <Badge variant="outline">{totalStats.values} values</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {lastSaved && (
                  <span className="text-sm text-gray-500">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                
                {modified && (
                  <Badge variant="secondary" className="animate-pulse">
                    Unsaved changes
                  </Badge>
                )}
                
                <Button
                  onClick={handleSave}
                  disabled={!modified || isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save {modified && '(Ctrl+S)'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
            {/* Context Section */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Context</h2>
                <p className="text-sm text-gray-600">
                  Provide context or instructions for this evaluation grid
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  ref={contextRef}
                  placeholder="Enter context or instructions..."
                  value={grid.context || ''}
                  onChange={updateContext}
                  className="resize-none min-h-[100px]"
                  aria-label="Grid context"
                />
              </CardContent>
            </Card>

            {/* Sections */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Sections</h2>
                <Button
                  variant="outline"
                  onClick={handleAddSection}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </Button>
              </div>

              {grid.rows.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-16 text-center text-gray-400">
                    <p className="mb-4">No sections yet. Start by adding your first section.</p>
                    <Button variant="outline" onClick={handleAddSection}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Section
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortableItems}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-6">
                      {grid.rows.map((section) => (
                        <SectionCard
                          key={section.id}
                          section={section}
                          onDelete={() => setDeleteConfirm({ type: 'section', id: section.id })}
                          onUpdate={(updatedSection) => handleUpdateSection(section.id, updatedSection)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {deleteConfirm?.type} and all its contents. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm?.type === 'section') {
                  handleDeleteSection(deleteConfirm.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="bottom-right" richColors />
    </>
  );
};