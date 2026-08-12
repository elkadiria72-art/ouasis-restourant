import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'amber' | 'blue' | 'green' | 'purple' | 'red';
}

export default function MetricCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = 'amber',
}: MetricCardProps) {
  const colorClasses = {
    amber: 'bg-amber-600/20 text-amber-600',
    blue: 'bg-blue-600/20 text-blue-600',
    green: 'bg-green-600/20 text-green-600',
    purple: 'bg-purple-600/20 text-purple-600',
    red: 'bg-red-600/20 text-red-600',
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trend.isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
