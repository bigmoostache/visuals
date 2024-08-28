import React from 'react';

const Table4 = ({ jsonData }) => {
  if (!jsonData || !Array.isArray(jsonData)) {
    // If jsonData is undefined or not an array, return a fallback UI
    return <p>No data available</p>;
  }

  return (
    <table border="1" cellPadding="10" cellSpacing="0">
      <thead>
        <tr>
          <th>Category</th>
          <th>Question</th>
          <th>Possible Value 2</th>
          <th>Definition 2</th>
          <th>Possible Value 1</th>
          <th>Definition 1</th>
          <th>Possible Value 0</th>
          <th>Definition 0</th>
        </tr>
      </thead>
      <tbody>
        {jsonData.map((section, sectionIndex) =>
          section.rows.map((q, qIndex) => (
            <tr key={`${sectionIndex}-${qIndex}`}>
              {qIndex === 0 && (
                <td rowSpan={section.rows.length}>{section.name}</td>
              )}
              <td>{q.definition}</td>
              <td>{q.possible_values[0]?.value}</td>
              <td>{q.possible_values[0]?.definition}</td>
              <td>{q.possible_values[1]?.value}</td>
              <td>{q.possible_values[1]?.definition}</td>
              <td>{q.possible_values[2]?.value}</td>
              <td>{q.possible_values[2]?.definition}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default Table4;
