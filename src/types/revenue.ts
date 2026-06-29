// =============================================================================
// Khabar Cut — Revenue & Monetization Types
// =============================================================================

// ---- Revenue Dashboard -------------------------------------------------------

export interface RevenueOverview {
  todayRevenue: number;
  todayImpressions: number;
  todayClicks: number;
  todayCtr: number;
  todayRpm: number;
  monthRevenue: number;
  monthImpressions: number;
  yearRevenue: number;
  totalSubscribers: number;
  activeSubscribers: number;
  mrr: number;
  arr: number;
  fillRate: number;
  avgEcpm: number;
  revenueBySource: RevenueBySource[];
  topAdSlots: AdSlotPerformance[];
  topAdvertisers: TopAdvertiser[];
  forecast7d: number;
  forecast30d: number;
}

export interface RevenueBySource {
  source: string;
  label: string;
  revenue: number;
  percentage: number;
  change: number; // % change vs previous period
}

export interface AdSlotPerformance {
  position: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  rpm: number;
  revenue: number;
}

export interface TopAdvertiser {
  id: string;
  companyName: string;
  logoUrl?: string;
  totalSpend: number;
  activeCampaigns: number;
  impressions: number;
  clicks: number;
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
  impressions: number;
  clicks: number;
  subscriptionRevenue: number;
  adRevenue: number;
}

// ---- Subscription Plans -----------------------------------------------------

export interface SubscriptionPlanData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'LIFETIME';
  trialDays: number;
  isActive: boolean;
  isFeatured: boolean;
  features: string[];
  adFree: boolean;
  exclusiveContent: boolean;
  premiumVideos: boolean;
  premiumNewsletter: boolean;
  sortOrder: number;
  subscriberCount?: number;
  mrr?: number;
}

