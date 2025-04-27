"use client";

import React, { Suspense, useEffect, useState, useRef } from 'react';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { Button } from '@/components/ui/button';
import './styles.css';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Upload, X, Check, FileText, Loader2 } from 'lucide-react';

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
      <LucarioComponent 
        lucario={lucario} 
        setLucario={setLucario} 
        saveLucario={saveLucario} 
        isMutating={isMutating} 
      />
    </div>
  ) : (
    <div className='lucario-bg'><p className="lucario-loading">Loading Lucario data...</p></div>
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
  // Upload state - changed from single file to array of files
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update the Lucario file using data from an external endpoint
  const handleUpdate = async () => {
    // Build a comma-separated list of file_uuids from the existing documents
    try {
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
        return;
      }
      const documents: Document[] = await response.json();
      // empty everything
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
    } catch (error) {
      console.error("Error updating lucario:", error);
    }
  };

  // File selection handler - updated to handle multiple files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Convert FileList to array and append to existing files
      const newFiles = Array.from(files);
      setUploadFiles(prevFiles => [...prevFiles, ...newFiles]);
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
  
  // Remove a specific file from the selection
  const removeFile = (index: number) => {
    setUploadFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    // Reset status if no files left
    if (uploadFiles.length === 1) {
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };
  
  // Handle file upload - updated to handle multiple files
  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      setUploadMessage('Please select at least one file first');
      return;
    }
    
    setUploadStatus('uploading');
    setUploadMessage(`Uploading ${uploadFiles.length} file(s)...`);
    
    // Track successful and failed uploads
    let successCount = 0;
    let failCount = 0;
    
    // Initialize progress tracking for each file
    const initialProgress: {[key: string]: number} = {};
    uploadFiles.forEach(file => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);
    
    // Upload each file sequentially
    for (const file of uploadFiles) {
      try {
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
          throw new Error(`Upload failed for ${file.name} with status: ${response.status}`);
        }
        
        await response.json();
        successCount++;
        
        // Update progress for this file
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
        
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        failCount++;
        
        // Mark this file's progress as failed
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: -1 // Using -1 to indicate error
        }));
      }
    }
    
    // Set final status message
    if (failCount === 0) {
      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${successCount} file(s)`);
    } else if (successCount === 0) {
      setUploadStatus('error');
      setUploadMessage(`Failed to upload ${failCount} file(s)`);
    } else {
      setUploadStatus('error');
      setUploadMessage(`Uploaded ${successCount} file(s), failed to upload ${failCount} file(s)`);
    }
    
    // Clear the files and refresh the list after a delay
    setTimeout(() => {
      clearAllSelectedFiles();
      // Refresh the file list
      handleUpdate();
    }, 2000);
  };
  
  // Handle drop zone - updated to handle multiple files
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadFiles(prevFiles => [...prevFiles, ...newFiles]);
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
              
    return (
      <div key={doc.file_uuid} className="lucario-card-inner">
        <div className="flex justify-between items-center">
          <p className="document-name">{doc.file_name}</p>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-1 rounded-full hover:bg-gray-100 transition-all"
            aria-label={isExpanded ? "Hide details" : "Show details"}
          >
            <ChevronRight 
              size={18} 
              className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            />
          </button>
        </div>
        
        <p className="document-ext">
          Extension: <span className="font-medium">{doc.file_ext}</span>
        </p>
        <p className="document-status">
          <span 
            className="status-indicator" 
            style={{
              backgroundColor: (function(status: PipelineStatus) {
                switch(status) {
                  case 'anticipated': return '#A0AEC0';
                  case 'pending': return '#F6AD55';
                  case 'success': return '#48BB78';
                  case 'error': return '#F56565';
                  case 'retrying': return '#63B3ED';
                  default: return '#CBD5E0';
                }
              })(doc.pipeline_status)
            }}
          ></span>
          <span className="status-text">{doc.pipeline_status}</span>
        </p>
        <p className="document-link">
          <a 
            href={`${lucario.url}/files?file=${doc.file_uuid}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="download-link"
          >
            Download File
          </a>
        </p>
        
        {isExpanded && doc.description && (() => {
          try {
            const parsedDesc = JSON.parse(doc.description);
            if (parsedDesc && typeof parsedDesc === 'object' && !Array.isArray(parsedDesc)) {
              return (
                <pre className="document-description text-wrap">
                  <code>{JSON.stringify(parsedDesc, null, 2)}</code>
                </pre>
              );
            } else {
              return <p className="document-description">{doc.description}</p>;
            }
          } catch (error) {
            return <p className="document-description">{doc.description}</p>;
          }
        })()}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10">
      <div className="lucario-card">
        <h1 className="lucario-title">Knowledge Base Files</h1>
        <div className="lucario-update-button-container mb-4">
          <Button onClick={handleUpdate} disabled={isMutating}>
            {isMutating ? "Updating..." : "Update & Save"}
          </Button>
        </div>
        {/* Upload Section */}
        <div className="upload-section">
          <h2 className="upload-title">Upload New Documents</h2>
          
          <div 
            className={`upload-dropzone ${uploadFiles.length > 0 ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={uploadFiles.length > 0 ? undefined : triggerFileInput}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple // Enable multiple file selection
            />
            
            {uploadFiles.length === 0 ? (
              <div className="upload-dropzone-inner">
                <Upload size={40} className="upload-icon" />
                <p className="upload-text">Drag & drop files here, or click to select</p>
                <p className="upload-subtext">Supported file types: PDF, DOCX, TXT, CSV, etc.</p>
              </div>
            ) : (
              <div className="upload-files-list w-full">
                <div className="upload-files-header">
                  <p className="upload-files-count">{uploadFiles.length} file(s) selected</p>
                  <button 
                    className="upload-files-clear-all" 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllSelectedFiles();
                    }}
                    aria-label="Clear all files"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="upload-files-items">
                  {uploadFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="upload-file-info">
                      <div className="upload-file-details">
                        <FileText size={24} className="upload-file-icon" />
                        <div className="upload-file-name-container">
                          <p className="upload-file-name">{file.name}</p>
                          <p className="upload-file-size">{(file.size / 1024).toFixed(1)} KB</p>
                          
                          {/* Progress bar for file upload */}
                          {uploadStatus === 'uploading' && uploadProgress[file.name] !== undefined && (
                            <div className="upload-file-progress-container">
                              <div 
                                className={`upload-file-progress-bar ${uploadProgress[file.name] === -1 ? 'error' : ''}`}
                                style={{ width: `${uploadProgress[file.name] === -1 ? 100 : uploadProgress[file.name]}%` }}
                              ></div>
                              <span className="upload-file-progress-text">
                                {uploadProgress[file.name] === -1 ? 'Failed' : 
                                 uploadProgress[file.name] === 100 ? 'Completed' : 
                                 `${uploadProgress[file.name]}%`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        className="upload-file-remove" 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Show "Add more files" button when files are already selected */}
                <button 
                  className="upload-add-more" 
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                >
                  + Add More Files
                </button>
              </div>
            )}
          </div>
          
          {uploadMessage && (
            <div className={`upload-message upload-message-${uploadStatus}`}>
              {uploadStatus === 'uploading' && <Loader2 size={16} className="upload-spinner" />}
              {uploadStatus === 'success' && <Check size={16} className="upload-success-icon" />}
              {uploadStatus === 'error' && <X size={16} className="upload-error-icon" />}
              <span>{uploadMessage}</span>
            </div>
          )}
          
          <div className="upload-actions">
            <Button 
              onClick={handleUpload} 
              disabled={uploadFiles.length === 0 || uploadStatus === 'uploading'}
              className="upload-button"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <Loader2 size={16} className="mr-2 upload-spinner" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Upload {uploadFiles.length > 0 ? `(${uploadFiles.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="separator"></div>
        
        <div>
          <div className="lucario-grid">
            {Object.values(lucario.elements).map((doc: Document) => (
              <LucarioElement key={doc.file_id} doc={doc} />
            ))}
          </div>
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