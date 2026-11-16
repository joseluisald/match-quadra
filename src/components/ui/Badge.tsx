import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'blue' | 'zinc' | 'rose' | 'purple';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'zinc',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60',
    amber: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    blue: 'bg-blue-950/70 text-blue-300 border-blue-800/60',
    zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    rose: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border rounded-md whitespace-nowrap shrink-0 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
