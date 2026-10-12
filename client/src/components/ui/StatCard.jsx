import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendText,
  color = 'teal',
}) => {
  const colorStyles = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorStyles[color] || colorStyles.teal}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {(trend || trendText) && (
        <div className="mt-3 flex items-center text-xs text-slate-500">
          {trend && (
            <span
              className={`font-semibold mr-1.5 ${
                trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-600'
              }`}
            >
              {trend}
            </span>
          )}
          <span>{trendText}</span>
        </div>
      )}
    </div>
  );
};
