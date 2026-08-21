'use client';

import { Bell, Menu, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ar, formatRelativeTimeAr } from '@/lib/ar';
import { useAdminSearch } from '@/components/AdminSearchContext';
import OfflineConnectionStatus from '@/components/OfflineConnectionStatus';
import { useAdminRealtime } from '@/components/useAdminRealtime';
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

  const loadNotifications = async () => {
    try {
      const data = await fetchAdminNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    void loadNotifications();
    const interval = setInterval(() => void loadNotifications(), 120000);
    return () => clearInterval(interval);
  }, []);

  useAdminRealtime({
    onOrdersChange: () => void loadNotifications(),
    onWaiterCallsChange: () => void loadNotifications(),
  });

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[#eee2d5] bg-[#fdfbf7]/90 px-4 backdrop-blur-md lg:h-16 lg:px-6 lg:pl-0 lg:pr-72">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#7d6c5e] transition-colors hover:bg-[#f6e8d5] hover:text-[#8a5a2b] lg:hidden"
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
              className="w-full rounded-xl border border-[#eadbc8] bg-white py-2 pl-3 pr-10 text-sm text-[#3b2c22] placeholder-[#b3a291] shadow-[0_2px_10px_rgba(93,64,41,0.04)] transition-colors focus:border-[#c98d4f] focus:outline-none focus:ring-2 focus:ring-[#c98d4f]/20"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#b3a291]">
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
            className="relative rounded-xl p-2 text-[#7d6c5e] transition-colors hover:bg-[#f6e8d5] hover:text-[#8a5a2b]"
            aria-label="الإشعارات"
          >
            <Bell size={22} />
            {notifications.length > 0 && (
              <span className="absolute left-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-[#fdfbf7] bg-[#c05c5c]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#eee2d5] bg-white shadow-[0_18px_45px_rgba(93,64,41,0.14)] sm:left-auto sm:right-0">
              <div className="border-b border-[#f0e6da] px-4 py-3 font-bold text-[#3b2c22]">
                {ar.notifications.title}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-[#a3937f]">
                    {ar.notifications.empty}
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="border-b border-[#f4ece1] px-4 py-3 transition-colors last:border-b-0 hover:bg-[#faf5ed]"
                    >
                      <p className="text-sm leading-6 text-[#3b2c22]">{notif.message}</p>
                      <p className="mt-1 text-xs text-[#b3a291]">
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
            className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-[#f6e8d5]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#c98d4f] to-[#a06a35] shadow-[0_4px_10px_rgba(160,106,53,0.25)]">
              <User size={18} className="text-white" />
            </div>
            <span className="hidden text-sm font-medium text-[#5c4a3b] sm:inline">{ar.admin}</span>
          </button>

          {showProfile && (
            <div className="absolute left-0 mt-2 w-48 overflow-hidden rounded-2xl border border-[#eee2d5] bg-white shadow-[0_18px_45px_rgba(93,64,41,0.14)] sm:left-auto sm:right-0">
              <div className="border-b border-[#f0e6da] px-4 py-3">
                <p className="text-sm font-bold text-[#3b2c22]">{ar.admin}</p>
                <p className="text-xs text-[#a3937f]">admin@elkahmed.com</p>
              </div>
              <button className="w-full border-b border-[#f4ece1] px-4 py-2.5 text-right text-sm text-[#5c4a3b] transition-colors hover:bg-[#faf5ed]">
                {ar.header.profile}
              </button>
              <button className="w-full px-4 py-2.5 text-right text-sm text-[#c05c5c] transition-colors hover:bg-[#faf5ed]">
                {ar.header.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
