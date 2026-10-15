import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/types/supabase';

// ── Get all active categories ─────────────────────────────────
export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[DB] getAllCategories error:', error.message);
    return [];
  }
  return (data ?? []) as Category[];
}

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  'tech': 'technology',
  'takneek': 'technology',
  'khel': 'sports',
  'rajniti': 'politics',
  'vigyan': 'science',
  'vyapar': 'business',
  'arthavyavastha': 'economy',
  'raksha': 'defense',
  'shiksha': 'education',
  'antarrashtriy': 'world',
  'international': 'world',
  'parivahan': 'transport',
  'paryavaran': 'environment',
  'krishi': 'agriculture',
  'swasthya': 'health',
  'buniyadidhanca': 'infrastructure',
  'states': 'national',
  'rajyasamachar': 'national',
  'sarkariyojana': 'schemes',
  'paryatan': 'travel',
  'nyaypalika': 'legal',
  'dharm': 'religion',
  'suraksha': 'security',
};

// ── Get category by slug ──────────────────────────────────────
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const normalizedSlug = CATEGORY_SLUG_ALIASES[slug.toLowerCase()] || slug.toLowerCase();
  
  let { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', normalizedSlug)
    .eq('is_active', true)
    .single();

  if (!data) {
    // Try original slug
    const fallback = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    data = fallback.data;
  }

  if (!data) return null;
  return data as Category;
}

// ── Get top-level categories (no parent) ─────────────────────
export async function getTopLevelCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .is('parent_id', null)
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data ?? []) as Category[];
}

// ── Get subcategories for a parent ───────────────────────────
export async function getSubcategories(parentId: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data ?? []) as Category[];
}
