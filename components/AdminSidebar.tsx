'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  List,
  ShoppingCart,
  Armchair,
  TrendingUp,
  X,
  Coffee,
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
    { href: '/admin/analytics', icon: TrendingUp, label: ar.nav.analytics },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed top-0 right-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col overflow-y-auto border-l border-[#eee2d5] bg-[#fdfbf7] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-[#f0e6da] px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c98d4f] to-[#a06a35] text-white shadow-[0_8px_18px_rgba(160,106,53,0.28)]">
            <Coffee size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-[#3b2c22]">
              <span className="text-[#a06a35]">قـا</span> أحمد
            </h1>
            <p className="mt-0.5 text-[11px] text-[#a3937f]">{ar.appSubtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNavigate}
          className="rounded-lg p-2 text-[#a3937f] transition-colors hover:bg-[#f6eee3] hover:text-[#3b2c22] lg:hidden"
          aria-label="إغلاق القائمة"
        >
          <X size={22} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  active
                    ? 'bg-[#f6e8d5] font-bold text-[#8a5a2b]'
                    : 'font-medium text-[#7d6c5e] hover:bg-[#faf3ea] hover:text-[#3b2c22]'
                }`}
              >
                <span
                  className={`h-6 w-1 shrink-0 rounded-full transition-colors ${
                    active ? 'bg-[#b07d3f]' : 'bg-transparent group-hover:bg-[#e4d2ba]'
                  }`}
                />
                <Icon size={20} className={active ? 'text-[#b07d3f]' : 'text-[#b3a291]'} />
                <span>{item.label}</span>
              </Link>

              {item.hasSublinks && active && (
                <div className="mr-4 mt-1.5 space-y-1 border-r border-[#eadbc8] pr-4">
                  <Link
                    href="/admin/menu/products"
                    onClick={onNavigate}
                    className="block rounded-lg px-4 py-2 text-sm text-[#a3937f] transition-colors hover:bg-[#faf3ea] hover:text-[#8a5a2b]"
                  >
                    {ar.nav.products}
                  </Link>
                  <Link
                    href="/admin/menu/categories"
                    onClick={onNavigate}
                    className="block rounded-lg px-4 py-2 text-sm text-[#a3937f] transition-colors hover:bg-[#faf3ea] hover:text-[#8a5a2b]"
                  >
                    {ar.nav.categories}
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[#f0e6da] px-4 py-4">
        <p className="text-center text-xs text-[#b3a291]">© 2024 {ar.appName}</p>
      </div>
    </aside>
  );
}
