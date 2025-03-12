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

const LucarioComponent = () => {
  // Retrieve URL parameters
  const searchParams = useSearchParams()
  const fileUrl = searchParams.get('url')

  // Fetch the file blob
  const { data } = useGetFile({ fetchUrl: fileUrl || '' });
  const { mutate, isLoading } = usePatchFile({ fetchUrl: fileUrl || '' });
  const [lucario, setLucario] = useState<Lucario | null>(null);
  
  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const convertToBlob = (data: Lucario) => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    return new File([blob], 'filename.lucario', { lastModified: Date.now(), type: blob.type });
  };

  const saveLucario = (updatedData: Lucario) => {
    mutate(convertToBlob(updatedData));
  };

  // Update the Lucario file using data from an external endpoint
  const handleUpdate = async () => {
    if (!lucario) return;
    // Build a comma-separated list of file_uuids from the existing documents
    try {
      const response = await fetch(
        `https://lucario.deepdocs.net/files_simple?key=${lucario.project_id}`,
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

  // File selection handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadFile(files[0]);
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
  
  // Clear selected file
  const clearSelectedFile = () => {
    setUploadFile(null);
    setUploadStatus('idle');
    setUploadMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile || !lucario) {
      setUploadMessage('Please select a file first');
      return;
    }
    
    setUploadStatus('uploading');
    setUploadMessage('Uploading file...');
    
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('data', 'Uploaded from Lucario UI');
      
      const response = await fetch('https://lucario.deepdocs.net/upload', {
        method: 'POST',
        headers: {
          'filename': uploadFile.name,
          'key': lucario.project_id,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      setUploadStatus('success');
      setUploadMessage('File uploaded successfully!');
      
      // Clear the file input after successful upload
      setTimeout(() => {
        clearSelectedFile();
        // Refresh the file list
        handleUpdate();
      }, 2000);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus('error');
      setUploadMessage(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Handle drop zone
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFile(e.dataTransfer.files[0]);
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
            href={`${lucario?.url}/files?file=${doc.file_uuid}`} 
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
    <div className="min-h-screen lucario-bg flex items-center justify-center py-10">
      <div className="lucario-card">
        <h1 className="lucario-title">Knowledge Base Files</h1>
        <div className="lucario-update-button-container mb-4">
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update & Save"}
          </Button>
        </div>
        {/* Upload Section */}
        <div className="upload-section">
          <h2 className="upload-title">Upload New Document</h2>
          
          <div 
            className={`upload-dropzone ${uploadFile ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={uploadFile ? undefined : triggerFileInput}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!uploadFile ? (
              <div className="upload-dropzone-inner">
                <Upload size={40} className="upload-icon" />
                <p className="upload-text">Drag & drop a file here, or click to select</p>
                <p className="upload-subtext">Supported file types: PDF, DOCX, TXT, CSV, etc.</p>
              </div>
            ) : (
              <div className="upload-file-info">
                <div className="upload-file-details">
                  <FileText size={24} className="upload-file-icon" />
                  <div className="upload-file-name-container">
                    <p className="upload-file-name">{uploadFile.name}</p>
                    <p className="upload-file-size">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  className="upload-file-remove" 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelectedFile();
                  }}
                  aria-label="Remove file"
                >
                  <X size={20} />
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
              disabled={!uploadFile || uploadStatus === 'uploading'}
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
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="separator"></div>
        
        {lucario ? (
          <div>
            <div className="lucario-grid">
              {Object.values(lucario.elements).map((doc: Document) => (
                <LucarioElement key={doc.file_id} doc={doc} />
              ))}
            </div>
          </div>
        ) : (
          <p className="lucario-loading">Loading Lucario data...</p>
        )}
      </div>
    </div>
  );
};

const LucarioComponentC = () => {
  return (
    // You could have a loading skeleton as the `fallback` too
    <Suspense>
      <LucarioComponent />
    </Suspense>
  )
}
export default LucarioComponentC;