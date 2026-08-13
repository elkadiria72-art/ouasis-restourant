'use server';

import { getSupabaseClient } from '@/lib/supabase';

export interface DashboardMetrics {
  todayOrders: number;
  todayRevenue: number;
  activeTables: number;
  totalTables: number;
  preparingOrders: number;
  avgOrderValue: number;
  ordersTrend: number;
  revenueTrend: number;
}

export interface DashboardOrder {
  id: number;
  table_number: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface DashboardTopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

export interface ChartPoint {
  label: string;
  sales: number;
  orders: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentOrders: DashboardOrder[];
  topProducts: DashboardTopProduct[];
  chartData: {
    today: ChartPoint[];
    week: ChartPoint[];
    month: ChartPoint[];
  };
}

const parseItems = (items: string | null) => {
  if (!items) return [] as Array<{ name?: string; quantity?: number; price?: number; total?: number }>;
  try {
    const parsed = JSON.parse(items);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const dayStart = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const percentChange = (current: number, previous: number) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const AR_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseClient();
  const now = new Date();
  const todayStart = dayStart(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const [ordersRes, tablesRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('tables').select('id, status'),
  ]);

  if (ordersRes.error) throw ordersRes.error;
  if (tablesRes.error) throw tablesRes.error;

  const orders = ordersRes.data || [];
  const tables = tablesRes.data || [];

  const todayOrdersList = orders.filter((o) => o.created_at && new Date(o.created_at) >= todayStart);
  const yesterdayOrdersList = orders.filter((o) => {
    if (!o.created_at) return false;
    const d = new Date(o.created_at);
    return d >= yesterdayStart && d < todayStart;
  });

  const todayRevenue = todayOrdersList.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const yesterdayRevenue = yesterdayOrdersList.reduce((s, o) => s + Number(o.total_amount || 0), 0);

  const activeTables = tables.filter((t) => t.status === 'occupied' || t.status === 'needs_attention').length;
  const preparingOrders = orders.filter((o) => o.status === 'preparing' || o.status === 'new').length;
  const avgOrderValue = todayOrdersList.length
    ? todayRevenue / todayOrdersList.length
    : 0;

  const productMap = new Map<string, { units: number; revenue: number }>();
  todayOrdersList.forEach((order) => {
    parseItems(order.items).forEach((item) => {
      const name = String(item.name || 'منتج');
      const qty = Number(item.quantity || 1);
      const rev = Number(item.total || (item.price || 0) * qty);
      const cur = productMap.get(name) || { units: 0, revenue: 0 };
      cur.units += qty;
      cur.revenue += rev;
      productMap.set(name, cur);
    });
  });

  const topProducts = Array.from(productMap.entries())
    .map(([name, data], index) => ({
      id: index + 1,
      name,
      sales: data.units,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const recentOrders = orders.slice(0, 8).map((o) => ({
    id: o.id,
    table_number: o.table_number,
    total_amount: Number(o.total_amount || 0),
    status: o.status || 'new',
    created_at: o.created_at || new Date().toISOString(),
  }));

  const hourBuckets = Array.from({ length: 8 }, (_, i) => ({
    label: `${String(i * 3).padStart(2, '0')}:00`,
    sales: 0,
    orders: 0,
    hourStart: i * 3,
  }));

  todayOrdersList.forEach((order) => {
    if (!order.created_at) return;
    const hour = new Date(order.created_at).getHours();
    const bucket = hourBuckets.find((b) => hour >= b.hourStart && hour < b.hourStart + 3) || hourBuckets[hourBuckets.length - 1];
    bucket.sales += Number(order.total_amount || 0);
    bucket.orders += 1;
  });

  const todayChart = hourBuckets.map(({ label, sales, orders: orderCount }) => ({
    label,
    sales,
    orders: orderCount,
  }));

  const weekChart: ChartPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayOrders = orders.filter((o) => {
      if (!o.created_at) return false;
      const t = new Date(o.created_at);
      return t >= d && t < next;
    });
    weekChart.push({
      label: AR_DAYS[d.getDay()],
      sales: dayOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
      orders: dayOrders.length,
    });
  }

  const monthChart: ChartPoint[] = [];
  for (let w = 3; w >= 0; w--) {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - (w + 1) * 7 + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const weekOrders = orders.filter((o) => {
      if (!o.created_at) return false;
      const t = new Date(o.created_at);
      return t >= start && t < end;
    });
    monthChart.push({
      label: `الأسبوع ${4 - w}`,
      sales: weekOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
      orders: weekOrders.length,
    });
  }

  return {
    metrics: {
      todayOrders: todayOrdersList.length,
      todayRevenue,
      activeTables,
      totalTables: tables.length,
      preparingOrders,
      avgOrderValue,
      ordersTrend: percentChange(todayOrdersList.length, yesterdayOrdersList.length),
      revenueTrend: percentChange(todayRevenue, yesterdayRevenue),
    },
    recentOrders,
    topProducts,
    chartData: {
      today: todayChart,
      week: weekChart,
      month: monthChart,
    },
  };
}
