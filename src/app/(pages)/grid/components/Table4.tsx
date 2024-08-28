import React from 'react';

const Table4 = ({ jsonData }) => {
  if (!jsonData || !Array.isArray(jsonData)) {
    // If jsonData is undefined or not an array, return a fallback UI
    return <p>No data available</p>;
  }

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', backgroundColor: 'white' }}>
      <thead>
        <tr>
          <th style={headerCellStyle}>Category</th>
          <th style={headerCellStyle}>Question</th>
          <th style={headerCellStyle}>Possible Value 2</th>
          <th style={headerCellStyle}>Definition 2</th>
          <th style={headerCellStyle}>Possible Value 1</th>
          <th style={headerCellStyle}>Definition 1</th>
          <th style={headerCellStyle}>Possible Value 0</th>
          <th style={headerCellStyle}>Definition 0</th>
        </tr>
      </thead>
      <tbody>
        {jsonData.map((section, sectionIndex) =>
          section.rows.map((q, qIndex) => (
            <tr key={`${sectionIndex}-${qIndex}`}>
              {qIndex === 0 && (
                <td style={cellStyle} rowSpan={section.rows.length}>{section.name}</td>
              )}
              <td style={cellStyle}>{q.definition}</td>
              <td style={cellStyle}>{q.possible_values[0]?.value}</td>
              <td style={cellStyle}>{q.possible_values[0]?.definition}</td>
              <td style={cellStyle}>{q.possible_values[1]?.value}</td>
              <td style={cellStyle}>{q.possible_values[1]?.definition}</td>
              <td style={cellStyle}>{q.possible_values[2]?.value}</td>
              <td style={cellStyle}>{q.possible_values[2]?.definition}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

const headerCellStyle = {
  border: '1px solid black',
  backgroundColor: '#f2f2f2',
  padding: '8px',
  textAlign: 'left',
};

const cellStyle = {
  border: '1px solid black',
  padding: '8px',
  textAlign: 'left',
};

export default Table4;

