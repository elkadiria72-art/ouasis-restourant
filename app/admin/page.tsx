'use client';

import { ShoppingCart, DollarSign, Armchair, Clock, TrendingUp } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import TopSellingItems from '@/components/TopSellingItems';
import RecentOrders from '@/components/RecentOrders';
import SalesChart from '@/components/SalesChart';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back! Here's your restaurant overview.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Today's Orders"
          value={84}
          icon={<ShoppingCart size={24} />}
          subtitle="↑ vs yesterday"
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <MetricCard
          title="Today's Revenue"
          value="3,450"
          icon={<DollarSign size={24} />}
          subtitle="DH"
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <MetricCard
          title="Active Tables"
          value="12/50"
          icon={<Armchair size={24} />}
          subtitle="24% occupied"
          trend={{ value: 3, isPositive: true }}
          color="purple"
        />
        <MetricCard
          title="Preparing Orders"
          value={7}
          icon={<Clock size={24} />}
          subtitle="In kitchen"
          color="amber"
        />
        <MetricCard
          title="Avg Order Value"
          value="41"
          icon={<TrendingUp size={24} />}
          subtitle="DH"
          trend={{ value: 5, isPositive: true }}
          color="red"
        />
      </div>

      {/* Charts and Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        {/* Top Selling Items */}
        <div>
          <TopSellingItems />
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <RecentOrders />
      </div>
    </div>
  );
}
