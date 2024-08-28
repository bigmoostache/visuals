import React from 'react';
import { useFetchJson } from '../../(hooks)/useFetchJson'; // Adjust the import path as needed

const JsonFetcher = ({ url, children }) => {
  const { data, loading, error } = useFetchJson(url);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Pass the fetched data to the child component
  return children(data);
};

export default JsonFetcher;
