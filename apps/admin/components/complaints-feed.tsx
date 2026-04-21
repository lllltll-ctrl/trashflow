'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Badge, Card, CardContent } from '@trashflow/ui';
import { WASTE_CATEGORY_ICONS, WASTE_CATEGORY_LABELS_UA } from '@trashflow/db';
import { createClient } from '@/lib/supabase/client';
import type { Complaint } from '@/lib/types';

export function ComplaintsFeed({ initial }: { initial: Complaint[] }) {
  const [items, setItems] = useState<Complaint[]>(initial);

  useEffect(() => {
    const client = createClient();
    const channel = client
      .channel('complaints-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'complaints' },
        (payload) => {
          const row = payload.new as unknown as Complaint;
          setItems((prev) => [row, ...prev].slice(0, 20));
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'complaints' },
        (payload) => {
          const updated = payload.new as unknown as Complaint;
          setItems((prev) =>
            prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)),
          );
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Поки що скарг нема. Коли надійде перша — з&apos;явиться тут протягом 3 секунд.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 10).map((c) => (
        <Card key={c.id}>
          <CardContent className="flex items-start gap-3 py-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-xl">
              {c.category_id ? WASTE_CATEGORY_ICONS[c.category_id] : '⚠️'}
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">
                  {c.category_id
                    ? WASTE_CATEGORY_LABELS_UA[c.category_id]
                    : 'Звалище без категорії'}
                </span>
                <StatusBadge status={c.status} />
              </div>
              {c.description && (
                <p className="truncate text-xs text-muted-foreground">{c.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(c.created_at), { locale: uk, addSuffix: true })}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: Complaint['status'] }) {
  const map: Record<Complaint['status'], { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
    new: { label: 'Нова', variant: 'destructive' },
    assigned: { label: 'Призначено', variant: 'warning' },
    in_progress: { label: 'У роботі', variant: 'warning' },
    resolved: { label: 'Вирішено', variant: 'success' },
    rejected: { label: 'Відхилено', variant: 'secondary' },
  };
  const cfg = map[status];
  return (
    <Badge variant={cfg.variant} className="text-[10px] font-normal">
      {cfg.label}
    </Badge>
  );
}
