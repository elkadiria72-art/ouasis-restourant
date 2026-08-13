'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface AdminSearchContextValue {
  query: string;
  setQuery: (query: string) => void;
}

const AdminSearchContext = createContext<AdminSearchContextValue>({
  query: '',
  setQuery: () => {},
});

export function AdminSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  return (
    <AdminSearchContext.Provider value={{ query, setQuery }}>
      {children}
    </AdminSearchContext.Provider>
  );
}

export function useAdminSearch() {
  return useContext(AdminSearchContext);
}
