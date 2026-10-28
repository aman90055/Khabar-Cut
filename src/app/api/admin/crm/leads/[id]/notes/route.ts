// =============================================================================
// /api/admin/crm/leads/[id]/notes — Lead notes (call, email, WhatsApp logs) (Supabase)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const adminSupabase = createAdminClient();

const noteSchema = z.object({
  authorId: z.string().min(1).default('admin'),
  type: z.enum(['GENERAL', 'CALL', 'EMAIL', 'WHATSAPP', 'MEETING']).default('GENERAL'),
  content: z.string().min(1),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: notes, error } = await adminSupabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formatted = (notes || []).map((n: any) => ({
      id: n.id,
      leadId: n.lead_id,
      authorId: n.author_id,
      type: n.type,
      content: n.content,
      createdAt: n.created_at,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = noteSchema.parse(body);

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();

    const { data: note, error: noteError } = await adminSupabase
      .from('lead_notes')
      .insert({
        id: newId,
        lead_id: id,
        author_id: data.authorId || 'admin',
        type: data.type,
        content: data.content,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (noteError) {
      console.error('Supabase create note error:', noteError);
      return NextResponse.json({ success: false, error: noteError.message }, { status: 500 });
    }

    // Update last_contacted_at on the lead
    await adminSupabase
      .from('leads')
      .update({
        last_contacted_at: now,
        updated_at: now,
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data: {
        id: note.id,
        leadId: note.lead_id,
        authorId: note.author_id,
        type: note.type,
        content: note.content,
        createdAt: note.created_at,
      }
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create note' }, { status: 500 });
  }
}
