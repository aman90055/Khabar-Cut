import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/middleware/audit';

export class NewsletterService {
  public static async subscribe(params: {
    email: string;
    name?: string | null;
    source?: string | null;
    preferences?: Record<string, boolean>;
  }) {
    const { email, name = null, source = null, preferences = {} } = params;

    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      create: {
        email,
        name,
        source,
        preferences: preferences || {},
        status: 'pending',
      },
      update: {
        name: name || undefined,
        status: 'pending',
        preferences: preferences || undefined,
        unsubscribedAt: null,
      },
    });

    await createAuditLog({
      action: 'SUBSCRIBE_NEWSLETTER',
      entityType: 'subscriber',
      entityId: subscriber.id,
      newValues: JSON.parse(JSON.stringify(subscriber)),
    });

    return subscriber;
  }

  public static async confirmSubscription(id: string) {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id, deletedAt: null },
    });

    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    const updated = await prisma.subscriber.update({
      where: { id },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    await createAuditLog({
      action: 'CONFIRM_SUBSCRIPTION',
      entityType: 'subscriber',
      entityId: id,
      oldValues: JSON.parse(JSON.stringify(subscriber)),
      newValues: JSON.parse(JSON.stringify(updated)),
    });

    return updated;
  }

  public static async unsubscribe(email: string) {
    const subscriber = await prisma.subscriber.findUnique({
      where: { email, deletedAt: null },
    });

    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    const updated = await prisma.subscriber.update({
      where: { email },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });

    await createAuditLog({
      action: 'UNSUBSCRIBE_NEWSLETTER',
      entityType: 'subscriber',
      entityId: subscriber.id,
      oldValues: JSON.parse(JSON.stringify(subscriber)),
      newValues: JSON.parse(JSON.stringify(updated)),
    });

    return updated;
  }

  public static async trackDelivery(subscriberId: string, newsletterId: string) {
    return prisma.newsletterSubscription.create({
      data: {
        subscriberId,
        newsletterId,
        sentAt: new Date(),
      },
    });
  }

  public static async trackOpen(subscriberId: string, newsletterId: string) {
    return prisma.$transaction(async (tx) => {
      const sub = await tx.newsletterSubscription.findUnique({
        where: {
          subscriberId_newsletterId: {
            subscriberId,
            newsletterId,
          },
        },
      });

      if (!sub) return null;

      if (!sub.openedAt) {
        await tx.newsletter.update({
          where: { id: newsletterId },
          data: { openCount: { increment: 1 } },
        });
      }

      return tx.newsletterSubscription.update({
        where: {
          subscriberId_newsletterId: {
            subscriberId,
            newsletterId,
          },
        },
        data: { openedAt: new Date() },
      });
    });
  }

  public static async trackClick(subscriberId: string, newsletterId: string) {
    return prisma.$transaction(async (tx) => {
      const sub = await tx.newsletterSubscription.findUnique({
        where: {
          subscriberId_newsletterId: {
            subscriberId,
            newsletterId,
          },
        },
      });

      if (!sub) return null;

      if (!sub.clickedAt) {
        await tx.newsletter.update({
          where: { id: newsletterId },
          data: { clickCount: { increment: 1 } },
        });
      }

      return tx.newsletterSubscription.update({
        where: {
          subscriberId_newsletterId: {
            subscriberId,
            newsletterId,
          },
        },
        data: { clickedAt: new Date() },
      });
    });
  }
}
