'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { AdminSearchProvider } from '@/components/AdminSearchContext';
import { AdminOfflineProvider } from '@/components/AdminOfflineProvider';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <AdminOfflineProvider>
      <AdminSearchProvider>
        <div className="flex min-h-screen overflow-x-hidden bg-slate-950">
          {sidebarOpen && (
            <button
              type="button"
              aria-label="إغلاق القائمة"
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={closeSidebar}
            />
          )}

          <AdminSidebar open={sidebarOpen} onNavigate={closeSidebar} />

          <div className="flex min-w-0 flex-1 flex-col lg:mr-64">
            <AdminHeader onMenuClick={openSidebar} />
            <main className="mt-14 min-h-screen flex-1 lg:mt-16">
              <div className="max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</div>
            </main>
          </div>
        </div>
      </AdminSearchProvider>
    </AdminOfflineProvider>
  );
}
