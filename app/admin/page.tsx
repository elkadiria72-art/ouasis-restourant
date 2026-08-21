'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Armchair, Ban, CheckCircle2, Clock3, Coffee, Crown, DollarSign, PackageCheck,
  RefreshCw, Receipt, ShoppingBag, Sparkles, TableProperties, TrendingUp, UtensilsCrossed,
} from 'lucide-react';
import { fetchDashboardData, type DashboardData } from '@/lib/dashboard-actions';
import { fetchOrders } from '@/lib/orders-actions';
import { fetchTables } from '@/lib/tables-actions';
import { fetchProducts } from '@/lib/menu-actions';
import { ar, formatNumberAr, formatTimeAr } from '@/lib/ar';
import { isOnline, loadCachedDataset } from '@/lib/offline-cache';
import { useAdminOffline } from '@/components/AdminOfflineProvider';
import { useAdminRealtime } from '@/components/useAdminRealtime';

type TableStatus = 'empty' | 'occupied' | 'needs_attention';
type Table = { id: number; table_number: number; status: TableStatus };
type OrderLine = { name?: string; category?: string; quantity?: number; price?: number; total?: number };
type Order = { id: number; status: string; items?: unknown };
type MenuProduct = { name: string; category: string | null };
type DashboardCache = { dashboard: DashboardData; tables: Table[]; orders: Order[]; menuProducts: MenuProduct[] };

const orderStatus: Record<string, { label: string; badge: string; dot: string }> = {
  new: { label: ar.orderStatus.new, badge: 'bg-[#faf0e0] text-[#8a5a2b] ring-[#f0dfc4]', dot: 'bg-[#b07d3f]' },
  preparing: { label: ar.orderStatus.preparing, badge: 'bg-[#fdf3e3] text-[#96690f] ring-[#f2e4c5]', dot: 'bg-[#d9a233]' },
  ready: { label: ar.orderStatus.ready, badge: 'bg-[#eef3ec] text-[#4f6d4d] ring-[#dde8da]', dot: 'bg-[#6d916a]' },
  served: { label: ar.orderStatus.served, badge: 'bg-[#f3efe9] text-[#6d5c4e] ring-[#e7ded1]', dot: 'bg-[#9b8b7c]' },
  cancelled: { label: ar.orderStatus.cancelled, badge: 'bg-[#fbecec] text-[#a44e60] ring-[#f2dadc]', dot: 'bg-[#c05c5c]' },
};

