import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/config/site';
import type { Category } from '@prisma/client';

type ArticleForSitemap = {
  id: string;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  category: { slug: string } | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article
    .findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        slug: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
    })
    .catch((): ArticleForSitemap[] => []);

  const categories = await prisma.category
    .findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })
    .catch((): Pick<Category, 'slug' | 'updatedAt'>[] => []);

  const homepage: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map(
    (cat: Pick<Category, 'slug' | 'updatedAt'>) => ({
      url: `${siteConfig.url}/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })
  );

  const articlePages: MetadataRoute.Sitemap = articles
    .filter((art: ArticleForSitemap) => Boolean(art.category?.slug))
    .map((art: ArticleForSitemap) => ({
      url: `${siteConfig.url}/${art.category!.slug}/${art.slug}`,
      lastModified: art.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...homepage, ...categoryPages, ...articlePages];
}
