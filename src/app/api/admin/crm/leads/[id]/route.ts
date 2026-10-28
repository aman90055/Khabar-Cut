// =============================================================================
// /api/admin/crm/leads/[id] — Lead update + notes + follow-ups (Supabase)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const adminSupabase = createAdminClient();

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  source: z.enum(['WEBSITE', 'REFERRAL', 'COLD_CALL', 'EMAIL', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'EVENT', 'PARTNER', 'OTHER']).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'DORMANT']).optional(),
  pipelineStage: z.number().optional(),
  value: z.number().optional().nullable(),
  assignedTo: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  expectedCloseAt: z.string().optional().nullable(),
  lostReason: z.string().optional().or(z.literal('')),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: lead, error: leadError } = await adminSupabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (leadError || !lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const [notesRes, followupsRes] = await Promise.all([
      adminSupabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
      adminSupabase
        .from('lead_followups')
        .select('*')
        .eq('lead_id', id)
        .is('deleted_at', null)
        .order('due_at', { ascending: true }),
    ]);

    const formattedLead = {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      designation: lead.designation,
      source: lead.source,
      status: lead.status,
      pipelineStage: lead.pipeline_stage ?? 0,
      pipeline_stage: lead.pipeline_stage ?? 0,
      value: lead.value ? Number(lead.value) : null,
      currency: lead.currency || 'INR',
      assignedTo: lead.assigned_to,
      assigned_to: lead.assigned_to,
      city: lead.city,
      state: lead.state,
      notes: lead.notes,
      tags: lead.tags || [],
      lastContactedAt: lead.last_contacted_at,
      expectedCloseAt: lead.expected_close_at,
      createdAt: lead.created_at,
      notes_list: (notesRes.data || []).map((n: any) => ({
        id: n.id,
        authorId: n.author_id,
        type: n.type,
        content: n.content,
        createdAt: n.created_at,
      })),
      followups: (followupsRes.data || []).map((f: any) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        dueAt: f.due_at,
        isDone: f.is_done,
        assignedTo: f.assigned_to,
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedLead,
    });
  } catch (error: any) {
    console.error('Fetch lead error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      updated_at: now,
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.company !== undefined) updateData.company = data.company || null;
    if (data.designation !== undefined) updateData.designation = data.designation || null;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.status !== undefined) {
      updateData.status = data.status;
      updateData.last_contacted_at = now;
      if (data.status === 'WON' || data.status === 'LOST') {
        updateData.closed_at = now;
      }
    }
    if (data.pipelineStage !== undefined) updateData.pipeline_stage = data.pipelineStage;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo || null;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.state !== undefined) updateData.state = data.state || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.expectedCloseAt !== undefined) {
      updateData.expected_close_at = data.expectedCloseAt ? new Date(data.expectedCloseAt).toISOString() : null;
    }
    if (data.lostReason !== undefined) updateData.lost_reason = data.lostReason || null;

    const { data: updatedLead, error } = await adminSupabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update lead error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formattedLead = {
      ...updatedLead,
      pipelineStage: updatedLead.pipeline_stage,
      assignedTo: updatedLead.assigned_to,
      createdAt: updatedLead.created_at,
    };

    return NextResponse.json({ success: true, data: formattedLead });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Update lead error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await adminSupabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Lead deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to delete lead' }, { status: 500 });
  }
}
