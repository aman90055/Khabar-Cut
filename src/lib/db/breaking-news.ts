import { createClient } from '@/lib/supabase/server';
import type { BreakingNews } from '@/types/supabase';

export async function getActiveBreakingNews(): Promise<BreakingNews[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('breaking_news')
    .select('*, article:articles!article_id(id, title, slug, category:categories!category_id(slug))')
    .eq('is_active', true)
    .lte('start_at', now)
    .or(`end_at.is.null,end_at.gte.${now}`)
    .order('priority', { ascending: true })
    .limit(5);

  if (error) {
    console.error('[DB] getActiveBreakingNews error:', error.message);
    return [];
  }
  return (data ?? []) as unknown as BreakingNews[];
}

export async function setBreakingNews(
  articleId: string,
  headline: string,
  priority = 1,
  endAt?: string
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from('breaking_news').insert({
    article_id: articleId,
    headline,
    priority,
    is_active: true,
    end_at: endAt ?? null,
  });

  return !error;
}
