'use client';

import { Clock } from 'lucide-react';

interface Order {
  id: string;
  table: string | number;
  amount: number;
  status: 'preparing' | 'ready' | 'served' | 'paid';
  time: string;
}

interface RecentOrdersProps {
  orders?: Order[];
}

const statusColors = {
  preparing: 'bg-yellow-500/20 text-yellow-400',
  ready: 'bg-blue-500/20 text-blue-400',
  served: 'bg-green-500/20 text-green-400',
  paid: 'bg-slate-600/20 text-slate-400',
};

const statusLabels = {
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  paid: 'Paid',
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const defaultOrders: Order[] = [
    { id: '001', table: 5, amount: 285, status: 'preparing', time: '2 min ago' },
    { id: '002', table: 12, amount: 450, status: 'ready', time: '5 min ago' },
    { id: '003', table: 8, amount: 320, status: 'served', time: '8 min ago' },
    { id: '004', table: 3, amount: 215, status: 'paid', time: '15 min ago' },
    { id: '005', table: 15, amount: 580, status: 'preparing', time: '3 min ago' },
  ];

  const displayOrders = orders || defaultOrders;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
        <Clock className="text-amber-600" size={20} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Order ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Table</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Time</th>
            </tr>
          </thead>
          <tbody>
            {displayOrders.map((order) => (
              <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-white">#{order.id}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{order.table}</td>
                <td className="px-4 py-3 text-sm font-semibold text-amber-600">{order.amount} DH</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="w-full mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-sm font-medium transition-colors">
        View All Orders
      </button>
    </div>
  );
}
