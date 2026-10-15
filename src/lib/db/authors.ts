import { createClient } from '@/lib/supabase/server';
import type { Author } from '@/types/supabase';

export async function getAllAuthors(): Promise<Author[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('authors')
    .select('*, profile:profiles!profile_id(full_name, avatar_url, bio)')
    .order('display_name', { ascending: true });

  if (error) return [];
  return (data ?? []) as unknown as Author[];
}

export async function getAuthorById(id: string): Promise<Author | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('authors')
    .select('*, profile:profiles!profile_id(full_name, avatar_url, bio)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as unknown as Author;
}
