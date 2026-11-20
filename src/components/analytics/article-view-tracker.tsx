'use client';

import { useEffect, useRef } from 'react';

export function ArticleViewTracker({ articleId }: { articleId?: string }) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!articleId || trackedRef.current) return;
    trackedRef.current = true;

    let sessionId = '';
    try {
      sessionId = sessionStorage.getItem('kc_session_id') || '';
    } catch {}

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
      pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
      articleId,
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
  }, [articleId]);

  return null;
}
