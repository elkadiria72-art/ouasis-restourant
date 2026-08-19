'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Armchair, CheckCircle2, Clock3, Coffee, Crown, DollarSign, PackageCheck,
  RefreshCw, ShoppingBag, Sparkles, TableProperties, TrendingUp, UtensilsCrossed,
} from 'lucide-react';
import { fetchDashboardData, type DashboardData } from '@/lib/dashboard-actions';
import { fetchOrders } from '@/lib/orders-actions';
import { fetchTables } from '@/lib/tables-actions';
import { fetchProducts } from '@/lib/menu-actions';
import { ar, formatNumberAr, formatTimeAr } from '@/lib/ar';
import { isOnline, loadCachedDataset } from '@/lib/offline-cache';
import { useAdminOffline } from '@/components/AdminOfflineProvider';

type TableStatus = 'empty' | 'occupied' | 'needs_attention';
type Table = { id: number; table_number: number; status: TableStatus };
type OrderLine = { name?: string; category?: string; quantity?: number; price?: number; total?: number };
type Order = { id: number; status: string; items?: unknown };
type MenuProduct = { name: string; category: string | null };
type DashboardCache = { dashboard: DashboardData; tables: Table[]; orders: Order[]; menuProducts: MenuProduct[] };

const orderStatus: Record<string, { label: string; style: string }> = {
  new: { label: ar.orderStatus.new, style: 'bg-sky-50 text-sky-700 ring-sky-100' },
  preparing: { label: ar.orderStatus.preparing, style: 'bg-amber-50 text-amber-700 ring-amber-100' },
  ready: { label: ar.orderStatus.ready, style: 'bg-violet-50 text-violet-700 ring-violet-100' },
  served: { label: ar.orderStatus.served, style: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  cancelled: { label: ar.orderStatus.cancelled, style: 'bg-rose-50 text-rose-700 ring-rose-100' },
};

const tableStatus: Record<TableStatus, { label: string; style: string; dot: string }> = {
  empty: { label: ar.tableStatus.empty, style: 'border-emerald-100 bg-emerald-50 text-emerald-800', dot: 'bg-emerald-500' },
  occupied: { label: ar.tableStatus.occupied, style: 'border-orange-100 bg-orange-50 text-orange-800', dot: 'bg-orange-500' },
  needs_attention: { label: ar.tableStatus.needs_attention, style: 'border-rose-100 bg-rose-50 text-rose-800', dot: 'bg-rose-500' },
};

function parseOrderItems(value: unknown): OrderLine[] {
  if (Array.isArray(value)) return value as OrderLine[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed as OrderLine[];
      return parsed && typeof parsed === 'object' ? [parsed as OrderLine] : [];
    } catch {
      return [];
    }
  }
  return value && typeof value === 'object' ? [value as OrderLine] : [];
}

function money(value: number) {
  return formatNumberAr(Number.isFinite(value) ? value : 0) + ' ' + ar.dh;
}

function StatCard({ title, value, note, icon, tone }: {
  title: string; value: string; note: string; icon: ReactNode; tone: string;
}) {
  return (
    <article className="rounded-3xl border border-[#eee7d9] bg-white p-4 shadow-[0_10px_28px_rgba(90,66,23,0.055)] transition hover:-translate-y-0.5 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={'flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ' + tone}>{icon}</div>
        <span className="text-left text-xs font-medium text-[#8b8172]">{note}</span>
      </div>
      <p className="mt-5 text-sm font-medium text-[#766d60]">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#2d2922] sm:text-3xl">{value}</p>
    </article>
  );
}

