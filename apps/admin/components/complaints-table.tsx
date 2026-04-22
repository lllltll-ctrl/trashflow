'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { toast } from 'sonner';
import { ImageOff, X } from 'lucide-react';
import { Badge, Button, Card, CardContent } from '@trashflow/ui';
import {
  WASTE_CATEGORIES,
  WASTE_CATEGORY_ICONS,
  WASTE_CATEGORY_LABELS_UA,
  type ComplaintStatus,
  type WasteCategoryId,
} from '@trashflow/db';
import { createClient } from '@/lib/supabase/client';
import type { Complaint } from '@/lib/types';

const STATUS_OPTIONS: Array<{ value: ComplaintStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Усі' },
  { value: 'new', label: 'Нові' },
  { value: 'assigned', label: 'Призначено' },
  { value: 'in_progress', label: 'У роботі' },
  { value: 'resolved', label: 'Вирішено' },
  { value: 'rejected', label: 'Відхилено' },
];

export function ComplaintsTable({ initial }: { initial: Complaint[] }) {
  const [rows, setRows] = useState<Complaint[]>(initial);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<WasteCategoryId | 'all'>('all');
  const [pending, setPending] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; caption: string } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (statusFilter === 'all' || r.status === statusFilter) &&
          (categoryFilter === 'all' || r.category_id === categoryFilter),
      ),
    [rows, statusFilter, categoryFilter],
  );

  const updateStatus = async (id: string, status: ComplaintStatus) => {
    setPending(id);
    const client = createClient();
    // The generated Supabase types route this correctly once `supabase db push`
    // + `pnpm db:types` run. Until then the manual stub in packages/db doesn't
    // satisfy postgrest-js's exact GenericTable shape, so we loosen the cast
    // for this single mutation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = client.from('complaints') as any;
    const { error } = await query.update({ status }).eq('id', id);
    setPending(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success('Статус оновлено');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setStatusFilter(o.value)}
              className={
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
                (statusFilter === o.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-accent')
              }
            >
              {o.label}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as WasteCategoryId | 'all')}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-xs"
        >
          <option value="all">Усі категорії</option>
          {WASTE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {WASTE_CATEGORY_ICONS[cat]} {WASTE_CATEGORY_LABELS_UA[cat]}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-muted-foreground">
          Показано: {filtered.length} з {rows.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Нема скарг за поточними фільтрами.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Фото</th>
                <th className="px-3 py-2 text-left">Категорія</th>
                <th className="px-3 py-2 text-left">Опис</th>
                <th className="px-3 py-2 text-left">Створено</th>
                <th className="px-3 py-2 text-left">Статус</th>
                <th className="px-3 py-2 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <PhotoThumb
                      url={c.photo_urls[0]}
                      caption={c.description ?? 'Без опису'}
                      onOpen={(url) => setLightbox({ url, caption: c.description ?? '' })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {c.category_id ? (
                      <span>
                        {WASTE_CATEGORY_ICONS[c.category_id]}{' '}
                        {WASTE_CATEGORY_LABELS_UA[c.category_id]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="max-w-[20rem] truncate px-3 py-2 text-muted-foreground">
                    {c.description ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-xs" title={format(new Date(c.created_at), 'dd.MM.yyyy HH:mm')}>
                    {formatDistanceToNow(new Date(c.created_at), { locale: uk, addSuffix: true })}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={statusToVariant(c.status)} className="text-[10px] font-normal">
                      {statusToLabel(c.status)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      {c.status === 'new' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending === c.id}
                          onClick={() => updateStatus(c.id, 'assigned')}
                        >
                          Взяти в роботу
                        </Button>
                      )}
                      {(c.status === 'assigned' || c.status === 'in_progress') && (
                        <Button
                          size="sm"
                          disabled={pending === c.id}
                          onClick={() => updateStatus(c.id, 'resolved')}
                        >
                          Закрити
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Фото скарги"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-background/20 p-2 text-white hover:bg-background/40"
            aria-label="Закрити"
          >
            <X className="size-5" aria-hidden />
          </button>
          <figure className="flex max-h-full max-w-4xl flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt={lightbox.caption || 'Фото скарги'}
              className="max-h-[80vh] w-auto rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {lightbox.caption && (
              <figcaption className="max-w-2xl text-center text-sm text-white/90">
                {lightbox.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}

function PhotoThumb({
  url,
  caption,
  onOpen,
}: {
  url: string | undefined;
  caption: string;
  onOpen: (url: string) => void;
}) {
  const [errored, setErrored] = useState(false);
  if (!url || errored) {
    return (
      <div
        className="flex size-12 items-center justify-center rounded bg-muted text-muted-foreground"
        aria-label={caption}
      >
        <ImageOff className="size-4" aria-hidden />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen(url)}
      className="block size-12 shrink-0 overflow-hidden rounded border transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Відкрити фото: ${caption}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        loading="lazy"
        onError={() => setErrored(true)}
        className="size-full object-cover"
      />
    </button>
  );
}

function statusToLabel(status: ComplaintStatus): string {
  return {
    new: 'Нова',
    assigned: 'Призначено',
    in_progress: 'У роботі',
    resolved: 'Вирішено',
    rejected: 'Відхилено',
  }[status];
}

function statusToVariant(
  status: ComplaintStatus,
): 'destructive' | 'warning' | 'success' | 'secondary' {
  switch (status) {
    case 'new':
      return 'destructive';
    case 'assigned':
    case 'in_progress':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'rejected':
      return 'secondary';
  }
}
