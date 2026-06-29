// =============================================================================
// Khabar Cut — Multi-Language & RTL Engine
// =============================================================================

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  isRtl: boolean;
  locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isRtl: false, locale: 'hi-IN' },
  { code: 'en', name: 'English', nativeName: 'English', isRtl: false, locale: 'en-US' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRtl: true, locale: 'ar-AE' },
  { code: 'fr', name: 'French', nativeName: 'Français', isRtl: false, locale: 'fr-FR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRtl: false, locale: 'es-ES' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRtl: false, locale: 'de-DE' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRtl: false, locale: 'ru-RU' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRtl: false, locale: 'ja-JP' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', isRtl: false, locale: 'zh-CN' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRtl: false, locale: 'pt-PT' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', isRtl: false, locale: 'it-IT' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', isRtl: false, locale: 'ko-KR' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', isRtl: false, locale: 'tr-TR' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', isRtl: false, locale: 'nl-NL' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', isRtl: false, locale: 'id-ID' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', isRtl: false, locale: 'th-TH' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', isRtl: false, locale: 'vi-VN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isRtl: false, locale: 'bn-BD' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isRtl: false, locale: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isRtl: false, locale: 'te-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isRtl: false, locale: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isRtl: false, locale: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isRtl: false, locale: 'pa-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRtl: true, locale: 'ur-PK' },
];

export function getLanguageConfig(code: string): LanguageConfig {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) || SUPPORTED_LANGUAGES[1]; // Fallback to English
}

export function isRtl(code: string): boolean {
  return getLanguageConfig(code).isRtl;
}

export interface LocalizedSeo {
  title: string;
  description: string;
  canonicalUrl: string;
  openGraph: {
    title: string;
    description: string;
    locale: string;
    alternateLocales: string[];
  };
}

export function generateLocalizedMeta(
  languageCode: string,
  article: { title: string; excerpt?: string | null; slug: string; categorySlug: string }
): LocalizedSeo {
  const config = getLanguageConfig(languageCode);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://khabarcut.com';

  const localizedTitle = `${article.title} | ${config.nativeName} | Khabar Cut`;
  const localizedDesc = article.excerpt || `Read the latest updates in ${config.name} on Khabar Cut.`;

  return {
    title: localizedTitle,
    description: localizedDesc,
    canonicalUrl: `${baseUrl}/${languageCode}/${article.categorySlug}/${article.slug}`,
    openGraph: {
      title: localizedTitle,
      description: localizedDesc,
      locale: config.locale,
      alternateLocales: SUPPORTED_LANGUAGES.filter((lang) => lang.code !== languageCode).map((lang) => lang.locale),
    },
  };
}

export function generateLocalizedSitemap(slugs: string[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://khabarcut.com';
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const slug of slugs) {
    for (const lang of SUPPORTED_LANGUAGES) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/${lang.code}/news/${slug}</loc>\n`;
      for (const altLang of SUPPORTED_LANGUAGES) {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang.code}" href="${baseUrl}/${altLang.code}/news/${slug}"/>\n`;
      }
      xml += '  </url>\n';
    }
  }

  xml += '</urlset>';
  return xml;
}
