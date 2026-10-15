import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

import { createAdminClient } from '@/lib/supabase/admin';

const adminSupabase = createAdminClient();

interface AuditLogParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  request?: Request;
}

export async function createAuditLog(params: AuditLogParams) {
  let ipAddress = 'unknown';
  let userAgent = 'unknown';

  if (params.request) {
    ipAddress = params.request.headers.get('x-forwarded-for') || 'unknown';
    userAgent = params.request.headers.get('user-agent') || 'unknown';
  } else {
    try {
      const headerList = await headers();
      ipAddress = headerList.get('x-forwarded-for') || 'unknown';
      userAgent = headerList.get('user-agent') || 'unknown';
    } catch {
      // Fallback if not in a request context
    }
  }

  if (ipAddress.includes(',')) {
    ipAddress = ipAddress.split(',')[0].trim();
  }

  const { data, error } = await adminSupabase
    .from('audit_logs')
    .insert({
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_values: params.oldValues ?? null,
      new_values: params.newValues ?? null,
      ip_address: ipAddress,
      user_agent: userAgent,
      user_id: params.userId || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to write audit log via Supabase:', error);
  }

  return data;
}
