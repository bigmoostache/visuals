import React from 'react';

const DataEvaluationTable = () => {
  const data = [
    {
      dataset: 'Kazley-2018',
      relevance: [0, 0, 2],
      quality: [1, 1, 1, 0],
      totalRelevance: 2,
      totalQuality: 3,
      weight: 5,
      levelOfEvidence: 2
    },
    {
      dataset: 'Agarwal-2021',
      relevance: [2, 2, 2],
      quality: [1, 1, 1, 1],
      totalRelevance: 6,
      totalQuality: 4,
      weight: 10,
      levelOfEvidence: 10
    },
    {
      dataset: 'Carli-2017',
      relevance: [2, 2, 2],
      quality: [1, 1, 1, 1],
      totalRelevance: 6,
      totalQuality: 4,
      weight: 10,
      levelOfEvidence: 10
    },
    {
      dataset: 'Cavagnaro-2018',
      relevance: [2, 2, 2],
      quality: [1, 1, 1, 1],
      totalRelevance: 6,
      totalQuality: 4,
      weight: 10,
      levelOfEvidence: 9
    }
  ];

  const tableStyle = {
    border: '1px solid white',
    borderCollapse: 'collapse',
    width: '100%',
    textAlign: 'center'
  };

  const thTdStyle = {
    border: '1px solid white',
    padding: '8px',
    // backgroundColor: '#ffff99' // Light yellow background
  };

  const headerStyle = {
    border: '1px solid white',
    padding: '8px',
    // backgroundColor: '#d3d3d3', // Light grey background for header
    fontWeight: 'bold'
  };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={headerStyle}>Dataset</th>
          <th colSpan={4} style={headerStyle}>Relevance</th>
          <th colSpan={4} style={headerStyle}>Quality</th>
          <th style={headerStyle}>Weight</th>
          <th style={headerStyle}>Level of evidence</th>
        </tr>
        <tr>
          <th style={headerStyle}></th>
          <th style={headerStyle}>CRIT#1</th>
          <th style={headerStyle}>CRIT#2</th>
          <th style={headerStyle}>CRIT#3</th>
          <th style={headerStyle}>Total /6</th>
          <th style={headerStyle}>CRIT#4</th>
          <th style={headerStyle}>CRIT#5</th>
          <th style={headerStyle}>CRIT#6</th>
          <th style={headerStyle}>CRIT#7</th>
          <th style={headerStyle}>Total /4</th>
          <th style={headerStyle}></th>
          <th style={headerStyle}></th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td style={thTdStyle}>{row.dataset}</td>
            {row.relevance.map((value, idx) => (
              <td style={thTdStyle} key={idx}>{value}</td>
            ))}
            <td style={thTdStyle}>{row.totalRelevance}</td>
            {row.quality.map((value, idx) => (
              <td style={thTdStyle} key={idx}>{value}</td>
            ))}
            <td style={thTdStyle}>{row.totalQuality}</td>
            <td style={thTdStyle}>{row.weight}</td>
            <td style={thTdStyle}>{row.levelOfEvidence}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataEvaluationTable;
