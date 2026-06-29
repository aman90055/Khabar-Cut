export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const;

export const MEDIA = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ] as const,
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'] as const,
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
  STORAGE_BUCKET: 'media',
  AVATAR_BUCKET: 'avatars',
} as const;

export const ARTICLE = {
  WORDS_PER_MINUTE: 200,
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MAX_EXCERPT_LENGTH: 500,
  MAX_SLUG_LENGTH: 250,
} as const;

export const SEO = {
  MAX_TITLE_LENGTH: 60,
  MAX_DESCRIPTION_LENGTH: 160,
} as const;

export const COMMENT = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 2000,
} as const;

export const AUTH = {
  MIN_PASSWORD_LENGTH: 8,
  OTP_LENGTH: 6,
  SESSION_EXPIRY_HOURS: 24 * 7, // 7 days
} as const;

export const CACHE_TAGS = {
  ARTICLES: 'articles',
  CATEGORIES: 'categories',
  COMMENTS: 'comments',
  MEDIA: 'media',
  USERS: 'users',
  SETTINGS: 'settings',
  BREAKING_NEWS: 'breaking-news',
  WEB_STORIES: 'web-stories',
  VIDEOS: 'videos',
  LIVE_BLOGS: 'live-blogs',
  ANALYTICS: 'analytics',
  ADVERTISEMENTS: 'advertisements',
  NEWSLETTERS: 'newsletters',
  SEO: 'seo',
} as const;

export const CACHE_PATHS = {
  HOME: '/',
  ARTICLES: '/articles',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_USERS: '/admin/users',
  ADMIN_MEDIA: '/admin/media',
  ADMIN_COMMENTS: '/admin/comments',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_ADS: '/admin/advertisements',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_NEWSLETTERS: '/admin/newsletters',
  ADMIN_BREAKING: '/admin/breaking-news',
  ADMIN_WEB_STORIES: '/admin/web-stories',
  ADMIN_VIDEOS: '/admin/videos',
  ADMIN_LIVE_BLOGS: '/admin/live-blogs',
} as const;
