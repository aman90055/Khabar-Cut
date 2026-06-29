export const siteConfig = {
  name: 'Khabar Cut',
  description: 'Enterprise Digital News Platform delivering verified and breaking news.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://khabarcut.com',
  ogImage: '/images/og-default.jpg',
  author: 'Khabar Cut Editorial',
  locale: 'en_IN',
  language: 'en-IN',
  social: {
    twitter: '@KhabarCut',
    facebook: 'khabarcutnews',
    youtube: 'khabarcut',
    instagram: 'khabarcut',
  },
} as const;

export type SiteConfig = typeof siteConfig;