export interface UserSubscriptionData {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlanData;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL' | 'PAST_DUE';
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  autoRenew: boolean;
  razorpaySubscriptionId?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

// ---- Advertisers & Campaigns ------------------------------------------------

export interface AdvertiserData {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  logoUrl?: string;
  notes?: string;
  campaignCount?: number;
  createdAt: string;
}

export interface AdSlotData {
  id: string;
  name: string;
  position: AdSlotPositionType;
  description?: string;
  width?: number;
  height?: number;
  isActive: boolean;
  isPremium: boolean;
  pricePerDay?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  networkCode?: string;
  networkProvider?: AdNetworkProviderType;
  fillRate?: number;
  avgCtr?: number;
  avgCpm?: number;
  activeCampaigns?: number;
}

export type AdSlotPositionType =
  | 'HOME_HERO'
  | 'HOME_SIDEBAR'
  | 'HOME_BELOW_BREAKING'
  | 'CATEGORY_TOP'
  | 'CATEGORY_SIDEBAR'
  | 'ARTICLE_TOP'
  | 'ARTICLE_MIDDLE'
  | 'ARTICLE_BOTTOM'
  | 'ARTICLE_SIDEBAR'
  | 'STICKY_FOOTER'
  | 'STICKY_SIDEBAR'
  | 'WEB_STORY'
  | 'LIVE_BLOG'
  | 'SEARCH_PAGE'
  | 'AUTHOR_PAGE'
  | 'PAGE_404'
  | 'NEWSLETTER_INLINE'
  | 'VIDEO_PRE_ROLL'
  | 'VIDEO_MID_ROLL';

export type AdNetworkProviderType =
  | 'ADSENSE'
  | 'ADSTERRA'
  | 'MEDIA_NET'
  | 'TABOOLA'
  | 'OUTBRAIN'
  | 'MGID'
  | 'DIRECT';

export interface AdCampaignData {
  id: string;
  advertiserId: string;
  advertiser?: AdvertiserData;
  slotId?: string;
  slot?: AdSlotData;
  name: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  targetStates?: string[];
  targetDevices?: string[];
  impressions: number;
  clicks: number;
  conversions: number;
  ctr?: number;
  cpm?: number;
  notes?: string;
  rejectedReason?: string;
  approvedAt?: string;
  createdAt: string;
  creatives?: AdCreativeData[];
}

export interface AdCreativeData {
  id: string;
  campaignId: string;
  name: string;
  type: 'BANNER' | 'VIDEO' | 'NATIVE' | 'HTML';
  fileUrl: string;
  clickUrl: string;
  altText?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  duration?: number;
  isApproved: boolean;
  createdAt: string;
}

// ---- Payments & Invoices ----------------------------------------------------

export interface PaymentData {
  id: string;
  userId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  method?: 'RAZORPAY' | 'CASHFREE' | 'UPI' | 'CARD' | 'NET_BANKING' | 'INTERNATIONAL';
  paymentFor: 'SUBSCRIPTION' | 'AD_CAMPAIGN' | 'PRESS_RELEASE' | 'MARKETPLACE' | 'BUSINESS_LISTING' | 'SERVICE';
  referenceId?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gstAmount?: number;
  gstRate?: number;
  notes?: string;
  refundedAt?: string;
  refundAmount?: number;
  createdAt: string;
  invoice?: InvoiceData;
}

export interface InvoiceData {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerGst?: string;
  sellerName: string;
  sellerGst?: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  issueDate: string;
  dueDate?: string;
  pdfUrl?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  gstRate?: number;
  hsnCode?: string;
}

// ---- Press Releases ---------------------------------------------------------

export interface PressReleaseData {
  id: string;
  title: string;
  content: Record<string, unknown>;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  mediaUrls?: string[];
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'PAYMENT_PENDING';
  price: number;
  paymentId?: string;
  publishedAt?: string;
  slug?: string;
  rejectedReason?: string;
  reviewNote?: string;
  seoTitle?: string;
  seoDescription?: string;
  distribution?: Record<string, unknown>;
  createdAt: string;
}

// ---- Business Directory & Marketplace ---------------------------------------

export interface BusinessListingData {
  id: string;
  businessName: string;
  slug: string;
  description?: string;
  category?: string;
  subCategory?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  coverImageUrl?: string;
  images?: string[];
  socialLinks?: Record<string, string>;
  isVerified: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  rating?: number;
  reviewCount: number;
  viewCount: number;
  tags?: string[];
  paymentId?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface MarketplaceOrderData {
  id: string;
  userId?: string;
  serviceType: string;
  packageName: string;
  description?: string;
  requirements?: Record<string, unknown>;
  price: number;
  currency: string;
  status: 'PENDING' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentId?: string;
  deliverables?: Record<string, unknown>;
  deliveredAt?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
}

// ---- Lead CRM ---------------------------------------------------------------

export interface LeadData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  designation?: string;
  source: 'WEBSITE' | 'REFERRAL' | 'COLD_CALL' | 'EMAIL' | 'SOCIAL_MEDIA' | 'ADVERTISEMENT' | 'EVENT' | 'PARTNER' | 'OTHER';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST' | 'DORMANT';
  pipelineStage: number;
  value?: number;
  currency: string;
  assignedTo?: string;
  tags?: string[];
  city?: string;
  state?: string;
  notes?: string;
  lastContactedAt?: string;
  expectedCloseAt?: string;
  closedAt?: string;
  lostReason?: string;
  createdAt: string;
  notesList?: LeadNoteData[];
  followups?: LeadFollowUpData[];
}

export interface LeadNoteData {
  id: string;
  leadId: string;
  authorId: string;
  type: 'GENERAL' | 'CALL' | 'EMAIL' | 'WHATSAPP' | 'MEETING';
  content: string;
  createdAt: string;
}

export interface LeadFollowUpData {
  id: string;
  leadId: string;
  assignedTo: string;
  dueAt: string;
  title: string;
  description?: string;
  isDone: boolean;
  completedAt?: string;
  createdAt: string;
}

// ---- Affiliate System -------------------------------------------------------

export interface AffiliateProfileData {
  id: string;
  userId: string;
  referralCode: string;
  commissionRate: number;
  totalEarned: number;
  totalPaid: number;
  pendingBalance: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  isActive: boolean;
  createdAt: string;
  conversions?: AffiliateConversionData[];
  withdrawals?: AffiliateWithdrawalData[];
}

export interface AffiliateConversionData {
  id: string;
  affiliateId: string;
  paymentId: string;
  convertedUserId?: string;
  conversionType: string;
  orderValue: number;
  commission: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

export interface AffiliateWithdrawalData {
  id: string;
  affiliateId: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  notes?: string;
  processedAt?: string;
  transactionId?: string;
  createdAt: string;
}

// ---- Push Notifications -----------------------------------------------------

export interface PushSubscriptionData {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userId?: string;
  deviceType?: string;
  browser?: string;
  country?: string;
  state?: string;
  isActive: boolean;
  subscribedAt: string;
}

export interface PushCampaignData {
  id: string;
  title: string;
  body: string;
  iconUrl?: string;
  imageUrl?: string;
  clickUrl?: string;
  targetAudience: string;
  targetStates?: string[];
  targetDevices?: string[];
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
  scheduledAt?: string;
  sentAt?: string;
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  createdAt: string;
}

// ---- Razorpay / Payment Gateway ----------------------------------------

export interface RazorpayOrderPayload {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ---- API Responses ----------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
