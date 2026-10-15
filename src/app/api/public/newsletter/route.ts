import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';

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

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ message: 'Already subscribed', already: true });
      }
      // Re-activate
      await supabase.from('newsletter_subscribers').update({ status: 'active', name: name || null }).eq('id', existing.id);
    } else {
      await supabase.from('newsletter_subscribers').insert({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        status: 'active',
        source: 'website',
      });
    }

    // Send email notification to Admin
    sendEmail({
      to: 'khabarcutnews@gmail.com',
      subject: `🔔 [New Subscriber Alert] ${email} subscribed to Khabar Cut`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
            <h3 style="color: #D90429; margin-top: 0;">🎉 New Newsletter Subscriber!</h3>
            <p>A new user has just subscribed to <strong>Khabar Cut Newsletters</strong>:</p>
            <p style="background: #f3f4f6; padding: 12px; border-radius: 8px; font-weight: bold; color: #111827;">
              ${email} ${name ? `(${name})` : ''}
            </p>
          </div>
        </div>
      `,
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) {
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
