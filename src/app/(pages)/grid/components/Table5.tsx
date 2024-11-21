import React from 'react';

const data = {
  rows: [
    {
      name: 'Suitability Criteria',
      rows: [
        {
          name: 'Appropriate device',
          definition: 'Were the data generated from the device in question?',
          possible_values: [
            { value: 1, definition: 'Actual device' },
            { value: 2, definition: 'Comparable device' },
            { value: 3, definition: 'Other medical device' },
          ],
        },
        {
          name: 'Appropriate device application',
          definition: 'Was the device used for the same intended use (e.g., methods of deployment, application, etc.)?',
          possible_values: [
            { value: 1, definition: 'Same use' },
            { value: 2, definition: 'Minor deviation' },
            { value: 3, definition: 'Major deviation' },
          ],
        },
        {
          name: 'Appropriate patient group',
          definition: 'Were the data generated from a patient group that is representative of the intended treatment population (e.g., age, sex, etc.) and clinical condition (i.e., disease, including state and severity)?',
          possible_values: [
            { value: 1, definition: 'Applicable' },
            { value: 2, definition: 'Limited' },
            { value: 3, definition: 'Different population' },
          ],
        },
        {
          name: 'Acceptable report/data collation',
          definition: 'Do the reports or collations of data contain sufficient information to be able to undertake a rational and objective assessment?',
          possible_values: [
            { value: 1, definition: 'High quality' },
            { value: 2, definition: 'Minor deficiencies' },
            { value: 3, definition: 'Insufficient information' },
          ],
        },
      ],
    },
    {
      name: 'Data Contribution Criteria',
      rows: [
        {
          name: 'Data source type',
          definition: 'Was the design of the study appropriate?',
          possible_values: [
            { value: 1, definition: 'Yes' },
            { value: 2, definition: 'No' },
          ],
        },
        {
          name: 'Outcome measures',
          definition: 'Do the outcome measures reported reflect the intended performance of the medical device?',
          possible_values: [
            { value: 1, definition: 'Yes' },
            { value: 2, definition: 'No' },
          ],
        },
        {
          name: 'Follow up',
          definition: 'Is the duration of follow-up long enough to assess whether duration of treatment effects and identify complications?',
          possible_values: [
            { value: 1, definition: 'Yes' },
            { value: 2, definition: 'No' },
          ],
        },
        {
          name: 'Statistical significance',
          definition: 'Has a statistical analysis of the data been provided and is it appropriate?',
          possible_values: [
            { value: 1, definition: 'Yes' },
            { value: 2, definition: 'No' },
          ],
        },
        {
          name: 'Clinical significance',
          definition: 'Was the magnitude of the treatment effect observed clinically significant?',
          possible_values: [
            { value: 1, definition: 'Yes' },
            { value: 2, definition: 'No' },
          ],
        },
      ],
    },
  ],
};

const Table5 = () => {
  const tableData = [];

  // Parsing data and consolidating rows with the same criterion
  data.rows.forEach((category) => {
    category.rows.forEach((row) => {
      const possibleValues = row.possible_values
        .map((value) => `${value.value}: ${value.definition}`)
        .join('\n'); // Using new line for possible values

      tableData.push({
        category: category.name,
        criterion: row.name,
        definition: row.definition,
        possibleValues: possibleValues,
      });
    });
  });

  return (
    <div>
      <h1>Criteria Table</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Category</th>
            <th>Criterion</th>
            <th>Definition</th>
            <th>Possible Values</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td>{row.category}</td>
              <td>{row.criterion}</td>
              <td>{row.definition}</td>
              <td>
                <pre>{row.possibleValues}</pre> {/* Displaying each value on a new line */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table5;
