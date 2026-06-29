// =============================================================================
// Khabar Cut — Razorpay Payment Integration
// Server-side only — never import in client components
// =============================================================================

import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

function getAuthHeader(): string {
  const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
  return `Basic ${credentials}`;
}

async function razorpayRequest<T>(
  method: 'GET' | 'POST' | 'PATCH',
  endpoint: string,
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${RAZORPAY_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Razorpay API error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// ---- Order Management -------------------------------------------------------

export interface RazorpayOrderRequest {
  amount: number; // Amount in paise (multiply INR by 100)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export async function createRazorpayOrder(params: RazorpayOrderRequest): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>('POST', '/orders', {
    amount: params.amount,
    currency: params.currency || 'INR',
    receipt: params.receipt,
    notes: params.notes || {},
  });
}

export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>('GET', `/orders/${orderId}`);
}

// ---- Payment Verification ---------------------------------------------------

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
  hmac.update(`${params.orderId}|${params.paymentId}`);
  const expectedSignature = hmac.digest('hex');
  return expectedSignature === params.signature;
}

export function verifyRazorpayWebhook(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  return expectedSignature === signature;
}

// ---- Refunds ----------------------------------------------------------------

export interface RazorpayRefundRequest {
  paymentId: string;
  amount?: number; // partial refund in paise; omit for full refund
  notes?: Record<string, string>;
}

export interface RazorpayRefund {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  status: 'pending' | 'processed' | 'failed';
  created_at: number;
}

export async function createRazorpayRefund(params: RazorpayRefundRequest): Promise<RazorpayRefund> {
  const body: Record<string, unknown> = {
    notes: params.notes || {},
  };
  if (params.amount) body.amount = params.amount;

  return razorpayRequest<RazorpayRefund>('POST', `/payments/${params.paymentId}/refund`, body);
}

// ---- Subscriptions ----------------------------------------------------------

export interface RazorpaySubscriptionRequest {
  plan_id: string;
  total_count: number;
  quantity?: number;
  start_at?: number; // Unix timestamp
  notify_info?: {
    notify_phone?: string;
    notify_email?: string;
  };
  notes?: Record<string, string>;
}

export interface RazorpaySubscription {
  id: string;
  entity: string;
  plan_id: string;
  status: 'created' | 'authenticated' | 'active' | 'paused' | 'cancelled' | 'completed' | 'expired';
  total_count: number;
  paid_count: number;
  remaining_count: number;
  start_at: number;
  charge_at: number;
  notes: Record<string, string>;
}

export async function createRazorpaySubscription(
  params: RazorpaySubscriptionRequest
): Promise<RazorpaySubscription> {
  return razorpayRequest<RazorpaySubscription>('POST', '/subscriptions', params as any);
}


export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd = true
): Promise<RazorpaySubscription> {
  return razorpayRequest<RazorpaySubscription>('POST', `/subscriptions/${subscriptionId}/cancel`, {
    cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0,
  });
}

// ---- Client-safe public key -------------------------------------------------

export function getRazorpayPublicKey(): string {
  return RAZORPAY_KEY_ID;
}
