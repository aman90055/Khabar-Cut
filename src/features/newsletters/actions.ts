'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { 
  createNewsletterSchema, 
  updateNewsletterSchema, 
  subscribeSchema, 
  unsubscribeSchema 
} from './schemas';
import type { 
  CreateNewsletterInput, 
  UpdateNewsletterInput, 
  SubscribeInput, 
  UnsubscribeInput 
} from './types';

export async function createNewsletter(input: CreateNewsletterInput) {
  const validated = createNewsletterSchema.parse(input);
  const supabase = createAdminClient();

  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .insert({
      title: validated.title,
      subject: validated.subject,
      content: validated.content || null,
      status: validated.status || 'DRAFT',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create newsletter: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.NEWSLETTERS);
  revalidatePath(CACHE_PATHS.ADMIN_NEWSLETTERS);

  return { success: true, data: newsletter };
}

export async function updateNewsletter(id: string, input: UpdateNewsletterInput) {
  const validated = updateNewsletterSchema.parse({ ...input, id });
  const supabase = createAdminClient();

  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .update({
      title: validated.title,
      subject: validated.subject,
      content: validated.content,
      status: validated.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update newsletter: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.NEWSLETTERS);
  revalidatePath(CACHE_PATHS.ADMIN_NEWSLETTERS);

  return { success: true, data: newsletter };
}

export async function sendNewsletter(id: string) {
  const supabase = createAdminClient();

  const { data: oldNewsletter, error: fetchErr } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !oldNewsletter) {
    throw new Error('Newsletter not found');
  }

  if (oldNewsletter.status === 'SENT') {
    throw new Error('Newsletter already sent');
  }

  // Get active subscribers
  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('id')
    .eq('status', 'confirmed')
    .is('deleted_at', null);

  const count = (subscribers || []).length;

  const { data: updated, error: updateErr } = await supabase
    .from('newsletters')
    .update({
      status: 'SENT',
      sent_at: new Date().toISOString(),
      recipient_count: count,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (updateErr) {
    throw new Error(`Failed to send newsletter: ${updateErr.message}`);
  }

  revalidateTag(CACHE_TAGS.NEWSLETTERS);
  revalidatePath(CACHE_PATHS.ADMIN_NEWSLETTERS);

  return { success: true, data: updated };
}

export async function deleteNewsletter(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('newsletters')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete newsletter: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.NEWSLETTERS);
  revalidatePath(CACHE_PATHS.ADMIN_NEWSLETTERS);

  return { success: true };
}

export async function subscribe(input: SubscribeInput) {
  const validated = subscribeSchema.parse(input);
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('subscribers')
    .select('id')
    .eq('email', validated.email)
    .maybeSingle();

  let subscriber;
  if (existing) {
    const { data, error } = await supabase
      .from('subscribers')
      .update({
        status: 'pending',
        name: validated.name || undefined,
        unsubscribed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    subscriber = data;
  } else {
    const { data, error } = await supabase
      .from('subscribers')
      .insert({
        email: validated.email,
        name: validated.name || null,
        source: validated.source || null,
        status: 'pending',
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    subscriber = data;
  }

  return { success: true, data: subscriber };
}

export async function unsubscribe(input: UnsubscribeInput) {
  const validated = unsubscribeSchema.parse(input);
  const supabase = createAdminClient();

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('email', validated.email)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to unsubscribe: ${error.message}`);
  }

  return { success: true, data: subscriber };
}

export async function confirmSubscription(id: string) {
  const supabase = createAdminClient();

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to confirm subscription: ${error.message}`);
  }

  return { success: true, data: subscriber };
}
