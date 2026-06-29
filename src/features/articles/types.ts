import { z } from 'zod';
import type { 
  Article, 
  Category, 
  User, 
  Role, 
  Tag, 
  Media, 
  SeoMetadata 
} from '@prisma/client';
import { 
  createArticleSchema, 
  updateArticleSchema, 
  articleFilterSchema 
} from './schemas';

export interface TagRelation {
  tag: Tag;
}

export interface AuthorWithRole {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  email: string;
  role: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ArticleWithRelations extends Article {
  category: Category;
  author: AuthorWithRole;
  tags: TagRelation[];
  featuredImage?: Media | null;
  seoMetadata?: SeoMetadata | null;
  _count: {
    comments: number;
  };
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  featuredImage?: {
    id: string;
    url: string;
    altText: string | null;
    thumbnailUrl: string | null;
  } | null;
  isFeatured: boolean;
  isBreaking: boolean;
  viewCount: number | bigint;
  _count: {
    comments: number;
  };
}

export type ArticleFilters = z.infer<typeof articleFilterSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
