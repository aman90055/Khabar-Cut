'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid tracking admin or internal API routes
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return;
    }

    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (lastPath.current === fullPath) return;
    lastPath.current = fullPath;

    // Get or initialize persistent visitor session ID in browser
    let sessionId = '';
    try {
      sessionId = sessionStorage.getItem('kc_session_id') || '';
      if (!sessionId) {
        sessionId = 'kc_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
        sessionStorage.setItem('kc_session_id', sessionId);
      }
    } catch {
      sessionId = 'kc_' + Math.random().toString(36).substring(2, 10);
    }

    // Determine device category
    let deviceType = 'Desktop';
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = navigator.userAgent.toLowerCase();
      if (/tablet|ipad|playbook|silk/i.test(ua)) {
        deviceType = 'Tablet';
      } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
        deviceType = 'Mobile';
      }
    }

    const payload = JSON.stringify({
      pagePath: fullPath,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      sessionId,
      deviceType,
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/pageview', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname, searchParams]);

  return null;
}
