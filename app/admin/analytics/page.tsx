'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock3, Star, Users } from 'lucide-react';
import { fetchAnalyticsData, type AnalyticsSummary } from '@/lib/analytics-actions';

const statCardClasses = 'rounded-xl border border-slate-700 bg-slate-800 p-5';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(value);
}

function percentChange(current: number, previous: number) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchAnalyticsData();
        setAnalytics(data);
      } catch (err) {
        setError((err as Error).message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center text-slate-400">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!analytics || error) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-300">
          {error || 'Analytics could not be loaded.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics Overview</h1>
        <p className="mt-1 text-slate-400">Performance insights across sales, product demand, and table activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={statCardClasses}>
          <div className="mb-3 flex items-center justify-between text-slate-300">
            <span className="text-sm">Revenue</span>
            <DollarSign className="text-amber-500" size={18} />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</p>
          <p className="mt-2 text-sm text-emerald-400">
            {percentChange(analytics.salesByPeriod.month.revenue, analytics.salesByPeriod.month.previousRevenue).toFixed(1)}% vs previous month
          </p>
        </div>

        <div className={statCardClasses}>
          <div className="mb-3 flex items-center justify-between text-slate-300">
            <span className="text-sm">Orders</span>
            <ShoppingCart className="text-blue-400" size={18} />
          </div>
          <p className="text-3xl font-bold text-white">{analytics.totalOrders}</p>
          <p className="mt-2 text-sm text-emerald-400">
            {percentChange(analytics.salesByPeriod.week.orders, analytics.salesByPeriod.week.previousOrders).toFixed(1)}% vs previous week
          </p>
        </div>

        <div className={statCardClasses}>
          <div className="mb-3 flex items-center justify-between text-slate-300">
            <span className="text-sm">Completed</span>
            <TrendingUp className="text-green-400" size={18} />
          </div>
          <p className="text-3xl font-bold text-white">{analytics.completedOrders}</p>
          <p className="mt-2 text-sm text-slate-400">Current fulfillment performance</p>
        </div>

        <div className={statCardClasses}>
          <div className="mb-3 flex items-center justify-between text-slate-300">
            <span className="text-sm">Average Value</span>
            <Star className="text-purple-400" size={18} />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(analytics.averageOrderValue)}</p>
          <p className="mt-2 text-sm text-amber-400">Per order average</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-xl font-semibold text-white">Sales Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Today', value: analytics.salesByPeriod.today },
              { label: 'This Week', value: analytics.salesByPeriod.week },
              { label: 'This Month', value: analytics.salesByPeriod.month },
            ].map((period) => (
              <div key={period.label} className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-white">{period.label}</p>
                  <span className="text-sm text-slate-400">{period.value.orders} orders</span>
                </div>
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(period.value.revenue)}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>prev:</span>
                  <span>{formatCurrency(period.value.previousRevenue)}</span>
                  <span className="text-emerald-400">
                    {percentChange(period.value.revenue, period.value.previousRevenue).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-xl font-semibold text-white">Orders Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4">
              <span className="text-slate-300">Completed</span>
              <span className="text-lg font-semibold text-green-300">{analytics.completedOrders}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4">
              <span className="text-slate-300">Cancelled</span>
              <span className="text-lg font-semibold text-red-300">{analytics.cancelledOrders}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4">
              <span className="text-slate-300">Average Value</span>
              <span className="text-lg font-semibold text-amber-300">{formatCurrency(analytics.averageOrderValue)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4">
              <span className="text-slate-300">Net Revenue</span>
              <span className="text-lg font-semibold text-white">{formatCurrency(analytics.totalRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-xl font-semibold text-white">Top Selling Products</h2>
          <div className="space-y-3">
            {analytics.topProducts.length ? analytics.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3">
                <div>
                  <p className="font-medium text-white">#{index + 1} {product.name}</p>
                  <p className="text-xs text-slate-400">{product.units} units</p>
                </div>
                <span className="font-semibold text-amber-400">{formatCurrency(product.revenue)}</span>
              </div>
            )) : <p className="text-slate-400">No product data available.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-xl font-semibold text-white">Low Selling Products</h2>
          <div className="space-y-3">
            {analytics.lowProducts.length ? analytics.lowProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3">
                <div>
                  <p className="font-medium text-white">#{index + 1} {product.name}</p>
                  <p className="text-xs text-slate-400">{product.units} units</p>
                </div>
                <span className="font-semibold text-red-400">{formatCurrency(product.revenue)}</span>
              </div>
            )) : <p className="text-slate-400">No low-product data available.</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white"><Clock3 size={18} /> Peak Hours</h2>
          <div className="space-y-3">
            {analytics.peakHours.length ? analytics.peakHours.map((hour) => (
              <div key={hour.hour} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3">
                <span className="text-slate-300">{hour.hour}</span>
                <span className="font-semibold text-emerald-300">{hour.orders} orders</span>
              </div>
            )) : <p className="text-slate-400">No peak-hour data available.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white"><TrendingDown size={18} /> Slow Hours</h2>
          <div className="space-y-3">
            {analytics.slowHours.length ? analytics.slowHours.map((hour) => (
              <div key={hour.hour} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3">
                <span className="text-slate-300">{hour.hour}</span>
                <span className="font-semibold text-red-300">{hour.orders} orders</span>
              </div>
            )) : <p className="text-slate-400">No slow-hour data available.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white"><Users size={18} /> Most Active Tables</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {analytics.mostActiveTables.length ? analytics.mostActiveTables.map((table) => (
            <div key={table.table} className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-400">Table {table.table}</p>
              <p className="mt-2 text-2xl font-bold text-white">{table.orders}</p>
              <p className="text-sm text-amber-400">{formatCurrency(table.revenue)}</p>
            </div>
          )) : <p className="text-slate-400">No table activity data available.</p>}
        </div>
      </div>
    </div>
  );
}

