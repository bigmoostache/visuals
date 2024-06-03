"use client";

// https://codevoweb.com/setup-react-query-in-nextjs-13-app-directory/
import { QueryClient, QueryClientProvider } from 'react-query';
import type { ReactNode } from "react";
import React, { useState } from "react";

interface Props {
  children: ReactNode;
}

const QueryProvider = ({ children }: Props) => {
  const [client] = useState(
    new QueryClient({
      defaultOptions: {
        queries: { staleTime: 5000, refetchOnWindowFocus: false },
      },
    })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default QueryProvider;
