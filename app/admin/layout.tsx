import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <AdminHeader />

        {/* Content */}
        <main className="mt-16 min-h-screen bg-slate-950">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
