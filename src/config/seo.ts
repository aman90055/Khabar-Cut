import { getAbsoluteUrl, getArticleUrl, getCategoryUrl } from '@/utils/url';
import { getImageUrl } from '@/utils/image';
import { siteConfig } from './site';

export const defaultSeoConfig = {
  titleTemplate: `%s | ${siteConfig.name}`,
  defaultTitle: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: getAbsoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    handle: siteConfig.social.twitter,
    site: siteConfig.social.twitter,
    cardType: 'summary_large_image',
  },
};

export function generateArticleSeo(article: {
  title: string;
  excerpt: string;
  slug: string;
  categorySlug: string;
  publishedAt: Date | string;
  author: { fullName: string };
  featuredImage?: { url: string; altText?: string | null } | null;
}) {
  const url = getAbsoluteUrl(getArticleUrl(article.categorySlug, article.slug));
  const imageUrl = article.featuredImage?.url 
    ? getImageUrl(article.featuredImage.url) 
    : getAbsoluteUrl(siteConfig.ogImage);
    
  return {
    title: article.title,
    description: article.excerpt,
    canonical: url,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: 'article',
      article: {
        publishedTime: new Date(article.publishedAt).toISOString(),
        authors: [article.author.fullName],
      },
      images: [
        {
          url: imageUrl,
          alt: article.featuredImage?.altText || article.title,
        },
      ],
    },
    twitter: {
      cardType: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      image: imageUrl,
    },
  };
}

export function generateCategorySeo(category: {
  name: string;
  slug: string;
  description?: string | null;
}) {
  const url = getAbsoluteUrl(getCategoryUrl(category.slug));
  const description = category.description || `Read latest news and updates from ${category.name} on ${siteConfig.name}`;
  
  return {
    title: category.name,
    description,
    canonical: url,
    openGraph: {
      title: category.name,
      description,
      url,
      type: 'website',
    },
    twitter: {
      title: category.name,
      description,
    },
  };
}
