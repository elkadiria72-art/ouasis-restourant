'use client';

import { Bell, Menu, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ar, formatRelativeTimeAr } from '@/lib/ar';
import { useAdminSearch } from '@/components/AdminSearchContext';
import OfflineConnectionStatus from '@/components/OfflineConnectionStatus';
import { fetchAdminNotifications } from '@/lib/notifications-actions';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { query, setQuery } = useAdminSearch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; time: string }>
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAdminNotifications();
        setNotifications(data);
      } catch {
        setNotifications([]);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 lg:h-16 lg:px-6 lg:pl-0 lg:pr-64">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-amber-500 lg:hidden"
          aria-label="فتح القائمة"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0 flex-1 max-w-xl">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ar.searchPlaceholder}
              dir="rtl"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-3 pr-10 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-600 focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ⌕
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <OfflineConnectionStatus />
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-400 transition-colors hover:text-amber-500"
            aria-label="الإشعارات"
          >
            <Bell size={22} />
            {notifications.length > 0 && (
              <span className="absolute left-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl sm:left-auto sm:right-0">
              <div className="border-b border-slate-700 px-4 py-3 font-semibold text-white">
                {ar.notifications.title}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">
                    {ar.notifications.empty}
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="border-b border-slate-700 px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-700/50"
                    >
                      <p className="text-sm text-slate-100">{notif.message}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatRelativeTimeAr(notif.time)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-500">
              <User size={18} className="text-white" />
            </div>
            <span className="hidden text-sm font-medium text-slate-100 sm:inline">{ar.admin}</span>
          </button>

          {showProfile && (
            <div className="absolute left-0 mt-2 w-48 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl sm:left-auto sm:right-0">
              <div className="border-b border-slate-700 px-4 py-3">
                <p className="text-sm font-semibold text-white">{ar.admin}</p>
                <p className="text-xs text-slate-400">admin@elkahmed.com</p>
              </div>
              <button className="w-full border-b border-slate-700 px-4 py-2 text-right text-sm text-slate-300 transition-colors hover:bg-slate-700">
                {ar.header.profile}
              </button>
              <button className="w-full px-4 py-2 text-right text-sm text-red-400 transition-colors hover:bg-slate-700">
                {ar.header.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
