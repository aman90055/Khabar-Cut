import { createClient } from '@/lib/supabase/server';
import type { BreakingNews } from '@/types/supabase';

export async function getActiveBreakingNews(): Promise<BreakingNews[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('breaking_news')
    .select('*, article:articles!article_id(id, title, slug, category:categories!category_id(slug))')
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order('priority', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[DB] getActiveBreakingNews error:', error.message);
    return [];
  }
  return (data ?? []) as unknown as BreakingNews[];
}

export async function setBreakingNews(
  articleId: string,
  title: string,
  priority = 1,
  expiresAt?: string
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from('breaking_news').insert({
    article_id: articleId,
    title,
    priority,
    is_active: true,
    expires_at: expiresAt ?? null,
    updated_at: new Date().toISOString(),
  });

  return !error;
}
