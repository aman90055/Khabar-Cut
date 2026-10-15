'use client';

import Script from 'next/script';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export function AdSenseScript() {
  if (!ADSENSE_CLIENT || ADSENSE_CLIENT === 'ca-pub-XXXXXXXXXXXXXXXX') return null;

  return (
    <>
      <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
      <Script
        id="google-adsense"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}
