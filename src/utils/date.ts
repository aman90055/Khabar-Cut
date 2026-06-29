import { format, formatDistanceToNow, isBefore, parseISO } from 'date-fns';

export function formatDate(date: Date | string | number, formatStr = 'PPP'): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(d, formatStr);
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateForSEO(date: Date | string | number): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return d.toISOString();
}

export function isExpired(date: Date | string | number): boolean {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return isBefore(d, new Date());
}

export function getTimeAgo(date: Date | string | number): string {
  return formatRelativeTime(date);
}
