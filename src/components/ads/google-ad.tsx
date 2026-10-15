'use client';

import { useEffect, useRef } from 'react';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle' | 'fluid' | 'autorelaxed';
  adLayout?: string;
  adLayoutKey?: string;
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// Your AdSense Publisher ID – replace ca-pub-XXXXXXXXXXXXXXXX with actual ID
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX';

export function GoogleAd({
  adSlot,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  style,
  className = '',
  fullWidthResponsive = true,
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Only push once per ad unit
    if (initialized.current) return;
    initialized.current = true;
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (err) {
      // Silently handle ad errors
    }
  }, []);

  if (ADSENSE_CLIENT === 'ca-pub-XXXXXXXXXXXXXXXX') {
    // Show premium brand promotion when AdSense is pending/unconfigured
    return (
      <a
        href="/advertise"
        className={`ad-placeholder group flex flex-col items-center justify-center text-center border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 p-4 hover:border-[#D90429]/40 transition-all ${className}`}
        style={style}
      >
        <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1">Advertisement</span>
        <span className="text-xs font-black text-gray-700 dark:text-gray-300 group-hover:text-[#D90429] transition-colors">
          Khabar Cut Media Network
        </span>
        <span className="text-[10px] text-gray-400 mt-0.5">Advertise With Us • विज्ञापन दें</span>
      </a>
    );
  }

  return (
    <div className={`ad-container no-print ${className}`} aria-label="Advertisement">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center mb-1">Advertisement</p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        {...(adLayout ? { 'data-ad-layout': adLayout } : {})}
        {...(adLayoutKey ? { 'data-ad-layout-key': adLayoutKey } : {})}
      />
    </div>
  );
}

// Pre-configured ad units for common placements
export function InArticleAd() {
  return (
    <GoogleAd
      adSlot="1234567890" // Replace with real in-article ad slot
      adFormat="fluid"
      adLayout="in-article"
      className="my-8"
      style={{ minHeight: '250px' }}
    />
  );
}

export function SidebarAd() {
  return (
    <GoogleAd
      adSlot="0987654321" // Replace with real sidebar ad slot
      adFormat="auto"
      className="sticky-ad"
      style={{ minHeight: '250px', minWidth: '300px' }}
    />
  );
}

export function HeaderBannerAd() {
  return (
    <GoogleAd
      adSlot="1122334455" // Replace with real header ad slot
      adFormat="horizontal"
      className="w-full"
      style={{ minHeight: '90px' }}
    />
  );
}

export function MultiplexAd() {
  return (
    <GoogleAd
      adSlot="5544332211" // Replace with real multiplex slot
      adFormat="autorelaxed"
      className="w-full my-6"
      style={{ minHeight: '300px' }}
    />
  );
}
