import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'teal' | 'emerald' | 'navy' | 'rose' | 'amber';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendPositive,
  accentColor = 'navy',
  icon,
}) => {
  const accentBorder = {
    navy: 'border-l-navy-600',
    teal: 'border-l-teal-600',
    emerald: 'border-l-emerald-600',
    rose: 'border-l-rose-500',
    amber: 'border-l-amber-500',
  }[accentColor];

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${accentBorder} p-5 transition hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trendPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};

