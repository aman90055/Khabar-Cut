'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { NewsletterService } from '@/server/services/newsletter-service';
import { 
  createNewsletterSchema, 
  updateNewsletterSchema, 
  subscribeSchema, 
  unsubscribeSchema 
} from './schemas';
import type { 
  CreateNewsletterInput, 
  UpdateNewsletterInput, 
  SubscribeInput, 
  UnsubscribeInput 
} from './types';

export async function createNewsletter(input: CreateNewsletterInput) {
  const user = await requirePermission('newsletters', 'create');
  const validated = createNewsletterSchema.parse(input);

  const newsletter = await prisma.newsletter.create({
    data: {
      title: validated.title,
      subject: validated.subject,
      content: validated.content || null,
      status: validated.status,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_NEWSLETTER',
    entityType: 'newsletter',
    entityId: newsletter.id,
    newValues: JSON.parse(JSON.stringify(newsletter)),
  });

  revalidateTag(CACHE_TAGS.NEWSLETTERS);
  revalidatePath(CACHE_PATHS.ADMIN_NEWSLETTERS);

  return { success: true, data: newsletter };
}

export async function updateNewsletter(id: string, input: UpdateNewsletterInput) {
  const user = await requirePermission('newsletters', 'update');
  const validated = updateNewsletterSchema.parse({ ...input, id });

  const oldNewsletter = await prisma.newsletter.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldNewsletter) {
    throw new Error('Newsletter not found');
  }

  const newsletter = await prisma.newsletter.update({
    where: { id },
    data: {
      title: validated.title,
      subject: validated.subject,
      content: validated.content,
      status: validated.status,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_NEWSLETTER',
    entityType: 'newsletter',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldNewsletter)),
    newValues: JSON.parse(JSON.stringify(newsletter)),
  });

  revalidateTag(CACHE_TAGS.NEWSLETTERS);
  revalidatePath(CACHE_PATHS.ADMIN_NEWSLETTERS);

  return { success: true, data: newsletter };
}

export async function sendNewsletter(id: string) {
  const user = await requirePermission('newsletters', 'publish');

  const oldNewsletter = await prisma.newsletter.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldNewsletter) {
    throw new Error('Newsletter not found');
  }

  if (oldNewsletter.status === 'SENT') {
    throw new Error('Newsletter already sent');
  }

  // Get active subscribers
  const confirmedSubscribers = await prisma.subscriber.findMany({
    where: { status: 'confirmed', deletedAt: null },
    select: { id: true },
  });

  // Transaction to update status and track subscriptions
  const newsletter = await prisma.$transaction(async (tx) => {
    const updated = await tx.newsletter.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        recipientCount: confirmedSubscribers.length,
      },
    });

    if (confirmedSubscribers.length > 0) {
      await tx.newsletterSubscription.createMany({
        data: confirmedSubscribers.map((sub) => ({
          subscriberId: sub.id,
          newsletterId: id,
          sentAt: new Date(),
        })),
        skipDuplicates: true,
      });
    }

    return updated;
  });

  await createAuditLog({
    userId: user.id,
    action: 'SEND_NEWSLETTER',
    entityType: 'newsletter',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldNewsletter)),
    newValues: JSON.parse(JSON.stringify(newsletter)),
  });

  revalidateTag(CACHE_TAGS.NEWSLETTERS);
  revalidatePath(CACHE_PATHS.ADMIN_NEWSLETTERS);

  return { success: true, data: newsletter };
}

export async function deleteNewsletter(id: string) {
  const user = await requirePermission('newsletters', 'delete');

  const oldNewsletter = await prisma.newsletter.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldNewsletter) {
    throw new Error('Newsletter not found');
  }

  await prisma.newsletter.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_NEWSLETTER',
    entityType: 'newsletter',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldNewsletter)),
  });

  revalidateTag(CACHE_TAGS.NEWSLETTERS);
  revalidatePath(CACHE_PATHS.ADMIN_NEWSLETTERS);

  return { success: true };
}

export async function subscribe(input: SubscribeInput) {
  const validated = subscribeSchema.parse(input);
  const subscriber = await NewsletterService.subscribe(validated);
  return { success: true, data: subscriber };
}

export async function unsubscribe(input: UnsubscribeInput) {
  const validated = unsubscribeSchema.parse(input);
  const subscriber = await NewsletterService.unsubscribe(validated.email);
  return { success: true, data: subscriber };
}

export async function confirmSubscription(id: string) {
  const subscriber = await NewsletterService.confirmSubscription(id);
  return { success: true, data: subscriber };
}
