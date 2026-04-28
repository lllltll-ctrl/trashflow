'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Siren } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@trashflow/ui';

/**
 * "Rapid response" route — generates a single route that batches all open
 * complaints into one truck's run. Different from regular bin pickups: each
 * stop is a synthetic public bin pinned at the complaint's coordinates, so
 * the same driver app + record_pickup machinery handles them. When the
 * driver marks a stop done, the underlying complaint flips to 'in_progress'
 * via the existing trigger.
 */
export function RapidResponseButton({ openCount }: { openCount: number }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const generate = async () => {
    if (openCount === 0) {
      toast.message('Немає відкритих скарг');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/complaints/route-from-complaints', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const body = (await res.json()) as { routeId: string; stopCount: number };
      toast.success(
        `Маршрут реагування: ${body.stopCount} зупин(к/ок). Знайдете на сторінці «Маршрути».`,
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не вдалося згенерувати');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button onClick={generate} disabled={busy || openCount === 0} variant="default">
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Siren className="size-4" />}
      Маршрут реагування ({openCount})
    </Button>
  );
}
