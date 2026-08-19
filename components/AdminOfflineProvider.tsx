'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface OfflineState {
  online: boolean;
  refreshing: boolean;
  lastUpdatedAt: string | null;
}

const OfflineContext = createContext<OfflineState>({
  online: true,
  refreshing: false,
  lastUpdatedAt: null,
});

export function AdminOfflineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const setCurrentConnection = () => setOnline(navigator.onLine);
    const handleOnline = () => {
      setOnline(true);
      setRefreshing(true);
      window.dispatchEvent(new Event('admin-connection-restored'));
      window.setTimeout(() => setRefreshing(false), 1200);
    };
    const handleOffline = () => {
      setOnline(false);
      setRefreshing(false);
    };
    const handleCacheUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ updatedAt?: string }>).detail;
      if (detail?.updatedAt) setLastUpdatedAt(detail.updatedAt);
      setRefreshing(false);
    };

    setCurrentConnection();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('admin-cache-updated', handleCacheUpdated);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' }).catch(() => {
        // PWA registration is non-blocking and must not affect the Admin.
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('admin-cache-updated', handleCacheUpdated);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ online, refreshing, lastUpdatedAt }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useAdminOffline() {
  return useContext(OfflineContext);
}
