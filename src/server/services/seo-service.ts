import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/config/site';
import { getAbsoluteUrl, getArticleUrl, getCategoryUrl } from '@/utils/url';
import { subHours } from 'date-fns';

export interface SitemapEntry {
  url: string;
  lastMod?: Date | string;
  changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface NewsSitemapEntry {
  url: string;
  publicationName: string;
  publicationLanguage: string;
  publicationDate: Date;
  title: string;
  keywords?: string;
}

export class SeoService {
  public static async generateSitemap(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = [
      {
        url: getAbsoluteUrl(''),
        lastMod: new Date(),
        changeFreq: 'daily',
        priority: 1.0,
      },
    ];

    // Get categories
    const categories = await prisma.category.findMany({
      where: { deletedAt: null, isActive: true },
      select: { slug: true, updatedAt: true },
    });

    for (const category of categories) {
      entries.push({
        url: getAbsoluteUrl(getCategoryUrl(category.slug)),
        lastMod: category.updatedAt,
        changeFreq: 'daily',
        priority: 0.8,
      });
    }

    // Get published articles
    const articles = await prisma.article.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLISHED',
      },
      select: {
        slug: true,
        updatedAt: true,
        category: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    for (const article of articles) {
      if (article.category) {
        entries.push({
          url: getAbsoluteUrl(getArticleUrl(article.category.slug, article.slug)),
          lastMod: article.updatedAt,
          changeFreq: 'weekly',
          priority: 0.6,
        });
      }
    }

    return entries;
  }

  public static async generateNewsSitemap(): Promise<NewsSitemapEntry[]> {
    // Google News sitemap must only contain articles published in the last 48 hours.
    const fortyEightHoursAgo = subHours(new Date(), 48);

    const articles = await prisma.article.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLISHED',
        publishedAt: {
          gte: fortyEightHoursAgo,
        },
      },
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        category: {
          select: {
            slug: true,
          },
        },
        seoMetadata: {
          select: {
            focusKeyword: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    const entries: NewsSitemapEntry[] = [];

    for (const article of articles) {
      if (article.category && article.publishedAt) {
        entries.push({
          url: getAbsoluteUrl(getArticleUrl(article.category.slug, article.slug)),
          publicationName: siteConfig.name,
          publicationLanguage: siteConfig.language.split('-')[0] || 'en',
          publicationDate: article.publishedAt,
          title: article.title,
          keywords: article.seoMetadata?.[0]?.focusKeyword || undefined,
        });
      }
    }

    return entries;
  }

  public static async generateArticleMeta(articleId: string, metaData: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
  }) {
    const article = await prisma.article.findUnique({
      where: { id: articleId, deletedAt: null },
      select: { title: true, excerpt: true },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    return prisma.seoMetadata.upsert({
      where: {
        entityType_entityId: {
          entityType: 'ARTICLE',
          entityId: articleId,
        },
      },
      create: {
        entityType: 'ARTICLE',
        entityId: articleId,
        metaTitle: metaData.metaTitle || article.title,
        metaDescription: metaData.metaDescription || article.excerpt || '',
        focusKeyword: metaData.focusKeyword || null,
      },
      update: {
        metaTitle: metaData.metaTitle || article.title,
        metaDescription: metaData.metaDescription || article.excerpt || '',
        focusKeyword: metaData.focusKeyword || null,
      },
    });
  }
}