export default function AdminDashboard() {
  const { online } = useAdminOffline();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuProducts, setMenuProducts] = useState<MenuProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      setError(null);
      const result = await loadCachedDataset<DashboardCache>(
        'dashboard:overview',
        async () => {
          const [dashboardData, tableData, orderData, productData] = await Promise.all([
            fetchDashboardData(),
            fetchTables(),
            fetchOrders({ dateRange: 'today' }),
            fetchProducts(),
          ]);
          return {
            dashboard: dashboardData,
            tables: (tableData || []) as Table[],
            orders: (orderData || []) as Order[],
            menuProducts: (productData || []) as MenuProduct[],
          };
        },
        (cached) => {
          setDashboard(cached.data.dashboard);
          setTables(cached.data.tables);
          setOrders(cached.data.orders);
          setMenuProducts(cached.data.menuProducts);
          setUpdatedAt(new Date(cached.updatedAt));
          setLoading(false);
        }
      );
      setDashboard(result.data.dashboard);
      setTables(result.data.tables);
      setOrders(result.data.orders);
      setMenuProducts(result.data.menuProducts);
      setUpdatedAt(new Date(result.updatedAt));
    } catch (requestError) {
      setError((requestError as Error).message || 'تعذر تحميل بيانات لوحة التحكم.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      if (isOnline()) void load();
    }, 60000);
    const handleReconnect = () => void load(true);
    window.addEventListener('admin-connection-restored', handleReconnect);
    return () => {
      clearInterval(interval);
      window.removeEventListener('admin-connection-restored', handleReconnect);
    };
  }, [load]);

  const counts = useMemo(() => ({
    empty: tables.filter((table) => table.status === 'empty').length,
    occupied: tables.filter((table) => table.status === 'occupied').length,
    attention: tables.filter((table) => table.status === 'needs_attention').length,
    active: orders.filter((order) => ['new', 'preparing', 'ready'].includes(order.status)).length,
    completed: orders.filter((order) => order.status === 'served').length,
    cancelled: orders.filter((order) => order.status === 'cancelled').length,
  }), [tables, orders]);

  const rankings = useMemo(() => {
    const categoryByProduct = new Map(menuProducts.map((product) => [
      product.name.trim(), product.category?.trim() || 'غير مصنف',
    ]));
    const products = new Map<string, { units: number; revenue: number }>();
    const categories = new Map<string, { units: number; revenue: number }>();

    orders.filter((order) => order.status !== 'cancelled').forEach((order) => {
      parseOrderItems(order.items).forEach((item) => {
        const name = String(item.name || 'منتج غير مسمى').trim();
        const quantity = Number(item.quantity);
        const units = Number.isFinite(quantity) ? Math.max(quantity, 0) : 1;
        const total = Number(item.total);
        const price = Number(item.price);
        const revenue = Number.isFinite(total) ? total : Number.isFinite(price) ? price * units : 0;
        const category = String(item.category || categoryByProduct.get(name) || 'غير مصنف');
        const product = products.get(name) || { units: 0, revenue: 0 };
        const categoryStats = categories.get(category) || { units: 0, revenue: 0 };
        product.units += units; product.revenue += revenue;
        categoryStats.units += units; categoryStats.revenue += revenue;
        products.set(name, product); categories.set(category, categoryStats);
      });
    });

    return {
      products: Array.from(products, ([name, values]) => ({ name, ...values }))
        .sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, 5),
      categories: Array.from(categories, ([name, values]) => ({ name, ...values }))
        .sort((a, b) => b.revenue - a.revenue || b.units - a.units).slice(0, 5),
    };
  }, [menuProducts, orders]);

  if (loading) {
    return (
      <div className="-m-4 flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#fcfaf6] p-6 sm:-m-6 lg:-m-8">
        <div className="rounded-3xl border border-[#eee7d9] bg-white px-8 py-10 text-center shadow-[0_14px_35px_rgba(90,66,23,0.07)]">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#ead69e] border-t-[#c9a227]" />
          <p className="font-medium text-[#766d60]">جاري تجهيز لوحة المطعم...</p>
        </div>
      </div>
    );
  }

  if (!dashboard || error) {
    return (
      <div className="-m-4 min-h-[calc(100vh-3.5rem)] bg-[#fcfaf6] p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
        <div className="mx-auto max-w-lg rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-[0_14px_35px_rgba(90,66,23,0.07)]">
          <Clock3 className="mx-auto text-rose-600" size={28} />
          <h1 className="mt-4 text-xl font-bold text-[#2d2922]">تعذر تحميل لوحة التحكم</h1>
          <p className="mt-2 text-sm leading-6 text-[#766d60]">{error || 'تعذر الاتصال ببيانات المطعم.'}</p>
          <button type="button" onClick={() => void load(true)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#c9a227] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#ae881b]">
            <RefreshCw size={17} /> إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const sales = dashboard.chartData.week;
  const maxSales = Math.max(...sales.map((item) => item.sales), 1);
  const topProducts = rankings.products.length
    ? rankings.products
    : dashboard.topProducts.map((product) => ({ name: product.name, units: product.sales, revenue: product.revenue }));
  const maxCategoryRevenue = Math.max(...rankings.categories.map((category) => category.revenue), 1);

  return (
    <div className="-m-4 min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-[#fcfaf6] p-4 text-right text-[#2d2922] sm:-m-6 sm:p-6 lg:-m-8 lg:min-h-[calc(100vh-4rem)] lg:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-7">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#eee3cd] bg-white px-5 py-6 shadow-[0_14px_38px_rgba(90,66,23,0.06)] sm:px-7 sm:py-7">
          <div className="pointer-events-none absolute -left-12 -top-20 h-52 w-52 rounded-full bg-[#fff0c4] blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#c9a227] text-white shadow-[0_8px_20px_rgba(201,162,39,0.28)] sm:h-16 sm:w-16"><UtensilsCrossed size={27} /></div>
              <div>
                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#b48624]">قـا أحمد <Sparkles size={14} /></p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">لوحة إدارة المطعم</h1>
                <p className="mt-1 text-sm text-[#817768]">إحصاءات حية وواضحة لأداء المطعم اليوم.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold ${online ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                <span className="relative flex h-2.5 w-2.5"><span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${online ? 'animate-ping bg-emerald-400' : 'bg-amber-400'}`} /><span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} /></span>
                {online ? 'البيانات متصلة' : 'غير متصل — عرض آخر البيانات المحفوظة'} {updatedAt && <span className="font-normal opacity-80">· {formatTimeAr(updatedAt.toISOString())}</span>}
              </div>
              <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#eadcbf] bg-[#fffaf0] px-4 text-sm font-bold text-[#89651c] hover:bg-[#fff4d9] disabled:opacity-60">
                <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} /> تحديث البيانات
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard title="إيرادات اليوم" value={money(dashboard.metrics.todayRevenue)} note="إجمالي اليوم" icon={<DollarSign size={22} />} tone="bg-[#fff6dc] text-[#b9861f] ring-[#f1dc9d]" />
          <StatCard title="طلبات اليوم" value={formatNumberAr(dashboard.metrics.todayOrders)} note="مسجلة اليوم" icon={<ShoppingBag size={22} />} tone="bg-sky-50 text-sky-600 ring-sky-100" />
          <StatCard title="متوسط قيمة الطلب" value={money(dashboard.metrics.avgOrderValue || 0)} note="طلبات اليوم" icon={<DollarSign size={22} />} tone="bg-[#fffaf0] text-[#9e7727] ring-[#f0e2c5]" />
          <StatCard title="طلبات نشطة" value={formatNumberAr(counts.active)} note="جديد · تحضير · جاهز" icon={<Clock3 size={22} />} tone="bg-orange-50 text-orange-600 ring-orange-100" />
          <StatCard title="طلبات مكتملة" value={formatNumberAr(counts.completed)} note="تم التقديم اليوم" icon={<PackageCheck size={22} />} tone="bg-emerald-50 text-emerald-600 ring-emerald-100" />
          <StatCard title="طلبات ملغاة" value={formatNumberAr(counts.cancelled)} note="طلبات اليوم" icon={<Clock3 size={22} />} tone="bg-rose-50 text-rose-600 ring-rose-100" />
          <StatCard title="طاولات مشغولة" value={formatNumberAr(counts.occupied)} note={'من ' + formatNumberAr(tables.length) + ' طاولة'} icon={<Armchair size={22} />} tone="bg-orange-50 text-orange-600 ring-orange-100" />
          <StatCard title="طاولات متاحة" value={formatNumberAr(counts.empty)} note="جاهزة للضيوف" icon={<TableProperties size={22} />} tone="bg-teal-50 text-teal-600 ring-teal-100" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
          <article className="rounded-3xl border border-[#eee7d9] bg-white p-5 shadow-[0_10px_30px_rgba(90,66,23,0.05)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="flex items-center gap-2 text-sm font-bold text-[#b48624]"><TrendingUp size={18} /> الإيرادات حسب اليوم</p><h2 className="mt-2 text-xl font-bold">أداء الأيام السبعة الأخيرة</h2><p className="mt-1 text-sm text-[#817768]">إجمالي المبيعات الفعلية المسجلة لكل يوم.</p></div>
              <span className="rounded-xl bg-[#fff8e7] px-3 py-2 text-sm font-bold text-[#a67c1e]">هذا الأسبوع</span>
            </div>
            {sales.some((item) => item.sales > 0) ? (
              <div className="mt-7 flex h-56 items-end gap-2 border-b border-[#eee7d9] pb-1 sm:gap-3">
                {sales.map((item) => {
                  const height = Math.max((item.sales / maxSales) * 100, item.sales ? 8 : 3);
                  return <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-bold text-[#766d60] sm:text-xs">{item.sales ? money(item.sales) : '—'}</span><div className="flex h-36 w-full max-w-12 items-end rounded-t-2xl bg-[#fff5dd] sm:max-w-14"><div className="w-full rounded-t-2xl bg-gradient-to-t from-[#c9a227] to-[#edce73]" style={{ height: String(height) + '%' }} /></div><span className="truncate text-[10px] text-[#817768] sm:text-xs">{item.label}</span></div>;
                })}
              </div>
            ) : <div className="mt-7 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#eadcbf] bg-[#fffdf8] text-center"><TrendingUp size={25} className="text-[#d4b14d]" /><p className="mt-3 font-semibold text-[#61594e]">لا توجد مبيعات مسجلة هذا الأسبوع</p><p className="mt-1 text-sm text-[#918779]">سيظهر الرسم تلقائياً عند وصول الطلبات.</p></div>}
          </article>

          <article className="rounded-3xl border border-[#eee7d9] bg-[#fffdf9] p-5 shadow-[0_10px_30px_rgba(90,66,23,0.05)] sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#b48624]">الأصناف الأكثر طلباً</p><h2 className="mt-1 text-xl font-bold">محبوبات الضيوف اليوم</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1ca] text-[#b48624]"><Crown size={19} /></div></div>
            {topProducts.length ? <ol className="mt-5 space-y-3">{topProducts.map((product, index) => <li key={product.name + '-' + index} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-[#f0eadf]"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fff4d9] text-sm font-bold text-[#aa8023]">{formatNumberAr(index + 1)}</span><div className="min-w-0 flex-1"><p className="truncate font-bold text-[#3a342b]">{product.name}</p><p className="mt-0.5 text-xs text-[#8b8172]">{formatNumberAr(product.units)} طلب</p></div><p className="whitespace-nowrap text-sm font-bold text-[#88651b]">{money(product.revenue)}</p></li>)}</ol> : <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#eadcbf] bg-white text-center"><Coffee size={24} className="text-[#d4b14d]" /><p className="mt-3 font-semibold text-[#61594e]">لا توجد أصناف مطلوبة اليوم</p></div>}
          </article>
        </section>

        <section className="rounded-3xl border border-[#eee7d9] bg-white p-5 shadow-[0_10px_30px_rgba(90,66,23,0.05)] sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#b48624]">أفضل التصنيفات مبيعاً</p><h2 className="mt-1 text-xl font-bold">مساهمة التصنيفات في الإيرادات</h2></div><Crown size={20} className="text-[#c9a227]" /></div>
          {rankings.categories.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rankings.categories.map((category) => <div key={category.name} className="rounded-2xl bg-[#fffdf9] p-4 ring-1 ring-[#f0eadf]"><div className="flex items-center justify-between gap-3"><p className="truncate font-bold text-[#3a342b]">{category.name}</p><p className="shrink-0 text-sm font-bold text-[#88651b]">{money(category.revenue)}</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f4ecdc]"><div className="h-full rounded-full bg-gradient-to-l from-[#c9a227] to-[#ecd174]" style={{ width: String(Math.max((category.revenue / maxCategoryRevenue) * 100, 4)) + '%' }} /></div><p className="mt-2 text-xs text-[#8b8172]">{formatNumberAr(category.units)} صنف مطلوب</p></div>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-[#eadcbf] bg-[#fffdf8] py-8 text-center"><p className="font-semibold text-[#61594e]">لا توجد بيانات تصنيفات اليوم</p><p className="mt-1 text-sm text-[#918779]">ستظهر عند تسجيل عناصر الطلبات وتصنيفاتها.</p></div>}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.95fr)]">
          <article className="overflow-hidden rounded-3xl border border-[#eee7d9] bg-white shadow-[0_10px_30px_rgba(90,66,23,0.05)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#f0eadf] px-5 py-5 sm:px-6"><div><p className="text-sm font-bold text-[#b48624]">آخر الطلبات</p><h2 className="mt-1 text-xl font-bold">طلبات وصلت حديثاً</h2></div><span className="rounded-xl bg-[#fff8e7] px-3 py-2 text-sm font-bold text-[#a67c1e]">{formatNumberAr(dashboard.recentOrders.length)} طلب</span></div>
            {dashboard.recentOrders.length ? <div className="divide-y divide-[#f0eadf]">{dashboard.recentOrders.map((order) => {
              const style = orderStatus[order.status] || orderStatus.new;
              return <div key={order.id} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 px-5 py-4 sm:grid-cols-[1.15fr_0.8fr_0.8fr_auto_auto] sm:items-center sm:gap-3 sm:px-6"><div><p className="font-bold text-[#352f27]">طلب #{formatNumberAr(order.id)}</p><p className="mt-1 text-xs text-[#8b8172] sm:hidden">طاولة {formatNumberAr(order.table_number)} · {formatTimeAr(order.created_at)}</p></div><p className="hidden text-sm font-medium text-[#655d52] sm:block">طاولة {formatNumberAr(order.table_number)}</p><p className="hidden text-sm font-bold text-[#89651c] sm:block">{money(order.total_amount)}</p><span className={'justify-self-end rounded-full px-2.5 py-1 text-xs font-bold ring-1 ' + style.style}>{style.label}</span><p className="col-span-2 text-left text-xs text-[#8b8172] sm:col-span-1">{formatTimeAr(order.created_at)}</p><p className="text-sm font-bold text-[#89651c] sm:hidden">{money(order.total_amount)}</p></div>;
            })}</div> : <div className="p-10 text-center"><ShoppingBag className="mx-auto text-[#d4b14d]" size={26} /><p className="mt-3 font-semibold text-[#61594e]">لا توجد طلبات حالياً</p></div>}
          </article>

          <article className="rounded-3xl border border-[#eee7d9] bg-white p-5 shadow-[0_10px_30px_rgba(90,66,23,0.05)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold text-[#b48624]">حالة الطاولات</p><h2 className="mt-1 text-xl font-bold">خريطة الصالة</h2></div><div className="flex flex-wrap gap-2 text-xs font-semibold">{(['empty', 'occupied', 'needs_attention'] as const).map((status) => <span key={status} className="inline-flex items-center gap-1.5 rounded-full bg-[#fbfaf7] px-2.5 py-1.5 text-[#655d52] ring-1 ring-[#f0eadf]"><span className={'h-2 w-2 rounded-full ' + tableStatus[status].dot} />{tableStatus[status].label}</span>)}</div></div>
            {tables.length ? <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(58px,1fr))]">{tables.map((table) => { const style = tableStatus[table.status] || tableStatus.empty; return <div key={table.id} title={'طاولة ' + table.table_number + ': ' + style.label} className={'flex min-h-14 flex-col items-center justify-center rounded-2xl border text-sm font-extrabold shadow-sm ' + style.style}><span>{formatNumberAr(table.table_number)}</span><span className={'mt-1 h-1.5 w-1.5 rounded-full ' + style.dot} /></div>; })}</div> : <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#eadcbf] bg-[#fffdf8] text-center"><Armchair size={25} className="text-[#d4b14d]" /><p className="mt-3 font-semibold text-[#61594e]">لا توجد طاولات للعرض</p></div>}
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#fbfaf7] p-3 text-center"><div><p className="text-lg font-bold text-emerald-700">{formatNumberAr(counts.empty)}</p><p className="mt-0.5 text-[11px] text-[#817768]">متاحة</p></div><div className="border-x border-[#eee7d9]"><p className="text-lg font-bold text-orange-700">{formatNumberAr(counts.occupied)}</p><p className="mt-0.5 text-[11px] text-[#817768]">مشغولة</p></div><div><p className="text-lg font-bold text-rose-700">{formatNumberAr(counts.attention)}</p><p className="mt-0.5 text-[11px] text-[#817768]">تحتاج انتباهاً</p></div></div>
          </article>
        </section>

        <p className="flex items-center justify-center gap-1 text-xs text-[#9b9182]"><CheckCircle2 size={14} className="text-emerald-500" />تُحدّث البيانات تلقائياً كل دقيقة</p>
      </div>
    </div>
  );
}
