'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  List,
  ShoppingCart,
  Armchair,
  Zap,
  Bell,
  TrendingUp,
  Users,
  Settings,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/menu', icon: List, label: 'Menu', hasSublinks: true },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/admin/tables', icon: Armchair, label: 'Tables' },
    { href: '/admin/qr', icon: Zap, label: 'QR Codes' },
    { href: '/admin/waiter-requests', icon: Bell, label: 'Waiter Requests' },
    { href: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
    { href: '/admin/staff', icon: Users, label: 'Staff' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-amber-600">E</span>lkahmed
        </h1>
        <p className="text-xs text-slate-400 mt-1">Restaurant Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>

              {/* Sublinks for Menu */}
              {item.hasSublinks && active && (
                <div className="ml-4 mt-2 space-y-1 border-l border-slate-700 pl-4">
                  <Link
                    href="/admin/menu/products"
                    className="block px-4 py-2 text-sm text-slate-400 hover:text-amber-600 transition-colors"
                  >
                    Products
                  </Link>
                  <Link
                    href="/admin/menu/categories"
                    className="block px-4 py-2 text-sm text-slate-400 hover:text-amber-600 transition-colors"
                  >
                    Categories
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          © 2024 Elkahmed
        </p>
      </div>
    </aside>
  );
}
