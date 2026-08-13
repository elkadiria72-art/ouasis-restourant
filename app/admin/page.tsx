'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign, Armchair, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import TopSellingItems from '@/components/TopSellingItems';
import RecentOrders from '@/components/RecentOrders';
import SalesChart from '@/components/SalesChart';
import { ar, formatNumberAr } from '@/lib/ar';
import { fetchDashboardData, type DashboardData } from '@/lib/dashboard-actions';

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchDashboardData();
        setData(result);
      } catch (err) {
        setError((err as Error).message || 'فشل تحميل بيانات لوحة التحكم');
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center text-slate-400">
        {ar.loading}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-300">
        <AlertCircle size={20} />
        <p>{error || 'تعذر تحميل البيانات'}</p>
      </div>
    );
  }

  const { metrics } = data;
  const occupancyPct = metrics.totalTables
    ? Math.round((metrics.activeTables / metrics.totalTables) * 100)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{ar.dashboard.title}</h1>
        <p className="mt-1 text-sm text-slate-400 sm:text-base">{ar.dashboard.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-5">
        <MetricCard
          title={ar.dashboard.todayOrders}
          value={formatNumberAr(metrics.todayOrders)}
          icon={<ShoppingCart size={24} />}
          subtitle={ar.dashboard.vsYesterday}
          trend={{ value: metrics.ordersTrend, isPositive: metrics.ordersTrend >= 0 }}
          color="blue"
        />
        <MetricCard
          title={ar.dashboard.todayRevenue}
          value={formatNumberAr(metrics.todayRevenue)}
          icon={<DollarSign size={24} />}
          subtitle={ar.dh}
          trend={{ value: metrics.revenueTrend, isPositive: metrics.revenueTrend >= 0 }}
          color="green"
        />
        <MetricCard
          title={ar.dashboard.activeTables}
          value={`${metrics.activeTables}/${metrics.totalTables}`}
          icon={<Armchair size={24} />}
          subtitle={`${occupancyPct}% ${ar.dashboard.occupied}`}
          color="purple"
        />
        <MetricCard
          title={ar.dashboard.preparingOrders}
          value={formatNumberAr(metrics.preparingOrders)}
          icon={<Clock size={24} />}
          subtitle={ar.dashboard.inKitchen}
          color="amber"
        />
        <MetricCard
          title={ar.dashboard.avgOrderValue}
          value={formatNumberAr(metrics.avgOrderValue)}
          icon={<TrendingUp size={24} />}
          subtitle={ar.dh}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart chartData={data.chartData} />
        </div>
        <div>
          <TopSellingItems items={data.topProducts} />
        </div>
      </div>

      <RecentOrders orders={data.recentOrders} />
    </div>
  );
}
