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
  X,
} from 'lucide-react';
import { ar } from '@/lib/ar';

interface AdminSidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export default function AdminSidebar({ open, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin', icon: Home, label: ar.nav.dashboard },
    { href: '/admin/menu', icon: List, label: ar.nav.menu, hasSublinks: true },
    { href: '/admin/orders', icon: ShoppingCart, label: ar.nav.orders },
    { href: '/admin/tables', icon: Armchair, label: ar.nav.tables },
    { href: '/admin/qr', icon: Zap, label: ar.nav.qr },
    { href: '/admin/waiter-requests', icon: Bell, label: ar.nav.waiterRequests },
    { href: '/admin/analytics', icon: TrendingUp, label: ar.nav.analytics },
    { href: '/admin/staff', icon: Users, label: ar.nav.staff },
    { href: '/admin/settings', icon: Settings, label: ar.nav.settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed top-0 right-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col overflow-y-auto border-l border-slate-800 bg-slate-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            <span className="text-amber-600">قـا</span> أحمد
          </h1>
          <p className="mt-1 text-xs text-slate-400">{ar.appSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={onNavigate}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="إغلاق القائمة"
        >
          <X size={22} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  active
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>

              {item.hasSublinks && active && (
                <div className="mr-4 mt-2 space-y-1 border-r border-slate-700 pr-4">
                  <Link
                    href="/admin/menu/products"
                    onClick={onNavigate}
                    className="block rounded-lg px-4 py-2 text-sm text-slate-400 transition-colors hover:text-amber-500"
                  >
                    {ar.nav.products}
                  </Link>
                  <Link
                    href="/admin/menu/categories"
                    onClick={onNavigate}
                    className="block rounded-lg px-4 py-2 text-sm text-slate-400 transition-colors hover:text-amber-500"
                  >
                    {ar.nav.categories}
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-4 py-4">
        <p className="text-center text-xs text-slate-500">© 2024 {ar.appName}</p>
      </div>
    </aside>
  );
}
