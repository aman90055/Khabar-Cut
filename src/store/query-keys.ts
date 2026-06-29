export const queryKeys = {
  articles: {
    all: ['articles'] as const,
    lists: () => [...queryKeys.articles.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.articles.lists(), filters] as const,
    details: () => [...queryKeys.articles.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.articles.details(), slug] as const,
    infinite: (filters?: Record<string, unknown>) =>
      [...queryKeys.articles.all, 'infinite', filters] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (slug: string) =>
      [...queryKeys.categories.details(), slug] as const,
    tree: () => [...queryKeys.categories.all, 'tree'] as const,
  },
  media: {
    all: ['media'] as const,
    lists: () => [...queryKeys.media.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.media.lists(), filters] as const,
    details: () => [...queryKeys.media.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.media.details(), id] as const,
  },
  comments: {
    all: ['comments'] as const,
    lists: () => [...queryKeys.comments.all, 'list'] as const,
    byArticle: (articleId: string) =>
      [...queryKeys.comments.lists(), articleId] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
  },
  breakingNews: {
    all: ['breaking-news'] as const,
    lists: () => [...queryKeys.breakingNews.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.breakingNews.lists(), filters] as const,
    active: () => [...queryKeys.breakingNews.all, 'active'] as const,
  },
  webStories: {
    all: ['web-stories'] as const,
    lists: () => [...queryKeys.webStories.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.webStories.lists(), filters] as const,
    details: () => [...queryKeys.webStories.all, 'detail'] as const,
    detail: (slug: string) =>
      [...queryKeys.webStories.details(), slug] as const,
  },
  videos: {
    all: ['videos'] as const,
    lists: () => [...queryKeys.videos.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.videos.lists(), filters] as const,
    details: () => [...queryKeys.videos.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.videos.details(), slug] as const,
  },
  liveBlogs: {
    all: ['live-blogs'] as const,
    lists: () => [...queryKeys.liveBlogs.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.liveBlogs.lists(), filters] as const,
    details: () => [...queryKeys.liveBlogs.all, 'detail'] as const,
    detail: (slug: string) =>
      [...queryKeys.liveBlogs.details(), slug] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    summary: (filters?: Record<string, unknown>) =>
      [...queryKeys.analytics.all, 'summary', filters] as const,
    daily: (filters?: Record<string, unknown>) =>
      [...queryKeys.analytics.all, 'daily', filters] as const,
    topArticles: (limit?: number) =>
      [...queryKeys.analytics.all, 'top-articles', limit] as const,
  },
  advertisements: {
    all: ['advertisements'] as const,
    lists: () => [...queryKeys.advertisements.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.advertisements.lists(), filters] as const,
    active: (position?: string) =>
      [...queryKeys.advertisements.all, 'active', position] as const,
  },
  newsletters: {
    all: ['newsletters'] as const,
    lists: () => [...queryKeys.newsletters.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.newsletters.lists(), filters] as const,
    subscribers: (filters?: Record<string, unknown>) =>
      [...queryKeys.newsletters.all, 'subscribers', filters] as const,
  },
  seo: {
    all: ['seo'] as const,
    metadata: (entityType: string, entityId: string) =>
      [...queryKeys.seo.all, entityType, entityId] as const,
  },
  settings: {
    all: ['settings'] as const,
    group: (group: string) =>
      [...queryKeys.settings.all, 'group', group] as const,
    key: (key: string) => [...queryKeys.settings.all, 'key', key] as const,
  },
  auth: {
    all: ['auth'] as const,
    state: () => [...queryKeys.auth.all, 'state'] as const,
  },
} as const;
