export const siteConfig = {
  name: 'Khabar Cut',
  description: 'खबर कट (Khabar Cut) - झारखंड, बिहार, उत्तर प्रदेश और पूरे भारत की सटीक, निष्पक्ष और ताज़ा हिंदी खबरें। Breaking News, राजनीति, व्यापार, खेल, मनोरंजन और तकनीक की विश्वसनीय रिपोर्ट।',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://khabarcut.in',
  ogImage: '/images/og-default.jpg',
  author: 'Khabar Cut Editorial',
  locale: 'hi_IN',
  language: 'hi-IN',
  social: {
    twitter: '@KhabarCut',
    facebook: 'https://www.facebook.com/share/1CT6Z4xC86/',
    youtube: '@KhabarCut-yt',
    instagram: 'khabar.cut',
    whatsapp: 'https://whatsapp.com/channel/0029Vb8G5ceFXUuZZD4ueG44',
  },
  publisherEmail: 'khabarcutnews@gmail.com',
  publisherAddress: 'Ranchi, Jharkhand - 834002',
  foundingDate: '2024',
} as const;

export type SiteConfig = typeof siteConfig;
