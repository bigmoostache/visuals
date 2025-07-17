"use client";

import React, { Suspense, useEffect, useState, useRef } from 'react';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Upload, X, Check, FileText, Loader2, Trash2 } from 'lucide-react';

// Define TypeScript types matching the Pydantic models
export type FileTypes = 
  | 'txt'
  | 'pdf'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'docx'
  | 'doc'
  | 'ppt'
  | 'pptx'
  | 'csv'
  | 'url'
  | 'image_desc'
  | 'text_chunk'
  | 'csv_desc';

export type PipelineStatus = 'anticipated' | 'pending' | 'success' | 'error' | 'retrying';

export interface Document {
  file_id: number;
  parent_file_id?: number;
  direct_parent_file_id?: number;
  file_uuid: string;
  file_name: string;
  file_hash: string;
  file_ext: FileTypes;
  upload_date: string;
  pipeline_status: PipelineStatus;
  ext_project_id: string;
  context?: string;
  position?: number;
  description?: string;
  text?: string;
  score?: number;
  raw_url?: string;
  local_document_identifier: number;
}

export interface Lucario {
  url: string;
  project_id: string;
  elements: { [key: number]: Document };
  uuid_2_position: { [key: string]: number };
}

// LucarioComponentWrapper: Responsible for fetching the Lucario data
const LucarioComponentWrapper = () => {
  // Retrieve URL parameters
  const searchParams = useSearchParams()
  const fileUrl = searchParams.get('url')

  // Fetch the file blob
  const { data } = useGetFile({ fetchUrl: fileUrl || '' });
  const { mutate, isLoading: isMutating } = usePatchFile({ fetchUrl: fileUrl || '' });
  const [lucario, setLucario] = useState<Lucario | null>(null);
  
  useEffect(() => {
    if (!data) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const parsed: Lucario = JSON.parse(e.target?.result as string);
        setLucario(parsed);
      } catch (error) {
        console.error("Error parsing lucario data:", error);
      }
    }
    reader.readAsText(data);
  }, [data]);

  // Convert the Lucario object back to a File for upload
  const saveLucario = (updatedData: Lucario) => {
    const blob = new Blob([JSON.stringify(updatedData)], { type: 'application/json' });
    const file = new File([blob], 'filename.lucario', { lastModified: Date.now(), type: blob.type });
    mutate(file);
  };

  return lucario ? (
    <div className='lucario-bg'>
      <div className="min-h-screen flex items-center justify-center py-10">
        <div className="lucario-card max-w-7xl w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Knowledge Base Files</h1>
          <LucarioComponent 
            lucario={lucario} 
            setLucario={setLucario} 
            saveLucario={saveLucario} 
            isMutating={isMutating} 
          />
        </div>
      </div>
    </div>
  ) : (
    <div className='lucario-bg'>
      <div className="min-h-screen flex items-center justify-center py-10">
        <div className="lucario-card">
          <p className="text-center text-gray-600">Loading Lucario data...</p>
        </div>
      </div>
    </div>
  );
};

