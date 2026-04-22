'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

declare global {
  interface Window {
    __phInitialized?: boolean;
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || typeof window === 'undefined') return;
    if (window.__phInitialized) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // we track manually on pathname change below
      disable_session_recording: true,
      respect_dnt: true,
    });
    window.__phInitialized = true;
  }, []);

  return <>{children}<PageViewTracker /></>;
}

function PageViewTracker() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (typeof window === 'undefined' || !window.__phInitialized) return;
    const url = search?.toString() ? `${pathname}?${search.toString()}` : pathname;
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, search]);

  return null;
}
