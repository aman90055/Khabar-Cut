// =============================================================================
// POST /api/webhooks/razorpay — Razorpay payment webhook
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyRazorpayWebhook } from '@/lib/payments/razorpay';

export const dynamic = 'force-dynamic';

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature
    if (!verifyRazorpayWebhook(payload, signature, RAZORPAY_WEBHOOK_SECRET)) {
      console.warn('Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(payload) as {
      event: string;
      payload: {
        payment?: {
          entity: {
            id: string;
            order_id: string;
            amount: number;
            currency: string;
            status: string;
            method: string;
            notes: Record<string, string>;
          };
        };
        subscription?: {
          entity: {
            id: string;
            status: string;
            notes: Record<string, string>;
          };
        };
      };
    };

    const supabase = createAdminClient();

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        // Update payment record
        await supabase
          .from('payments')
          .update({
            status: 'SUCCESS',
            gateway_payment_id: payment.id,
            method: mapRazorpayMethod(payment.method),
            updated_at: new Date().toISOString(),
          })
          .eq('gateway_order_id', payment.order_id);

        // Find and activate subscription
        const { data: dbPayment } = await supabase
          .from('payments')
          .select('*')
          .eq('gateway_order_id', payment.order_id)
          .maybeSingle();

        if (dbPayment?.payment_for === 'SUBSCRIPTION' && dbPayment.reference_id && dbPayment.user_id) {
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', dbPayment.reference_id)
            .maybeSingle();

          if (plan) {
            const startDate = new Date();
            const cycle = plan.billing_cycle || plan.billingCycle;
            const endDate = getEndDate(startDate, cycle);

            const { data: sub } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: dbPayment.user_id,
                plan_id: plan.id,
                status: 'ACTIVE',
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                auto_renew: true,
              })
              .select('*')
              .single();

            if (sub) {
              await supabase
                .from('payments')
                .update({ subscription_id: sub.id })
                .eq('id', dbPayment.id);
            }
          }
        }

        // Generate invoice
        if (dbPayment) {
          await generateInvoice(supabase, dbPayment.id, payment);
        }

        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        await supabase
          .from('payments')
          .update({
            status: 'FAILED',
            gateway_payment_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq('gateway_order_id', payment.order_id);
        break;
      }

      case 'subscription.cancelled': {
        const sub = event.payload.subscription?.entity;
        if (!sub) break;

        await supabase
          .from('user_subscriptions')
          .update({
            status: 'CANCELLED',
            cancelled_at: new Date().toISOString(),
            auto_renew: false,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', sub.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

function mapRazorpayMethod(method: string): 'UPI' | 'CARD' | 'NET_BANKING' | 'RAZORPAY' {
  const map: Record<string, 'UPI' | 'CARD' | 'NET_BANKING' | 'RAZORPAY'> = {
    upi: 'UPI',
    card: 'CARD',
    netbanking: 'NET_BANKING',
  };
  return map[method.toLowerCase()] || 'RAZORPAY';
}

function getEndDate(start: Date, cycle: string): Date {
  const end = new Date(start);
  switch (cycle) {
    case 'MONTHLY': end.setMonth(end.getMonth() + 1); break;
    case 'QUARTERLY': end.setMonth(end.getMonth() + 3); break;
    case 'ANNUAL': end.setFullYear(end.getFullYear() + 1); break;
    case 'LIFETIME': end.setFullYear(end.getFullYear() + 100); break;
  }
  return end;
}

async function generateInvoice(supabase: any, paymentId: string, razorpayPayment: {
  id: string;
  amount: number;
  notes: Record<string, string>;
}) {
  try {
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .maybeSingle();

    if (!payment) return;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;
    const subtotal = Number(payment.amount);
    const gstAmount = Number(payment.gst_amount || 0);
    const totalAmount = subtotal + gstAmount;

    await supabase
      .from('invoices')
      .insert({
        payment_id: payment.id,
        invoice_number: invoiceNumber,
        buyer_name: razorpayPayment.notes.userName || 'Customer',
        buyer_email: razorpayPayment.notes.userEmail || '',
        seller_name: 'Khabar Cut Media Pvt. Ltd.',
        items: [
          {
            description: razorpayPayment.notes.planName || 'Subscription',
            quantity: 1,
            unitPrice: subtotal,
            amount: subtotal,
            gstRate: Number(payment.gst_rate || 18),
            hsnCode: '998363',
          },
        ],
        subtotal,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        currency: payment.currency || 'INR',
        issue_date: new Date().toISOString(),
      });
  } catch (err) {
    console.error('Invoice generation error:', err);
  }
}
