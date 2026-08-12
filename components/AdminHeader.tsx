'use client';

import { Search, Bell, User } from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, message: 'New order from Table 5', time: '2 min ago' },
    { id: 2, message: 'Waiter request from Table 3', time: '5 min ago' },
    { id: 3, message: 'Kitchen ready: Order #124', time: '8 min ago' },
  ];

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 z-40">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search orders, tables, items..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-600 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-8">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-400 hover:text-amber-600 transition-colors"
          >
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700 font-semibold text-white">
                Notifications
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="px-4 py-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors last:border-b-0"
                  >
                    <p className="text-sm text-slate-100">{notif.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 bg-slate-700/50 text-center">
                <button className="text-xs text-amber-600 hover:text-amber-500 font-medium">
                  View All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <span className="text-sm text-slate-100 font-medium">Admin</span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-sm font-semibold text-white">Admin User</p>
                <p className="text-xs text-slate-400">admin@elkahmed.com</p>
              </div>
              <button className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors text-left border-b border-slate-700">
                Profile
              </button>
              <button className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors text-left border-b border-slate-700">
                Settings
              </button>
              <button className="w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors text-left">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
