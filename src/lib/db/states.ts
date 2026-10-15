import { createClient } from '@/lib/supabase/server';
import type { State, District } from '@/types/supabase';

export async function getAllStates(): Promise<State[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('states')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) return [];
  return (data ?? []) as State[];
}

export async function getStateBySlug(slug: string): Promise<State | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('states')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as State;
}

export async function getDistrictsByState(stateId: string): Promise<District[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('districts')
    .select('*, state:states(*)')
    .eq('state_id', stateId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) return [];
  return (data ?? []) as unknown as District[];
}

export async function getDistrictBySlug(slug: string): Promise<District | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('districts')
    .select('*, state:states(*)')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as unknown as District;
}
