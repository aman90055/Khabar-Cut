// =============================================================================
// POST /api/webhooks/razorpay — Razorpay payment webhook
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpayWebhook } from '@/lib/payments/razorpay';

export const dynamic = 'force-dynamic';

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

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

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        // Update payment record
        await prisma.payment.updateMany({
          where: { gatewayOrderId: payment.order_id },
          data: {
            status: 'SUCCESS',
            gatewayPaymentId: payment.id,
            method: mapRazorpayMethod(payment.method),
          },
        });

        // Find and activate subscription
        const dbPayment = await prisma.payment.findFirst({
          where: { gatewayOrderId: payment.order_id },
        });

        if (dbPayment?.paymentFor === 'SUBSCRIPTION' && dbPayment.referenceId && dbPayment.userId) {
          const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: dbPayment.referenceId },
          });

          if (plan) {
            const startDate = new Date();
            const endDate = getEndDate(startDate, plan.billingCycle);

            await prisma.userSubscription.create({
              data: {
                userId: dbPayment.userId,
                planId: plan.id,
                status: 'ACTIVE',
                startDate,
                endDate,
                autoRenew: true,
              },
            });

            // Update payment with subscription link
            const sub = await prisma.userSubscription.findFirst({
              where: { userId: dbPayment.userId, planId: plan.id },
              orderBy: { createdAt: 'desc' },
            });

            if (sub) {
              await prisma.payment.update({
                where: { id: dbPayment.id },
                data: { subscriptionId: sub.id },
              });
            }
          }
        }

        // Generate invoice
        if (dbPayment) {
          await generateInvoice(dbPayment.id, payment);
        }

        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        await prisma.payment.updateMany({
          where: { gatewayOrderId: payment.order_id },
          data: {
            status: 'FAILED',
            gatewayPaymentId: payment.id,
          },
        });
        break;
      }

      case 'subscription.cancelled': {
        const sub = event.payload.subscription?.entity;
        if (!sub) break;

        await prisma.userSubscription.updateMany({
          where: { razorpaySubscriptionId: sub.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            autoRenew: false,
          },
        });
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

async function generateInvoice(paymentId: string, razorpayPayment: {
  id: string;
  amount: number;
  notes: Record<string, string>;
}) {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;
    const subtotal = Number(payment.amount);
    const gstAmount = Number(payment.gstAmount || 0);
    const totalAmount = subtotal + gstAmount;

    await prisma.invoice.create({
      data: {
        paymentId: payment.id,
        invoiceNumber,
        buyerName: razorpayPayment.notes.userName || 'Customer',
        buyerEmail: razorpayPayment.notes.userEmail || '',
        sellerName: 'Khabar Cut Media Pvt. Ltd.',
        items: [
          {
            description: razorpayPayment.notes.planName || 'Subscription',
            quantity: 1,
            unitPrice: subtotal,
            amount: subtotal,
            gstRate: Number(payment.gstRate || 18),
            hsnCode: '998363',
          },
        ],
        subtotal,
        gstAmount,
        totalAmount,
        currency: payment.currency,
        issueDate: new Date(),
      },
    });
  } catch (err) {
    console.error('Invoice generation error:', err);
  }
}
