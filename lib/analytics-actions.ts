'use server';

import { getSupabaseClient } from '@/lib/supabase';

export interface OrderRecord {
  id: number;
  table_number: number;
  items: string | null;
  total_amount: number | null;
  status: string | null;
  created_at: string | null;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
  previousRevenue: number;
  previousOrders: number;
  revenueDelta: number;
  ordersDelta: number;
  salesByPeriod: {
    today: { revenue: number; orders: number; previousRevenue: number; previousOrders: number; };
    week: { revenue: number; orders: number; previousRevenue: number; previousOrders: number; };
    month: { revenue: number; orders: number; previousRevenue: number; previousOrders: number; };
  };
  topProducts: Array<{ name: string; units: number; revenue: number; averagePrice: number }>;
  lowProducts: Array<{ name: string; units: number; revenue: number; averagePrice: number }>;
  peakHours: Array<{ hour: string; orders: number }>;
  slowHours: Array<{ hour: string; orders: number }>;
  mostActiveTables: Array<{ table: number; orders: number; revenue: number }>;
}

const parseItems = (items: string | null) => {
  if (!items) return [] as Array<{ name: string; quantity?: number; price?: number; total?: number }>;

  try {
    const parsed = JSON.parse(items);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'object' && parsed !== null) return [parsed];
    return [];
  } catch {
    return [];
  }
};

const getDateRange = (from: Date, to: Date) => ({
  start: new Date(from).toISOString(),
  end: new Date(to).toISOString(),
});

interface RangeResult {
  orders: OrderRecord[];
  revenue: number;
  count: number;
  previousRevenue: number;
  previousCount: number;
}

const computeRange = (orders: OrderRecord[], now: Date, nowStart: Date, previousStart: Date, previousEnd: Date): RangeResult => {
  const currentOrders = orders.filter((order) => {
    const value = order.created_at ? new Date(order.created_at) : null;
    return value && value >= nowStart && value <= now;
  });

  const previousOrders = orders.filter((order) => {
    const value = order.created_at ? new Date(order.created_at) : null;
    return value && value >= previousStart && value < previousEnd;
  });

  const currentRevenue = currentOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  return {
    orders: currentOrders,
    revenue: currentRevenue,
    count: currentOrders.length,
    previousRevenue,
    previousCount: previousOrders.length,
  };
};

export async function fetchAnalyticsData(): Promise<AnalyticsSummary> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

  if (error) throw error;

  const orders = (data || []) as OrderRecord[];

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const previousWeekStart = new Date(weekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  const today = computeRange(orders, now, todayStart, yesterdayStart, todayStart);
  const week = computeRange(orders, now, weekStart, previousWeekStart, weekStart);
  const month = computeRange(orders, now, monthStart, previousMonthStart, previousMonthEnd);

  const completedOrders = orders.filter((order) => order.status === 'served' || order.status === 'ready' || order.status === 'preparing');
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled').length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const productMap = new Map<string, { units: number; revenue: number; }>();

  orders.forEach((order) => {
    const items = parseItems(order.items);

    items.forEach((item) => {
      const name = String(item.name || 'Unknown item');
      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || item.total || 0);
      const unitRevenue = Number(item.total || price * quantity);

      const current = productMap.get(name) || { units: 0, revenue: 0 };
      current.units += quantity;
      current.revenue += unitRevenue;
      productMap.set(name, current);
    });
  });

  const sortedProducts = Array.from(productMap.entries())
    .map(([name, data]) => ({
      name,
      units: data.units,
      revenue: data.revenue,
      averagePrice: data.units ? data.revenue / data.units : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topProducts = sortedProducts.slice(0, 5);
  const lowProducts = [...sortedProducts].sort((a, b) => a.revenue - b.revenue).slice(0, 5);

  const hourMap = new Map<string, number>();
  orders.forEach((order) => {
    if (!order.created_at) return;
    const hour = new Date(order.created_at).getHours();
    hourMap.set(String(hour), (hourMap.get(String(hour)) || 0) + 1);
  });

  const peakHours = Array.from(hourMap.entries())
    .map(([hour, ordersCount]) => ({ hour: `${String(hour).padStart(2, '0')}:00`, orders: ordersCount }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  const slowHours = Array.from(hourMap.entries())
    .map(([hour, ordersCount]) => ({ hour: `${String(hour).padStart(2, '0')}:00`, orders: ordersCount }))
    .sort((a, b) => a.orders - b.orders)
    .slice(0, 5);

  const tableStats = new Map<number, { orders: number; revenue: number }>();
  orders.forEach((order) => {
    const table = Number(order.table_number || 0);
    const current = tableStats.get(table) || { orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += Number(order.total_amount || 0);
    tableStats.set(table, current);
  });

  const mostActiveTables = Array.from(tableStats.entries())
    .map(([table, data]) => ({ table, orders: data.orders, revenue: data.revenue }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    completedOrders: completedOrders.length,
    cancelledOrders,
    previousRevenue: 0,
    previousOrders: 0,
    revenueDelta: 0,
    ordersDelta: 0,
    salesByPeriod: {
      today: {
        revenue: today.revenue,
        orders: today.count,
        previousRevenue: today.previousRevenue,
        previousOrders: today.previousCount,
      },
      week: {
        revenue: week.revenue,
        orders: week.count,
        previousRevenue: week.previousRevenue,
        previousOrders: week.previousCount,
      },
      month: {
        revenue: month.revenue,
        orders: month.count,
        previousRevenue: month.previousRevenue,
        previousOrders: month.previousCount,
      },
    },
    topProducts,
    lowProducts,
    peakHours,
    slowHours,
    mostActiveTables,
  };
}
