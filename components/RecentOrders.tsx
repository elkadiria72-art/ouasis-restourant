'use client';

import { Clock } from 'lucide-react';
import Link from 'next/link';
import { ar, formatNumberAr, formatRelativeTimeAr, formatTimeAr } from '@/lib/ar';

interface Order {
  id: number;
  table_number: number;
  total_amount: number;
  status: string;
  created_at: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  preparing: 'bg-yellow-500/20 text-yellow-400',
  ready: 'bg-purple-500/20 text-purple-400',
  served: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const statusLabel = (status: string) =>
    ar.orderStatus[status as keyof typeof ar.orderStatus] || status;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{ar.dashboard.recentOrders}</h3>
        <Clock className="text-amber-600" size={20} />
      </div>

      {orders.length === 0 ? (
        <p className="py-8 text-center text-slate-400">{ar.dashboard.noOrders}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-400 sm:px-4">
                  رقم الطلب
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-400 sm:px-4">
                  الطاولة
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-400 sm:px-4">
                  المبلغ
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-400 sm:px-4">
                  الحالة
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-400 sm:px-4">
                  الوقت
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-700 transition-colors last:border-0 hover:bg-slate-700/30"
                >
                  <td className="px-3 py-3 text-sm font-medium text-white sm:px-4">#{order.id}</td>
                  <td className="px-3 py-3 text-sm text-slate-300 sm:px-4">{order.table_number}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-amber-600 sm:px-4">
                    {formatNumberAr(order.total_amount)} {ar.dh}
                  </td>
                  <td className="px-3 py-3 text-sm sm:px-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        statusColors[order.status] || 'bg-slate-600/20 text-slate-400'
                      }`}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400 sm:px-4">
                    {formatTimeAr(order.created_at)} — {formatRelativeTimeAr(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link
        href="/admin/orders"
        className="mt-6 block w-full rounded-lg bg-slate-700 px-4 py-2 text-center text-sm font-medium text-slate-100 transition-colors hover:bg-slate-600"
      >
        {ar.viewAll} — {ar.nav.orders}
      </Link>
    </div>
  );
}
