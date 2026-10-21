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
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Save inquiry into Supabase leads table
    await supabase.from('leads').insert({
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      notes: `Subject: ${subject || 'General Inquiry'}\n\n${message}`,
      source: 'WEBSITE',
      status: 'NEW',
      updated_at: now,
    });

    // Send email via Resend
    sendEmail({
      to: 'khabarcutnews@gmail.com',
      subject: `📩 [Khabar Cut Inquiry] ${subject || 'New Contact Form Message'} from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f9fafb; color: #111827;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="border-bottom: 3px solid #D90429; padding-bottom: 16px; margin-bottom: 24px;">
              <h2 style="color: #D90429; margin: 0; font-size: 20px;">Khabar Cut — New Website Inquiry</h2>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
              You have received a new inquiry directly from the <strong>Khabar Cut</strong> website contact form.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; font-weight: bold; width: 120px;">Sender Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; font-weight: bold;">Sender Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;"><a href="mailto:${email}" style="color: #0057FF;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; font-weight: bold;">Subject:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${subject || 'General Inquiry'}</td>
              </tr>
            </table>

            <div style="background-color: #f3f4f6; border-left: 4px solid #0057FF; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
              <strong>Message Body:</strong><br><br>${message}
            </div>

            <div style="margin-top: 32px; pt: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
              Khabar Cut Media Network · Ranchi & New Delhi
            </div>
          </div>
        </div>
      `,
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (err: any) {
    console.error('Contact form route error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
