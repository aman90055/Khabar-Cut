import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if already subscribed in subscribers table
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ message: 'Already subscribed', already: true });
      }
      // Re-activate
      await supabase
        .from('subscribers')
        .update({
          status: 'active',
          name: name?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      const { error } = await supabase.from('subscribers').insert({
        id: crypto.randomUUID(),
        email: cleanEmail,
        name: name?.trim() || null,
        status: 'active',
        source: 'website',
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Subscriber insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Send email notification to Admin
    sendEmail({
      to: 'khabarcutnews@gmail.com',
      subject: `🔔 [New Subscriber Alert] ${cleanEmail} subscribed to Khabar Cut`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
            <h3 style="color: #D90429; margin-top: 0;">🎉 New Newsletter Subscriber!</h3>
            <p>A new user has just subscribed to <strong>Khabar Cut Newsletters</strong>:</p>
            <p style="background: #f3f4f6; padding: 12px; border-radius: 8px; font-weight: bold; color: #111827;">
              ${cleanEmail} ${name ? `(${name})` : ''}
            </p>
          </div>
        </div>
      `,
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err: any) {
    console.error('Newsletter error:', err);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