const tableStatus: Record<TableStatus, { label: string; style: string; dot: string }> = {
  empty: { label: ar.tableStatus.empty, style: 'border-[#d6e5d2] bg-[#f2f8f0] text-[#4f6d4d]', dot: 'bg-[#6d916a]' },
  occupied: { label: ar.tableStatus.occupied, style: 'border-[#f0dfc4] bg-[#faf0e0] text-[#8a5a2b]', dot: 'bg-[#b07d3f]' },
  needs_attention: { label: ar.tableStatus.needs_attention, style: 'border-[#f2dadc] bg-[#fbecec] text-[#a44e60]', dot: 'bg-[#c05c5c]' },
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

const cardClass = 'rounded-3xl border border-[#eee2d5] bg-white shadow-[0_10px_30px_rgba(93,64,41,0.05)]';

function SteamCup() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 text-[#d9c4ae]" fill="none" aria-hidden="true">
      <path d="M18 10c-3 4 3 6 0 10M30 8c-3 4 3 6 0 10M42 10c-3 4 3 6 0 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 30h34l-3 18a6 6 0 0 1-6 5H23a6 6 0 0 1-6-5l-3-18Z" fill="#f6e8d5" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 33h5a5 5 0 0 1 0 10h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function StatCard({ title, value, note, icon, tone }: {
  title: string; value: string; note: string; icon: ReactNode; tone: string;
}) {
  return (
    <article className={`${cardClass} p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(93,64,41,0.09)] sm:p-5`}>
      <div className="flex items-center justify-between gap-3">
        <div className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ' + tone}>{icon}</div>
        <span className="text-left text-[11px] font-medium leading-5 text-[#a3937f]">{note}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-[#8d7b6e]">{title}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#3b2c22] sm:text-[1.7rem]">{value}</p>
    </article>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const style = orderStatus[status] || orderStatus.new;
  return (
    <span className={'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ' + style.badge}>
      <span className={'h-1.5 w-1.5 rounded-full ' + style.dot} />
      {style.label}
    </span>
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
  const [todayLabel, setTodayLabel] = useState('');

  useEffect(() => {
    setTodayLabel(
      new Intl.DateTimeFormat('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
    );
  }, []);

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
    }, 120000);
    const handleReconnect = () => void load(true);
    window.addEventListener('admin-connection-restored', handleReconnect);
    return () => {
      clearInterval(interval);
      window.removeEventListener('admin-connection-restored', handleReconnect);
    };
  }, [load]);

  useAdminRealtime({
    onOrdersChange: () => void load(),
    onWaiterCallsChange: () => void load(),
    onMenuItemsChange: () => void load(),
    onCategoriesChange: () => void load(),
    onTablesChange: () => void load(),
  });

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
      <div className="-m-4 flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#f8f4ee] p-6 sm:-m-6 lg:-m-8">
        <div className="rounded-3xl border border-[#eee2d5] bg-white px-8 py-10 text-center shadow-[0_14px_35px_rgba(93,64,41,0.07)]">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#ead9c0] border-t-[#b07d3f]" />
          <p className="font-medium text-[#7d6c5e]">جاري تجهيز لوحة المطعم...</p>
        </div>
      </div>
    );
  }

  if (!dashboard || error) {
    return (
      <div className="-m-4 min-h-[calc(100vh-3.5rem)] bg-[#f8f4ee] p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
        <div className="mx-auto max-w-lg rounded-3xl border border-[#f2dadc] bg-white p-8 text-center shadow-[0_14px_35px_rgba(93,64,41,0.07)]">
          <Clock3 className="mx-auto text-[#c05c5c]" size={28} />
          <h1 className="mt-4 text-xl font-bold text-[#3b2c22]">تعذر تحميل لوحة التحكم</h1>
          <p className="mt-2 text-sm leading-6 text-[#8d7b6e]">{error || 'تعذر الاتصال ببيانات المطعم.'}</p>
          <button type="button" onClick={() => void load(true)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#b07d3f] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(160,106,53,0.25)] transition-colors hover:bg-[#996a33]">
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
  const maxProductRevenue = Math.max(...topProducts.map((product) => product.revenue), 1);
  const maxCategoryRevenue = Math.max(...rankings.categories.map((category) => category.revenue), 1);

  return (
    <div className="-m-4 min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-[#f8f4ee] p-4 text-right text-[#3b2c22] sm:-m-6 sm:p-6 lg:-m-8 lg:min-h-[calc(100vh-4rem)] lg:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-7">
        {/* Welcome / header */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#eee3cd] bg-white px-5 py-6 shadow-[0_14px_38px_rgba(93,64,41,0.06)] sm:px-7 sm:py-7">
          <svg viewBox="0 0 220 160" className="pointer-events-none absolute -left-10 -top-6 h-44 w-64 text-[#d9c4ae]" fill="none" aria-hidden="true">
            <path d="M40 110c-14-18 10-26-4-44M80 104c-14-18 10-26-4-44M120 110c-14-18 10-26-4-44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
            <ellipse cx="86" cy="140" rx="70" ry="18" fill="#f8ece0" opacity="0.8" />
            <ellipse cx="170" cy="150" rx="60" ry="14" fill="#fbeeea" opacity="0.7" />
          </svg>
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c98d4f] to-[#a06a35] text-white shadow-[0_8px_20px_rgba(160,106,53,0.28)] sm:h-16 sm:w-16"><UtensilsCrossed size={27} /></div>
              <div>
                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#b07d3f]">قـا أحمد <Sparkles size={14} /></p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">مرحباً بك في لوحة التحكم</h1>
                <p className="mt-1 text-sm text-[#8d7b6e]">إليك نظرة سريعة على أداء المطعم اليوم.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {todayLabel && (
                <span className="inline-flex items-center gap-2 rounded-2xl border border-[#eadbc8] bg-[#fdf9f3] px-3.5 py-2.5 text-sm font-semibold text-[#7d6c5e]">
                  {todayLabel}
                </span>
              )}
              <div className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold ${online ? 'border-[#dde8da] bg-[#f2f8f0] text-[#4f6d4d]' : 'border-[#f2e4c5] bg-[#fdf3e3] text-[#96690f]'}`}>
                <span className="relative flex h-2.5 w-2.5"><span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${online ? 'animate-ping bg-emerald-400' : 'bg-amber-400'}`} /><span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} /></span>
                {online ? 'البيانات متصلة' : 'غير متصل — عرض آخر البيانات'} {updatedAt && <span className="font-normal opacity-80">· {formatTimeAr(updatedAt.toISOString())}</span>}
              </div>
              <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#b07d3f] px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(160,106,53,0.22)] transition-colors hover:bg-[#996a33] disabled:opacity-60">
                <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} /> تحديث البيانات
              </button>
            </div>
          </div>
        </section>

        {/* KPI statistics */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          <StatCard title="إيرادات اليوم" value={money(dashboard.metrics.todayRevenue)} note="إجمالي اليوم" icon={<DollarSign size={22} />} tone="bg-[#faf0e0] text-[#a06a35] ring-[#f0dfc4]" />
          <StatCard title="طلبات اليوم" value={formatNumberAr(dashboard.metrics.todayOrders)} note="مسجلة اليوم" icon={<ShoppingBag size={22} />} tone="bg-[#fbecec] text-[#b5586a] ring-[#f2dadc]" />
          <StatCard title="متوسط قيمة الطلب" value={money(dashboard.metrics.avgOrderValue || 0)} note="طلبات اليوم" icon={<Receipt size={22} />} tone="bg-[#fdf3e3] text-[#b48324] ring-[#f2e4c5]" />
          <StatCard title="الطلبات النشطة" value={formatNumberAr(counts.active)} note="جديد · تحضير · جاهز" icon={<Clock3 size={22} />} tone="bg-[#f3efe9] text-[#7d6c5e] ring-[#e7ded1]" />
          <StatCard title="الطلبات المكتملة" value={formatNumberAr(counts.completed)} note="تم التقديم اليوم" icon={<PackageCheck size={22} />} tone="bg-[#eef3ec] text-[#5c7a5a] ring-[#dde8da]" />
          <StatCard title="الطلبات الملغاة" value={formatNumberAr(counts.cancelled)} note="طلبات اليوم" icon={<Ban size={22} />} tone="bg-[#f3efe9] text-[#8d7b6e] ring-[#e7ded1]" />
          <StatCard title="الطاولات المشغولة" value={formatNumberAr(counts.occupied)} note={'من ' + formatNumberAr(tables.length) + ' طاولة'} icon={<Armchair size={22} />} tone="bg-[#faf0e0] text-[#a06a35] ring-[#f0dfc4]" />
          <StatCard title="الطاولات المتاحة" value={formatNumberAr(counts.empty)} note="جاهزة للضيوف" icon={<TableProperties size={22} />} tone="bg-[#eef3ec] text-[#5c7a5a] ring-[#dde8da]" />
        </section>

        {/* Revenue + top products */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
          <article className={`${cardClass} p-5 sm:p-6`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="flex items-center gap-2 text-sm font-bold text-[#b07d3f]"><TrendingUp size={18} /> الإيرادات حسب اليوم</p><h2 className="mt-2 text-xl font-bold">أداء الأيام السبعة الأخيرة</h2><p className="mt-1 text-sm text-[#8d7b6e]">إجمالي المبيعات الفعلية المسجلة لكل يوم.</p></div>
              <span className="rounded-xl bg-[#faf0e0] px-3 py-2 text-sm font-bold text-[#8a5a2b]">هذا الأسبوع</span>
            </div>
            {sales.some((item) => item.sales > 0) ? (
              <div className="mt-7 flex h-56 items-end gap-2 border-b border-[#eee2d5] pb-1 sm:gap-3">
                {sales.map((item) => {
                  const height = Math.max((item.sales / maxSales) * 100, item.sales ? 8 : 3);
                  return <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-bold text-[#8d7b6e] sm:text-xs">{item.sales ? money(item.sales) : '—'}</span><div className="flex h-36 w-full max-w-12 items-end rounded-t-2xl bg-[#f6ecd9] sm:max-w-14"><div className="w-full rounded-t-2xl bg-gradient-to-t from-[#b07d3f] to-[#e0b273]" style={{ height: String(height) + '%' }} /></div><span className="truncate text-[10px] text-[#a3937f] sm:text-xs">{item.label}</span></div>;
                })}
              </div>
            ) : <div className="mt-7 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#eadbc8] bg-[#fdf9f3] text-center"><SteamCup /><p className="mt-3 font-semibold text-[#7d6c5e]">لا توجد مبيعات مسجلة هذا الأسبوع</p><p className="mt-1 text-sm text-[#a3937f]">سيظهر الرسم تلقائياً عند وصول الطلبات.</p></div>}
          </article>

          <article className={`${cardClass} bg-[#fdfbf7] p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#b07d3f]">الأصناف الأكثر طلباً</p><h2 className="mt-1 text-xl font-bold">محبوبات الضيوف اليوم</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf0e0] text-[#a06a35]"><Crown size={19} /></div></div>
            {topProducts.length ? <ol className="mt-5 space-y-3">{topProducts.map((product, index) => <li key={product.name + '-' + index} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-[#f0e6da]">
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${index === 0 ? 'bg-gradient-to-br from-[#c98d4f] to-[#a06a35] text-white' : 'bg-[#faf0e0] text-[#a06a35]'}`}>{formatNumberAr(index + 1)}</span>
                <div className="min-w-0 flex-1"><p className="truncate font-bold text-[#3b2c22]">{product.name}</p><p className="mt-0.5 text-xs text-[#a3937f]">{formatNumberAr(product.units)} طلب</p></div>
                <p className="whitespace-nowrap text-sm font-bold text-[#8a5a2b]">{money(product.revenue)}</p>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#f4ece1]"><div className="h-full rounded-full bg-gradient-to-l from-[#b07d3f] to-[#e0b273]" style={{ width: String(Math.max((product.revenue / maxProductRevenue) * 100, 6)) + '%' }} /></div>
            </li>)}</ol> : <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#eadbc8] bg-white text-center"><SteamCup /><p className="mt-3 font-semibold text-[#7d6c5e]">لا توجد أصناف مطلوبة اليوم</p></div>}
          </article>
        </section>

        {/* Top categories */}
        <section className={`${cardClass} p-5 sm:p-6`}>
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#b07d3f]">أفضل التصنيفات مبيعاً</p><h2 className="mt-1 text-xl font-bold">مساهمة التصنيفات في الإيرادات</h2></div><Crown size={20} className="text-[#b07d3f]" /></div>
          {rankings.categories.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rankings.categories.map((category) => <div key={category.name} className="rounded-2xl bg-[#fdf9f3] p-4 ring-1 ring-[#f0e6da]"><div className="flex items-center justify-between gap-3"><p className="truncate font-bold text-[#3b2c22]">{category.name}</p><p className="shrink-0 text-sm font-bold text-[#8a5a2b]">{money(category.revenue)}</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f0e4d2]"><div className="h-full rounded-full bg-gradient-to-l from-[#c98d4f] to-[#eccf9d]" style={{ width: String(Math.max((category.revenue / maxCategoryRevenue) * 100, 4)) + '%' }} /></div><p className="mt-2 text-xs text-[#a3937f]">{formatNumberAr(category.units)} صنف مطلوب</p></div>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-[#eadbc8] bg-[#fdf9f3] py-8 text-center"><p className="font-semibold text-[#7d6c5e]">لا توجد بيانات تصنيفات اليوم</p><p className="mt-1 text-sm text-[#a3937f]">ستظهر عند تسجيل عناصر الطلبات وتصنيفاتها.</p></div>}
        </section>

        {/* Recent orders + tables map */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.95fr)]">
          <article className={`overflow-hidden ${cardClass}`}>
            <div className="flex items-center justify-between gap-4 border-b border-[#f0e6da] px-5 py-5 sm:px-6"><div><p className="text-sm font-bold text-[#b07d3f]">آخر الطلبات</p><h2 className="mt-1 text-xl font-bold">طلبات وصلت حديثاً</h2></div><span className="rounded-xl bg-[#faf0e0] px-3 py-2 text-sm font-bold text-[#8a5a2b]">{formatNumberAr(dashboard.recentOrders.length)} طلب</span></div>
            {dashboard.recentOrders.length ? <div className="divide-y divide-[#f4ece1]">{dashboard.recentOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-[#fdf9f3] sm:px-6">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#3b2c22]">طلب #{formatNumberAr(order.id)} <span className="mr-1 font-medium text-[#8d7b6e]">· طاولة {formatNumberAr(order.table_number)}</span></p>
                  <p className="mt-1 text-xs text-[#a3937f]">{formatTimeAr(order.created_at)}</p>
                </div>
                <p className="text-sm font-extrabold text-[#8a5a2b]">{money(order.total_amount)}</p>
                <OrderStatusBadge status={order.status} />
              </div>
            ))}</div> : <div className="p-10 text-center"><ShoppingBag className="mx-auto text-[#d9c4ae]" size={26} /><p className="mt-3 font-semibold text-[#7d6c5e]">لا توجد طلبات حالياً</p></div>}
          </article>

          <article className={`${cardClass} p-5 sm:p-6`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold text-[#b07d3f]">حالة الطاولات</p><h2 className="mt-1 text-xl font-bold">خريطة الصالة</h2></div><div className="flex flex-wrap gap-2 text-xs font-semibold">{(['empty', 'occupied', 'needs_attention'] as const).map((status) => <span key={status} className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf9f3] px-2.5 py-1.5 text-[#655d52] ring-1 ring-[#f0e6da]"><span className={'h-2 w-2 rounded-full ' + tableStatus[status].dot} />{tableStatus[status].label}</span>)}</div></div>
            {tables.length ? <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-2">{tables.map((table) => { const style = tableStatus[table.status] || tableStatus.empty; return <div key={table.id} title={'طاولة ' + table.table_number + ': ' + style.label} className={'flex min-h-14 flex-col items-center justify-center rounded-2xl border text-sm font-extrabold shadow-sm ' + style.style}><span>{formatNumberAr(table.table_number)}</span><span className={'mt-1 h-1.5 w-1.5 rounded-full ' + style.dot} /></div>; })}</div> : <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#eadbc8] bg-[#fdf9f3] text-center"><Armchair size={25} className="text-[#d9c4ae]" /><p className="mt-3 font-semibold text-[#7d6c5e]">لا توجد طاولات للعرض</p></div>}
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#fdf9f3] p-3 text-center ring-1 ring-[#f0e6da]"><div><p className="text-lg font-bold text-[#4f6d4d]">{formatNumberAr(counts.empty)}</p><p className="mt-0.5 text-[11px] text-[#8d7b6e]">متاحة</p></div><div className="border-x border-[#eee2d5]"><p className="text-lg font-bold text-[#8a5a2b]">{formatNumberAr(counts.occupied)}</p><p className="mt-0.5 text-[11px] text-[#8d7b6e]">مشغولة</p></div><div><p className="text-lg font-bold text-[#a44e60]">{formatNumberAr(counts.attention)}</p><p className="mt-0.5 text-[11px] text-[#8d7b6e]">تحتاج انتباهاً</p></div></div>
          </article>
        </section>

        <p className="flex items-center justify-center gap-1 text-xs text-[#a3937f]"><CheckCircle2 size={14} className="text-[#6d916a]" />تُحدّث البيانات تلقائياً كل دقيقة</p>
      </div>
    </div>
  );
}
