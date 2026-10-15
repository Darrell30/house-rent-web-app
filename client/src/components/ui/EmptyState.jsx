import React from 'react';
import { Home } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Home,
  title = 'No items found',
  description = 'There are currently no items matching your criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-2xl bg-white border border-dashed border-slate-300">
      <div className="w-14 h-14 mx-auto mb-4 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
};
