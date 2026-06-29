// =============================================================================
// Khabar Cut — Cashfree Payment Integration
// Server-side only — never import in client components
// =============================================================================

import crypto from 'crypto';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'production';
const CASHFREE_BASE_URL =
  CASHFREE_ENV === 'sandbox'
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg';

async function cashfreeRequest<T>(
  method: 'GET' | 'POST' | 'PATCH',
  endpoint: string,
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${CASHFREE_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'x-api-version': '2023-08-01',
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cashfree API error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// ---- Order Management -------------------------------------------------------

export interface CashfreeOrderRequest {
  order_id: string;
  order_amount: number;
  order_currency?: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  order_meta?: {
    return_url?: string;
    notify_url?: string;
  };
  order_note?: string;
}

export interface CashfreeOrder {
  cf_order_id: string;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: string;
  payment_session_id: string;
  created_at: string;
}

export async function createCashfreeOrder(params: CashfreeOrderRequest): Promise<CashfreeOrder> {
  return cashfreeRequest<CashfreeOrder>('POST', '/orders', {
    ...params,
    order_currency: params.order_currency || 'INR',
  });
}

export async function fetchCashfreeOrder(orderId: string): Promise<CashfreeOrder> {
  return cashfreeRequest<CashfreeOrder>('GET', `/orders/${orderId}`);
}

// ---- Payment Verification ---------------------------------------------------

export function verifyCashfreeSignature(params: {
  orderId: string;
  orderAmount: string;
  referenceId: string;
  txStatus: string;
  paymentMode: string;
  txMsg: string;
  txTime: string;
  signature: string;
}): boolean {
  const data =
    params.orderId +
    params.orderAmount +
    params.referenceId +
    params.txStatus +
    params.paymentMode +
    params.txMsg +
    params.txTime;

  const hmac = crypto.createHmac('sha256', CASHFREE_SECRET_KEY);
  hmac.update(data);
  const expectedSignature = Buffer.from(hmac.digest()).toString('base64');
  return expectedSignature === params.signature;
}

export function verifyCashfreeWebhook(payload: string, signature: string): boolean {
  const timestamp = signature.split('.')[0];
  const hmac = crypto.createHmac('sha256', CASHFREE_SECRET_KEY);
  hmac.update(timestamp + payload);
  const expectedSignature = hmac.digest('base64');
  const receivedSignature = signature.split('.')[1];
  return expectedSignature === receivedSignature;
}

// ---- Refunds ----------------------------------------------------------------

export interface CashfreeRefundRequest {
  orderId: string;
  refundAmount: number;
  refundId: string;
  refundNote?: string;
}

export interface CashfreeRefund {
  cf_refund_id: string;
  order_id: string;
  refund_id: string;
  entity: string;
  refund_amount: number;
  refund_currency: string;
  refund_note?: string;
  refund_status: 'SUCCESS' | 'PENDING' | 'CANCELLED' | 'ONHOLD';
  created_at: string;
  processed_at?: string;
}

export async function createCashfreeRefund(params: CashfreeRefundRequest): Promise<CashfreeRefund> {
  return cashfreeRequest<CashfreeRefund>('POST', `/orders/${params.orderId}/refunds`, {
    refund_amount: params.refundAmount,
    refund_id: params.refundId,
    refund_note: params.refundNote,
  });
}
