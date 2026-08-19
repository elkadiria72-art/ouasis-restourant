import type { Metadata } from 'next';
import AdminShell from '@/components/AdminShell';

export const metadata: Metadata = {
  applicationName: 'قـا أحمد — لوحة الإدارة',
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'قـا أحمد',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
