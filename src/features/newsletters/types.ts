import { z } from 'zod';
import type { Newsletter, Subscriber } from '@prisma/client';
import { 
  createNewsletterSchema, 
  updateNewsletterSchema, 
  subscribeSchema, 
  unsubscribeSchema, 
  newsletterFilterSchema,
  subscriberFilterSchema
} from './schemas';

export interface NewsletterWithStats extends Newsletter {
  // Can extend if we had separate stats, but standard model already containsrecipientCount, openCount, clickCount
}

export interface SubscriberWithPreferences extends Subscriber {
  // Can extend
}

export type CreateNewsletterInput = z.infer<typeof createNewsletterSchema>;
export type UpdateNewsletterInput = z.infer<typeof updateNewsletterSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;
export type NewsletterFilters = z.infer<typeof newsletterFilterSchema>;
export type SubscriberFilters = z.infer<typeof subscriberFilterSchema>;
