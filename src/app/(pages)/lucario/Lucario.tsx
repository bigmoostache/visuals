"use client";

import React, { Suspense, useEffect, useState } from 'react';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { Button } from '@/components/ui/button';
import './styles.css';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen lucario-bg flex items-center justify-center py-10">
      <div className="lucario-card">
        <h1 className="lucario-title">Knowledge Base Files</h1>
        <div className="lucario-update-button-container mb-4">
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update & Save"}
          </Button>
        </div>
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
