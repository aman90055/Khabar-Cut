import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/middleware/audit';
import { calculateWordCount, calculateReadingTime } from '@/lib/utils';
import { revalidateTag } from '@/lib/cache';
import { CACHE_TAGS } from '@/lib/constants';
import type { Prisma } from '@prisma/client';

export class ArticleService {
  public static async publishArticle(id: string, userId: string) {
    const article = await prisma.article.findUnique({
      where: { id, deletedAt: null },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    if (article.status === 'PUBLISHED') {
      return article;
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    await createAuditLog({
      userId,
      action: 'PUBLISH_ARTICLE',
      entityType: 'article',
      entityId: id,
      oldValues: JSON.parse(JSON.stringify(article)),
      newValues: JSON.parse(JSON.stringify(updated)),
    });

    revalidateTag(CACHE_TAGS.ARTICLES);

    return updated;
  }

  public static async createArticleWithSeo(
    data: Omit<Prisma.ArticleCreateInput, 'wordCount' | 'readingTime'>,
    seoData: {
      metaTitle?: string | null;
      metaDescription?: string | null;
      canonicalUrl?: string | null;
      ogTitle?: string | null;
      ogDescription?: string | null;
      ogImage?: string | null;
      twitterTitle?: string | null;
      twitterDescription?: string | null;
      focusKeyword?: string | null;
    },
    userId: string
  ) {
    const wordCount = calculateWordCount(data.content);
    const readingTime = calculateReadingTime(wordCount);

    const article = await prisma.$transaction(async (tx) => {
      const createdArticle = await tx.article.create({
        data: {
          ...data,
          wordCount,
          readingTime,
        } as Prisma.ArticleCreateInput,
      });

      await tx.seoMetadata.create({
        data: {
          entityType: 'ARTICLE',
          entityId: createdArticle.id,
          metaTitle: seoData.metaTitle || createdArticle.title,
          metaDescription: seoData.metaDescription || createdArticle.excerpt || '',
          canonicalUrl: seoData.canonicalUrl || null,
          ogTitle: seoData.ogTitle || createdArticle.title,
          ogDescription: seoData.ogDescription || createdArticle.excerpt || '',
          ogImage: seoData.ogImage || null,
          twitterTitle: seoData.twitterTitle || createdArticle.title,
          twitterDescription: seoData.twitterDescription || createdArticle.excerpt || '',
          focusKeyword: seoData.focusKeyword || null,
        },
      });

      return createdArticle;
    });

    await createAuditLog({
      userId,
      action: 'CREATE_ARTICLE_WITH_SEO',
      entityType: 'article',
      entityId: article.id,
      newValues: JSON.parse(JSON.stringify(article)),
    });

    revalidateTag(CACHE_TAGS.ARTICLES);

    return article;
  }
}
