const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

export interface SendEmailOptions {
  to?: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail({
  to = 'khabarcutnews@gmail.com',
  subject,
  html,
  text,
  from = 'Khabar Cut Newsroom <newsroom@khabarcut.in>',
}: SendEmailOptions) {
  try {
    // Attempt sending from verified domain first, fallback to onboarding@resend.dev if domain not yet verified
    let res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    let data = await res.json();

    // Fallback if custom domain fails verification
    if (!res.ok && data?.message?.includes('domain')) {
      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Khabar Cut <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
          text,
        }),
      });
      data = await res.json();
    }

    console.log('[Resend Dispatch Result]:', data);
    return { success: res.ok, data };
  } catch (err: any) {
    console.error('[Resend Error]:', err?.message);
    return { success: false, error: err?.message };
  }
}
