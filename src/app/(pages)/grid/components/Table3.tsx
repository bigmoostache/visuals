import React from 'react';

const Table3 = () => {
  const data = {
    'RELEVANCE_QUESTION_1': {
      section: 'Relevance',
      name: 'Question 1',
      value_justification: 'The article provides data on both intermedullary nails and external fixators for the treatment of infected non-union long bones.',
      value: 2
    },
    'RELEVANCE_QUESTION_2': {
      section: 'Relevance',
      name: 'Question 2',
      value_justification: 'The intended use of the devices seems consistent with their applications discussed in the article, which compares their effectiveness in treating infected non-union of long bones.',
      value: 2
    },
    'RELEVANCE_QUESTION_3': {
      section: 'Relevance',
      name: 'Question 3',
      value_justification: 'The study involves adult patients with infected non-union long bones, which is applicable to the studied population.',
      value: 2
    },
    'QUALITY_QUESTION_4': {
      section: 'Quality',
      name: 'Question 4',
      value_justification: 'The study is well-designed as a prospective study comparing two treatment methods with defined outcomes and appropriate sample size.',
      value: 1
    },
    'QUALITY_QUESTION_5': {
      section: 'Quality',
      name: 'Question 5',
      value_justification: 'The outcomes measured in terms of bony union, infection control, and ASAMI scores are directly related to the treatment analyzed.',
      value: 1
    },
    'QUALITY_QUESTION_6': {
      section: 'Quality',
      name: 'Question 6',
      value_justification: 'The follow-up period lasts for one year or until bony union, which is sufficient for observing the outcomes of interest in orthopedic treatments.',
      value: 1
    },
    'QUALITY_QUESTION_7': {
      section: 'Quality',
      name: 'Question 7',
      value_justification: 'Statistical analysis was conducted using the SPSS software, indicating an appropriate approach to data analysis.',
      value: 1
    },
    'LEVEL_OF_EVIDENCE_LEVEL_OF_EVIDENCE': {
      section: 'Level of evidence',
      name: 'Level of Evidence',
      value_justification: 'The study is a prospective study and can be considered as an observational study providing valuable data on the treatments compared.',
      value: 5
    }
  };

  const tableStyle = {
    border: '1px solid white',
    borderCollapse: 'collapse',
    width: '100%',
    textAlign: 'left'
  };

  const thTdStyle = {
    border: '1px solid white',
    padding: '8px'
  };

  const headerStyle = {
    border: '1px solid white',
    padding: '8px',
    // backgroundColor: '#d3d3d3', // Light grey background for header
    fontWeight: 'bold'
  };

  const groupedData = Object.values(data).reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={headerStyle}>Section</th>
          <th style={headerStyle}>Question</th>
          <th style={headerStyle}>Justification</th>
          <th style={headerStyle}>Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(groupedData).map((section, index) => (
          <React.Fragment key={index}>
            {groupedData[section].map((item, idx) => (
              <tr key={idx}>
                {idx === 0 && (
                  <td style={thTdStyle} rowSpan={groupedData[section].length}>
                    {item.section}
                  </td>
                )}
                <td style={thTdStyle}>{item.name}</td>
                <td style={thTdStyle}>{item.value_justification}</td>
                <td style={thTdStyle}>{item.value}</td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default Table3;
