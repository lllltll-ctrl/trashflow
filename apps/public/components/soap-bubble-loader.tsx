'use client';

import dynamic from 'next/dynamic';

const SoapBubble = dynamic(
  () => import('./soap-bubble').then((m) => m.SoapBubble),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="size-32 animate-pulse rounded-full bg-gradient-to-br from-emerald-400/30 via-emerald-300/10 to-yellow-300/20 blur-[2px] md:size-44 lg:size-64" />
      </div>
    ),
  },
);

/**
 * Lazy wrapper around the 3D soap bubble. Fills its parent — caller controls
 * width/height via Tailwind classes on the wrapping element.
 */
export function SoapBubbleLoader() {
  return <SoapBubble />;
}
