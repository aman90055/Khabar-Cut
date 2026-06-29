'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Eye, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

export interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    publishedAt?: Date | string | null;
    viewCount?: bigint | number | string;
    readingTime?: number | null;
    category?: { name: string; slug: string; color?: string | null } | null;
    author?: { fullName: string } | null;
    featuredImage?: { url: string; altText?: string | null } | null;
    isBreaking?: boolean;
    isFeatured?: boolean;
  };
  variant?: 'default' | 'horizontal' | 'minimal' | 'featured';
  className?: string;
}

export function ArticleCard({ article, variant = 'default', className }: ArticleCardProps) {
  const articleUrl = `/${article.category?.slug || 'news'}/${article.slug}`;
  const viewCount = article.viewCount?.toString() ?? '0';
  const readDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';

  if (variant === 'horizontal') {
    return (
      <motion.article
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
        className={cn('flex gap-4 group cursor-pointer pb-4 border-b last:border-b-0 dark:border-zinc-800', className)}
      >
        {article.featuredImage?.url && (
          <Link href={articleUrl} className="shrink-0 h-20 w-20 rounded-xl overflow-hidden border dark:border-zinc-800">
            <img
              src={article.featuredImage.url}
              alt={article.featuredImage.altText || article.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
            />
          </Link>
        )}
        <div className="flex flex-col justify-center gap-1.5 min-w-0">
          {article.category && (
            <span
              className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: article.category.color || '#ef4444' }}
            >
              {article.category.name}
            </span>
          )}
          <h3 className="text-sm font-bold leading-snug text-zinc-950 dark:text-zinc-50 group-hover:text-red-600 transition-colors line-clamp-2">
            <Link href={articleUrl}>{article.title}</Link>
          </h3>
          <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-semibold">
            {readDate && <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{readDate}</span>}
            {viewCount && <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{viewCount}</span>}
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === 'minimal') {
    return (
      <motion.article
        whileHover={{ y: -1 }}
        className={cn('group cursor-pointer space-y-1', className)}
      >
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors line-clamp-2">
          <Link href={articleUrl}>{article.title}</Link>
        </h3>
        <p className="text-[11px] text-zinc-500 font-semibold">{readDate}</p>
      </motion.article>
    );
  }

  // Default card variant
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'group cursor-pointer flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300',
        className
      )}
    >
      {/* Image */}
      <Link href={articleUrl} className="block aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {article.featuredImage?.url ? (
          <img
            src={article.featuredImage.url}
            alt={article.featuredImage.altText || article.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900" />
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-center justify-between gap-2">
          {article.category && (
            <Badge
              className="text-[10px] border-none font-black uppercase tracking-wider"
              style={{
                backgroundColor: `${article.category.color || '#ef4444'}20`,
                color: article.category.color || '#ef4444',
              }}
            >
              {article.category.name}
            </Badge>
          )}
          {article.isBreaking && (
            <Badge className="bg-red-600 border-none text-[10px] font-black uppercase animate-pulse">
              Breaking
            </Badge>
          )}
        </div>

        <h2 className="text-base font-extrabold leading-snug text-zinc-950 dark:text-zinc-50 group-hover:text-red-600 transition-colors line-clamp-2">
          <Link href={articleUrl}>{article.title}</Link>
        </h2>

        {article.excerpt && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[11px] text-zinc-400 font-semibold">
          <span>{article.author?.fullName ?? 'Editorial'}</span>
          <div className="flex items-center gap-3">
            {readDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readDate}
              </span>
            )}
            {article.readingTime && (
              <span>{article.readingTime} min read</span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
