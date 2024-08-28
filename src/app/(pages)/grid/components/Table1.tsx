import React from 'react';

export const Table1 = () => {
  const data = {
    rows: [
      {
        name: "Relevance",
        rows: [
          {
            name: "Question 1",
            definition: "Is the data provided for the device [A]?",
            possible_values: [
              { value: 2, definition: "Studied device" },
              { value: 1, definition: "Alternative solution" },
              { value: 0, definition: "No data on devices" }
            ]
          },
          {
            name: "Question 2",
            definition: "Is the intended use [B] of the medical device [A] the same in the article?",
            possible_values: [
              { value: 2, definition: "Same usage" },
              { value: 1, definition: "Minor difference" },
              { value: 0, definition: "Major difference" }
            ]
          },
          {
            name: "Question 3",
            definition: "Is the population of patients in the article representative of the studied population [C]?",
            possible_values: [
              { value: 2, definition: "Applicable" },
              { value: 1, definition: "Limited" },
              { value: 0, definition: "Different" }
            ]
          }
        ]
      },
      {
        name: "Quality",
        rows: [
          {
            name: "Question 4",
            definition: "Is the study design/type of document appropriate and does it contain sufficient data?",
            possible_values: [
              { value: 1, definition: "Yes" },
              { value: 0, definition: "No" }
            ]
          },
          {
            name: "Question 5",
            definition: "Is measured outcome related to the analyzed outcome?",
            possible_values: [
              { value: 1, definition: "Yes" },
              { value: 0, definition: "No" }
            ]
          },
          {
            name: "Question 6",
            definition: "Is there sufficient duration of the follow-up?",
            possible_values: [
              { value: 1, definition: "Yes" },
              { value: 0, definition: "No" }
            ]
          },
          {
            name: "Question 7",
            definition: "Is there a statistical analysis? Is it appropriate?",
            possible_values: [
              { value: 1, definition: "Yes" },
              { value: 0, definition: "No" }
            ]
          }
        ]
      },
      {
        name: "Level of evidence",
        rows: [
          {
            name: "Level of Evidence",
            definition: "What is the level of evidence in terms of the type of dataset?",
            possible_values: [
              { value: 10, definition: "Critical appraisal, Meta-analysis" },
              { value: 9, definition: "Systematic reviews" },
              { value: 8, definition: "Critically Appraised Literature, Evidence-Based Practice Guidelines" },
              { value: 7, definition: "Experimental studies, Randomized Controlled Trials" },
              { value: 6, definition: "Non-Randomized Controlled trials" },
              { value: 5, definition: "Observational studies, Cohort studies" },
              { value: 4, definition: "Cases series studies" },
              { value: 3, definition: "Individual case reports" },
              { value: 2, definition: "Expert opinion, non-EBM Guidelines" },
              { value: 1, definition: "Other" }
            ]
          }
        ]
      }
    ]
  };

  const tableStyle = {
    border: '1px solid white',
    width: '100%',
    borderCollapse: 'collapse'
  };

  const thTdStyle = {
    border: '1px solid white',
    padding: '10px'
  };

  return (
    <div>
      {data.rows.map((category, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <h3>{category.name}</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thTdStyle}>Question</th>
                <th style={thTdStyle}>Definition</th>
                <th style={thTdStyle}>Possible Values</th>
              </tr>
            </thead>
            <tbody>
              {category.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td style={thTdStyle}>{row.name}</td>
                  <td style={thTdStyle}>{row.definition}</td>
                  <td style={thTdStyle}>
                    <ul>
                      {row.possible_values.map((value, valueIndex) => (
                        <li key={valueIndex}>
                          {value.value}: {value.definition}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Table1;
