'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock3, Star, Users } from 'lucide-react';
import { fetchAnalyticsData, type AnalyticsSummary } from '@/lib/analytics-actions';
import { ar, formatNumberAr } from '@/lib/ar';

const statCardClasses = 'rounded-xl border border-slate-700 bg-slate-800 p-5 text-right';

function formatCurrency(value: number) {
  return `${formatNumberAr(value)} ${ar.dh}`;
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
        setError((err as Error).message || 'فشل تحميل التحليلات');
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
          {ar.loading}
        </div>
      </div>
    );
  }

  if (!analytics || error) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-300">
          {error || 'تعذّر تحميل التحليلات.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-right">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">نظرة عامة على التحليلات</h1>
        <p className="mt-1 text-sm text-slate-400">
          رؤى الأداء في المبيعات وطلب المنتجات ونشاط الطاولات.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={statCardClasses}>
          <div className="mb-3 flex items-center justify-between text-slate-300">
            <DollarSign className="text-amber-500" size={18} />
            <span className="text-sm">الإيرادات</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</p>
          <p className="mt-2 text-sm text-emerald-400">
            {percentChange(analytics.salesByPeriod.month.revenue, analytics.salesByPeriod.month.previousRevenue).toFixed(1)}% مقارنة بالشهر السابق
          </p>
        </div>

        <div className={statCardClasses}>
          <div className="mb-3 flex items-center justify-between text-slate-300">
            <ShoppingCart className="text-blue-400" size={18} />
            <span className="text-sm">الطلبات</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatNumberAr(analytics.totalOrders)}</p>
          <p className="mt-2 text-sm text-emerald-400">
            {percentChange(analytics.salesByPeriod.week.orders, analytics.salesByPeriod.week.previousOrders).toFixed(1)}% مقارنة بالأسبوع السابق
          </p>
        </div>

        <div className={statCardClasses}>
          <div className="mb-3 flex items-center justify-between text-slate-300">
            <TrendingUp className="text-green-400" size={18} />
            <span className="text-sm">المكتملة</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatNumberAr(analytics.completedOrders)}</p>
          <p className="mt-2 text-sm text-slate-400">أداء التنفيذ الحالي</p>
        </div>

        <div className={statCardClasses}>
          <div className="mb-3 flex items-center justify-between text-slate-300">
            <Star className="text-purple-400" size={18} />
            <span className="text-sm">متوسط القيمة</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(analytics.averageOrderValue)}</p>
          <p className="mt-2 text-sm text-amber-400">متوسط قيمة الطلب</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-right">
          <h2 className="mb-4 text-xl font-semibold text-white">تفصيل المبيعات</h2>
          <div className="space-y-4">
            {[
              { label: ar.periods.today, value: analytics.salesByPeriod.today },
              { label: ar.periods.week, value: analytics.salesByPeriod.week },
              { label: ar.periods.month, value: analytics.salesByPeriod.month },
            ].map((period) => (
              <div key={period.label} className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    {formatNumberAr(period.value.orders)} {ar.dashboard.ordersCount}
                  </span>
                  <p className="font-medium text-white">{period.label}</p>
                </div>
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(period.value.revenue)}</p>
                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-slate-400">
                  <span className="text-emerald-400">
                    {percentChange(period.value.revenue, period.value.previousRevenue).toFixed(1)}%
                  </span>
                  <span>{formatCurrency(period.value.previousRevenue)}</span>
                  <span>السابق:</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-right">
          <h2 className="mb-4 text-xl font-semibold text-white">حالة الطلبات</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4">
              <span className="text-lg font-semibold text-green-300">{formatNumberAr(analytics.completedOrders)}</span>
              <span className="text-slate-300">مكتملة</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4">
              <span className="text-lg font-semibold text-red-300">{formatNumberAr(analytics.cancelledOrders)}</span>
              <span className="text-slate-300">{ar.orderStatus.cancelled}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4">
              <span className="text-lg font-semibold text-amber-300">{formatCurrency(analytics.averageOrderValue)}</span>
              <span className="text-slate-300">متوسط القيمة</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4">
              <span className="text-lg font-semibold text-white">{formatCurrency(analytics.totalRevenue)}</span>
              <span className="text-slate-300">صافي الإيرادات</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-right">
          <h2 className="mb-4 text-xl font-semibold text-white">{ar.dashboard.topSelling}</h2>
          <div className="space-y-3">
            {analytics.topProducts.length ? (
              analytics.topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3"
                >
                  <span className="font-semibold text-amber-400">{formatCurrency(product.revenue)}</span>
                  <div>
                    <p className="font-medium text-white">
                      #{index + 1} {product.name}
                    </p>
                    <p className="text-xs text-slate-400">{formatNumberAr(product.units)} وحدة</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400">لا توجد بيانات منتجات.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-right">
          <h2 className="mb-4 text-xl font-semibold text-white">الأقل مبيعاً</h2>
          <div className="space-y-3">
            {analytics.lowProducts.length ? (
              analytics.lowProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3"
                >
                  <span className="font-semibold text-red-400">{formatCurrency(product.revenue)}</span>
                  <div>
                    <p className="font-medium text-white">
                      #{index + 1} {product.name}
                    </p>
                    <p className="text-xs text-slate-400">{formatNumberAr(product.units)} وحدة</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400">لا توجد بيانات للمنتجات الأقل مبيعاً.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-right">
          <h2 className="mb-4 flex items-center justify-end gap-2 text-xl font-semibold text-white">
            <Clock3 size={18} /> ساعات الذروة
          </h2>
          <div className="space-y-3">
            {analytics.peakHours.length ? (
              analytics.peakHours.map((hour) => (
                <div
                  key={hour.hour}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3"
                >
                  <span className="font-semibold text-emerald-300">
                    {formatNumberAr(hour.orders)} {ar.dashboard.ordersCount}
                  </span>
                  <span className="text-slate-300">{hour.hour}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">لا توجد بيانات لساعات الذروة.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-right">
          <h2 className="mb-4 flex items-center justify-end gap-2 text-xl font-semibold text-white">
            <TrendingDown size={18} /> ساعات الهدوء
          </h2>
          <div className="space-y-3">
            {analytics.slowHours.length ? (
              analytics.slowHours.map((hour) => (
                <div
                  key={hour.hour}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3"
                >
                  <span className="font-semibold text-red-300">
                    {formatNumberAr(hour.orders)} {ar.dashboard.ordersCount}
                  </span>
                  <span className="text-slate-300">{hour.hour}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">لا توجد بيانات لساعات الهدوء.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-right">
        <h2 className="mb-4 flex items-center justify-end gap-2 text-xl font-semibold text-white">
          <Users size={18} /> الطاولات الأكثر نشاطاً
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {analytics.mostActiveTables.length ? (
            analytics.mostActiveTables.map((table) => (
              <div
                key={table.table}
                className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-center"
              >
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  طاولة {table.table}
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{formatNumberAr(table.orders)}</p>
                <p className="text-sm text-amber-400">{formatCurrency(table.revenue)}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-400">لا توجد بيانات لنشاط الطاولات.</p>
          )}
        </div>
      </div>
    </div>
  );
}
