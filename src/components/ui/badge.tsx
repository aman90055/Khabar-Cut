import * as React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-zinc-300",
        variant === 'default' && "border-transparent bg-zinc-900 text-zinc-50 shadow dark:bg-zinc-50 dark:text-zinc-900",
        variant === 'secondary' && "border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
        variant === 'destructive' && "border-transparent bg-red-500 text-zinc-50 shadow dark:bg-red-900 dark:text-zinc-50",
        variant === 'success' && "border-transparent bg-emerald-500 text-zinc-50 shadow dark:bg-emerald-950 dark:text-emerald-300",
        variant === 'outline' && "text-zinc-950 border-zinc-200 dark:text-zinc-50 dark:border-zinc-800",
        className
      )}
      {...props}
    />
  );
}