// Pure LucarioComponent that only works with provided Lucario data
const LucarioComponent = ({ 
  lucario, 
  setLucario, 
  saveLucario, 
  isMutating 
}: { 
  lucario: Lucario; 
  setLucario: React.Dispatch<React.SetStateAction<Lucario | null>>; 
  saveLucario: (updatedData: Lucario) => void;
  isMutating: boolean;
}) => {
  // Upload state - changed to array for multiple files
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: {status: string, message: string}}>({}); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState<Set<number>>(new Set());

  // Update the Lucario file using data from an external endpoint
  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(
        `${lucario.url}/files_simple?key=${lucario.project_id}`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );
      if (!response.ok) {
        console.error("Update request failed with status:", response.status);
        setIsUpdating(false);
        return;
      }
      const documents: Document[] = await response.json();
      const updatedElements: { [key: number]: Document } = {};
      const updatedUuid2Position: { [key: string]: number } = {};

      // Update or add documents based on the response
      documents.forEach((document: Document) => {
        const newId = document.local_document_identifier;
        updatedElements[newId] = document;
        updatedUuid2Position[document.file_uuid] = newId;
      });

      const updatedLucario: Lucario = {
        ...lucario,
        elements: updatedElements,
        uuid_2_position: updatedUuid2Position,
      };
      setLucario(updatedLucario);
      saveLucario(updatedLucario);
      setIsUpdating(false);
    } catch (error) {
      console.error("Error updating lucario:", error);
      setIsUpdating(false);
    }
  };

  const deleteFileFromLucario = async (url: string, key: string, file_id: number) => {
    await fetch(`${url}/projects/${key}/${file_id}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json'
      }
    });
  }

  const handleDeleteFile = async (doc: Document) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.file_name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingFiles(prev => new Set(Array.from(prev).concat(doc.file_id)));
    
    try {
      await deleteFileFromLucario(lucario.url, lucario.project_id, doc.file_id);
      
      // Remove the file from local state
      const updatedElements = { ...lucario.elements };
      delete updatedElements[doc.local_document_identifier];
      
      const updatedUuid2Position = { ...lucario.uuid_2_position };
      delete updatedUuid2Position[doc.file_uuid];
      
      const updatedLucario: Lucario = {
        ...lucario,
        elements: updatedElements,
        uuid_2_position: updatedUuid2Position,
      };
      
      setLucario(updatedLucario);
      saveLucario(updatedLucario);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file. Please try again.");
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(doc.file_id);
        return newSet;
      });
    }
  };

  // File selection handler - updated for multiple files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Convert FileList to array and add to existing files
      const newFiles = Array.from(files);
      setUploadFiles(prev => [...prev, ...newFiles]);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Clear all selected files
  const clearAllSelectedFiles = () => {
    setUploadFiles([]);
    setUploadStatus('idle');
    setUploadMessage('');
    setUploadProgress({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove a single file
  const removeFile = (index: number) => {
    setUploadFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  // Handle file upload - updated for multiple files
  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      setUploadMessage('Please select at least one file first');
      return;
    }
    
    setUploadStatus('uploading');
    setUploadMessage(`Uploading ${uploadFiles.length} file${uploadFiles.length > 1 ? 's' : ''}...`);
    
    // Initialize progress tracking for each file
    const initialProgress = uploadFiles.reduce((acc, file) => {
      acc[file.name] = { status: 'pending', message: 'Waiting to upload...' };
      return acc;
    }, {} as {[key: string]: {status: string, message: string}});
    
    setUploadProgress(initialProgress);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Upload files in parallel
    try {
      const uploadPromises = uploadFiles.map(async (file, index) => {
        try {
          // Update current file status
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { status: 'uploading', message: 'Uploading...' }
          }));
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('data', 'Uploaded from Lucario UI');
          
          const response = await fetch(`${lucario.url}/upload`, {
            method: 'POST',
            headers: {
              'filename': file.name,
              'key': lucario.project_id,
            },
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
          }
          
          const result = await response.json();
          
          // Update status for this file
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { status: 'success', message: 'Uploaded successfully!' }
          }));
          
          successCount++;
          return { success: true, fileName: file.name };
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          
          // Update status for this file
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { 
              status: 'error', 
              message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
            }
          }));
          
          errorCount++;
          return { success: false, fileName: file.name, error };
        }
      });
      
      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      
      // Set overall status based on results
      if (errorCount === 0) {
        setUploadStatus('success');
        setUploadMessage(`All ${successCount} file${successCount !== 1 ? 's' : ''} uploaded successfully!`);
      } else if (successCount === 0) {
        setUploadStatus('error');
        setUploadMessage(`All ${errorCount} file uploads failed.`);
      } else {
        setUploadStatus('success');
        setUploadMessage(`${successCount} file${successCount !== 1 ? 's' : ''} uploaded successfully. ${errorCount} failed.`);
      }
      
      // Clear the file input after uploads complete
      setTimeout(() => {
        clearAllSelectedFiles();
        // Refresh the file list
        handleUpdate();
      }, 2000);
    } catch (error) {
      console.error("Error in batch upload process:", error);
      setUploadStatus('error');
      setUploadMessage(`Upload process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Handle drop zone - updated for multiple files
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Convert FileList to array and add to existing files
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadFiles(prev => [...prev, ...newFiles]);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const LucarioElement = ({ doc }: { doc: Document }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isDeleting = deletingFiles.has(doc.file_id);
              
    return (
      <div key={doc.file_uuid} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 text-sm relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-sm flex-1 pr-2 leading-tight">{doc.file_name}</h3>
          <div className="flex gap-1 ml-2">
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              aria-label={isExpanded ? "Hide details" : "Show details"}
            >
              <ChevronRight 
                size={16} 
                className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              />
            </button>
            <button 
              onClick={() => handleDeleteFile(doc)}
              disabled={isDeleting}
              className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Delete file"
            >
              {isDeleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="text-xs text-gray-600">
            <span className="font-medium">Type:</span> <span className="font-mono text-gray-800">{doc.file_ext.toUpperCase()}</span>
          </div>
          
          <div className="flex items-center text-xs">
            <span className="text-gray-600 mr-2">Status:</span>
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: (function(status: PipelineStatus) {
                  switch(status) {
                    case 'anticipated': return '#F3F4F6';
                    case 'pending': return '#FEF3C7';
                    case 'success': return '#D1FAE5';
                    case 'error': return '#FEE2E2';
                    case 'retrying': return '#DBEAFE';
                    default: return '#F3F4F6';
                  }
                })(doc.pipeline_status),
                color: (function(status: PipelineStatus) {
                  switch(status) {
                    case 'anticipated': return '#6B7280';
                    case 'pending': return '#D97706';
                    case 'success': return '#059669';
                    case 'error': return '#DC2626';
                    case 'retrying': return '#2563EB';
                    default: return '#6B7280';
                  }
                })(doc.pipeline_status)
              }}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full mr-1.5" 
                style={{
                  backgroundColor: (function(status: PipelineStatus) {
                    switch(status) {
                      case 'anticipated': return '#6B7280';
                      case 'pending': return '#D97706';
                      case 'success': return '#059669';
                      case 'error': return '#DC2626';
                      case 'retrying': return '#2563EB';
                      default: return '#6B7280';
                    }
                  })(doc.pipeline_status)
                }}
              ></span>
              {doc.pipeline_status}
            </span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-100">
          <a 
            href={`${lucario.url}/files?file=${doc.file_uuid}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            <FileText size={14} className="mr-1" />
            Download
          </a>
        </div>
        
        {isExpanded && doc.description && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-600 mb-2 font-medium">Description:</div>
            {(() => {
              try {
                const parsedDesc = JSON.parse(doc.description);
                if (parsedDesc && typeof parsedDesc === 'object' && !Array.isArray(parsedDesc)) {
                  return (
                    <pre className="text-xs text-gray-700 bg-gray-50 p-2 rounded border text-wrap max-h-40 overflow-auto font-mono">
                      <code>{JSON.stringify(parsedDesc, null, 2)}</code>
                    </pre>
                  );
                } else {
                  return <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border max-h-40 overflow-auto">{doc.description}</div>;
                }
              } catch (error) {
                return <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border max-h-40 overflow-auto">{doc.description}</div>;
              }
            })()}
          </div>
        )}
        
        {isDeleting && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="flex items-center text-gray-600">
              <Loader2 size={16} className="animate-spin mr-2" />
              <span className="text-sm">Deleting...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className="flex justify-start">
        <Button 
          onClick={handleUpdate} 
          disabled={isMutating || isUpdating}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-sm font-medium"
        >
          {isUpdating ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Updating...
            </>
          ) : (
            "Refresh Documents"
          )}
        </Button>
      </div>
      
      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
              uploadFiles.length > 0 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={uploadFiles.length > 0 ? undefined : triggerFileInput}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
            
            {uploadFiles.length === 0 ? (
              <div className="max-w-sm mx-auto">
                <Upload size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 mb-1 font-medium">Drop files here or click to select</p>
                <p className="text-gray-500 text-sm">Supported formats: PDF, DOCX, TXT, CSV, and more</p>
              </div>
            ) : (
              <div className="w-full text-left">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    {uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''} selected
                  </h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 flex items-center px-2 py-1 rounded-md text-sm hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllSelectedFiles();
                    }}
                  >
                    <X size={14} className="mr-1" />
                    Clear all
                  </button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uploadFiles.map((file, index) => (
                    <div 
                      key={`${file.name}-${index}`} 
                      className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText size={18} className="text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate text-sm">{file.name}</p>
                          <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      
                      {uploadProgress[file.name] && (
                        <div className={`text-xs mx-3 ${
                          uploadProgress[file.name].status === 'uploading' ? 'text-blue-600' :
                          uploadProgress[file.name].status === 'success' ? 'text-green-600' : 
                          uploadProgress[file.name].status === 'error' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {uploadProgress[file.name].message}
                        </div>
                      )}
                      
                      <button 
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        aria-label="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="mt-3 flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                >
                  <Upload size={16} className="mr-1" />
                  Add more files
                </button>
              </div>
            )}
          </div>
          
          {uploadMessage && (
            <div className={`flex items-center gap-2 mt-4 p-3 rounded-md text-sm ${
              uploadStatus === 'idle' ? 'bg-gray-50 text-gray-700' :
              uploadStatus === 'uploading' ? 'bg-blue-50 text-blue-800' :
              uploadStatus === 'success' ? 'bg-green-50 text-green-800' :
              'bg-red-50 text-red-800'
            }`}>
              {uploadStatus === 'uploading' && <Loader2 size={16} className="animate-spin" />}
              {uploadStatus === 'success' && <Check size={16} className="text-green-600" />}
              {uploadStatus === 'error' && <X size={16} className="text-red-600" />}
              <span>{uploadMessage}</span>
            </div>
          )}
          
          {uploadFiles.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleUpload} 
                disabled={uploadStatus === 'uploading'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium disabled:opacity-50"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Upload {uploadFiles.length} File{uploadFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Documents Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.values(lucario.elements).map((doc: Document) => (
            <LucarioElement key={doc.file_id} doc={doc} />
          ))}
        </div>
      </div>
    </div>
  );
};

const LucarioComponentC = () => {
  return (
    // You could have a loading skeleton as the `fallback` too
    <Suspense>
      <LucarioComponentWrapper />
    </Suspense>
  )
}

export default LucarioComponentC;
// Export the pure component to be used elsewhere
export { LucarioComponent };