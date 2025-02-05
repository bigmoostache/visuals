"use client";
import React from 'react';
import { Lucario, Document } from '../lucario/Lucario';
import './lucario-styles.css';

const LucarioDisplay = ({ lucario }: { lucario: Lucario }) => {
  return (
    <div className="plan-lucario-container">
      <h2 className="plan-lucario-title">Lucario Information</h2>
      <div className="plan-lucario-list">
        {Object.values(lucario.elements).map((doc: Document) => (
          <div key={doc.file_uuid} className="plan-lucario-item">
            <p className="document-name">{doc.file_name}</p>
            <p className="document-ext">
              Extension: <span className="document-ext-value">{doc.file_ext}</span>
            </p>
            <p className="document-status">
              <span className="status-indicator" style={{
                backgroundColor: (function(status: string) {
                  switch(status) {
                    case 'anticipated':
                      return '#A0AEC0';
                    case 'pending':
                      return '#F6AD55';
                    case 'success':
                      return '#48BB78';
                    case 'error':
                      return '#F56565';
                    case 'retrying':
                      return '#63B3ED';
                    default:
                      return '#CBD5E0';
                  }
                })(doc.pipeline_status)
              }}></span>
              <span className="status-text">{doc.pipeline_status}</span>
            </p>
            {doc.description && (() => {
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
            {doc.raw_url && (
              <a href={doc.raw_url} target="_blank" rel="noopener noreferrer" className="document-link">Download</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LucarioDisplay;
