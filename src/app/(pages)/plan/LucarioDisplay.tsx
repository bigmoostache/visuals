"use client";
import React from 'react';
import { Lucario, Document } from '../lucario/Lucario';

const LucarioDisplay = ({ lucario }: { lucario: Lucario }) => {
  return (
    <div className="plan-lucario-container" style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Lucario Information</h2>
      <div className="lucario-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {Object.values(lucario.elements).map((doc: Document) => (
          <div key={doc.file_uuid} style={{ border: '1px solid #ddd', padding: '0.5rem', borderRadius: '4px' }}>
            <p style={{ fontWeight: 'bold' }}>{doc.file_name}</p>
            <p>Type: {doc.file_ext}</p>
            <p>Status: {doc.pipeline_status}</p>
            {doc.description && (
              <p>Description: {doc.description}</p>
            )}
            {doc.raw_url && (
              <a href={doc.raw_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>Download</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LucarioDisplay;
