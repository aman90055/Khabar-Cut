import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/providers";
import { siteConfig } from "@/config/site";
import { AdSenseScript } from "@/components/ads/adsense-script";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: `Khabar Cut - Latest Hindi News, Breaking News, India & World`,
    template: `%s | Khabar Cut`,
  },
  description: "खबर कट (Khabar Cut) - झारखंड, बिहार, उत्तर प्रदेश, दिल्ली सहित पूरे भारत की सटीक, निष्पक्ष और ताज़ा हिंदी खबरें। Breaking News, राजनीति, व्यापार, खेल, मनोरंजन और तकनीक की विश्वसनीय रिपोर्ट।",
  keywords: [
    "खबर कट", "khabar cut", "Khabar Cut News",
    "झारखंड समाचार", "Jharkhand news", "Bihar news", "बिहार समाचार",
    "Hindi news", "हिंदी खबरें", "Breaking news", "ताज़ा खबरें",
    "India news", "भारत समाचार", "Ranchi news", "रांची समाचार",
    "JSSC CGL", "JPSC", "UP news", "Delhi news",
    "राष्ट्रीय समाचार", "national news", "khabarcut.in",
  ],
  authors: [{ name: "Khabar Cut Newsroom", url: siteConfig.url }],
  creator: "Khabar Cut Media Network",
  publisher: "Khabar Cut Media Network",
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "hi-IN": `${siteConfig.url}/hi`,
      "en-IN": siteConfig.url,
    },
  },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    url: siteConfig.url,
    title: `Khabar Cut - Latest Hindi News, Breaking News, India & World`,
    description: "खबर कट: झारखंड, बिहार, उत्तर प्रदेश और पूरे भारत की सत्यापित हिंदी समाचार। निष्पक्ष, सटीक और विश्वसनीय पत्रकारिता।",
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/images/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "Khabar Cut News - भारत की ताज़ा हिंदी खबरें",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Khabar Cut - Latest Hindi News, Breaking News, India & World`,
    description: "झारखंड, बिहार, उत्तर प्रदेश और भारत की सटीक हिंदी खबरें",
    creator: "@KhabarCut",
    site: "@KhabarCut",
    images: [`${siteConfig.url}/images/og-default.jpg`],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
    other: [
      { rel: "mask-icon", url: "/favicon.ico", color: "#D90429" },
    ],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification token here
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  category: "news",
};

// Organization JSON-LD structured data for Google News
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "Khabar Cut",
  "alternateName": "खबर कट",
  "url": siteConfig.url,
  "logo": {
    "@type": "ImageObject",
    "url": `${siteConfig.url}/logo.png`,
    "width": 512,
    "height": 512,
  },
  "sameAs": [
    "https://twitter.com/KhabarCut",
    "https://facebook.com/khabarcutnews",
    "https://youtube.com/khabarcut",
    "https://instagram.com/khabarcut",
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "editor@khabarcut.in",
    "contactType": "editorial",
    "availableLanguage": ["Hindi", "English"],
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "अशोक नगर, मेन रोड",
    "addressLocality": "Ranchi",
    "addressRegion": "Jharkhand",
    "postalCode": "834002",
    "addressCountry": "IN",
  },
  "foundingDate": "2024",
  "description": "Khabar Cut: झारखंड, बिहार, उत्तर प्रदेश और पूरे भारत की सटीक, निष्पक्ष हिंदी समाचार।",
  "publishingPrinciples": `${siteConfig.url}/editorial-policy`,
  "verificationFactCheckingPolicy": `${siteConfig.url}/editorial-policy`,
  "correctionsPolicy": `${siteConfig.url}/correction-policy`,
  "ethicsPolicy": `${siteConfig.url}/editorial-policy`,
  "masthead": `${siteConfig.url}/about`,
  "actionableFeedbackPolicy": `${siteConfig.url}/grievance`,
  "diversityPolicy": `${siteConfig.url}/editorial-policy`,
  "missionCoveragePrioritiesPolicy": `${siteConfig.url}/about`,
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Khabar Cut",
  "url": siteConfig.url,
  "inLanguage": "hi-IN",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteConfig.url}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Google AdSense */}
        <AdSenseScript />

        {/* Preconnect to Google domains for faster ad loading */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.googletagservices.com" />
        <link rel="preconnect" href="https://tpc.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* Organization Structured Data (Google News) */}
        <Script
          id="org-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {/* WebSite Schema with Sitelinks Searchbox */}
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
