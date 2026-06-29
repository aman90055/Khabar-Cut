'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: number; label: string; up: boolean };
  href?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconBg = 'bg-zinc-100 dark:bg-zinc-800',
  iconColor = 'text-zinc-600 dark:text-zinc-400',
  trend,
  href,
  className,
}: StatCardProps) {
  const card = (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn(
        'rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6',
        'flex items-center justify-between shadow-sm hover:shadow-md transition-shadow',
        href && 'cursor-pointer',
        className,
      )}
    >
      {/* Left: value + label + optional trend */}
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
          {title}
        </p>
        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold mt-1',
              trend.up
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400',
            )}
          >
            {trend.up ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>
              {trend.up ? '+' : ''}
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </div>

      {/* Right: icon box */}
      <div className={cn('flex-shrink-0 rounded-xl p-3', iconBg)}>
        <div className={cn('h-6 w-6', iconColor)}>{icon}</div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}
