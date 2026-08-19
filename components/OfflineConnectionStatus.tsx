'use client';

import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAdminOffline } from '@/components/AdminOfflineProvider';
import { formatRelativeTimeAr } from '@/lib/ar';

function StatusBadge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

export default function OfflineConnectionStatus() {
  const { online, refreshing, lastUpdatedAt } = useAdminOffline();

  if (!online) {
    return <><StatusBadge className="inline-flex border border-amber-200 bg-amber-50 text-amber-700 sm:hidden"><CloudOff size={13} />غير متصل</StatusBadge><StatusBadge className="hidden border border-amber-200 bg-amber-50 text-amber-700 sm:inline-flex"><CloudOff size={14} />غير متصل — عرض آخر البيانات المحفوظة</StatusBadge></>;
  }

  if (refreshing) {
    return <><StatusBadge className="inline-flex border border-sky-200 bg-sky-50 text-sky-700 sm:hidden"><RefreshCw size={13} className="animate-spin" />تحديث</StatusBadge><StatusBadge className="hidden border border-sky-200 bg-sky-50 text-sky-700 sm:inline-flex"><RefreshCw size={13} className="animate-spin" />جاري تحديث البيانات...</StatusBadge></>;
  }

  return <><StatusBadge className="inline-flex border border-emerald-200 bg-emerald-50 text-emerald-700 sm:hidden"><Cloud size={13} />متصل</StatusBadge><StatusBadge className="hidden border border-emerald-200 bg-emerald-50 text-emerald-700 sm:inline-flex"><Cloud size={14} />متصل{lastUpdatedAt && <span className="font-normal text-emerald-600/80">· {formatRelativeTimeAr(lastUpdatedAt)}</span>}</StatusBadge></>;
}
