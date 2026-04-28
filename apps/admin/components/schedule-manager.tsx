'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Spinner,
} from '@trashflow/ui';
import {
  DAY_OF_WEEK_LABELS_UA,
  WASTE_CATEGORIES,
  WASTE_CATEGORY_ICONS,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import { createClient } from '@/lib/supabase/client';
import type { PickupSchedule } from '@/lib/schedules';

type Draft = {
  district: string;
  day_of_week: number;
  time_window: string;
  waste_kinds: Set<WasteCategoryId>;
  notes: string;
};

const EMPTY_DRAFT: Draft = {
  district: '',
  day_of_week: 1,
  time_window: '07:00–09:00',
  waste_kinds: new Set(['plastic']),
  notes: '',
};

// TODO(types): drop the `as any` once `pnpm exec supabase gen types typescript --linked`
// replaces packages/db/src/types.gen.ts with a generated GenericTable shape.
const pickupSchedulesTable = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createClient().from('pickup_schedules') as any;

export function ScheduleManager({
  initial,
  communityId,
}: {
  initial: PickupSchedule[];
  communityId: string;
}) {
  const [rows, setRows] = useState<PickupSchedule[]>(initial);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busyId, setBusyId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, PickupSchedule[]>();
    for (const row of rows) {
      const list = map.get(row.district) ?? [];
      list.push(row);
      map.set(row.district, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'uk'));
  }, [rows]);

  const remove = async (row: PickupSchedule) => {
    if (!confirm(`Видалити графік "${row.district}, ${dayLabel(row.day_of_week)}"?`)) return;
    setBusyId(row.id);
    const { error } = await pickupSchedulesTable().delete().eq('id', row.id);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    toast.success('Графік видалено');
  };

  const save = async () => {
    if (!draft.district.trim()) {
      toast.error('Назва району обовʼязкова');
      return;
    }
    if (!draft.time_window.trim()) {
      toast.error('Вкажіть часовий проміжок');
      return;
    }
    if (draft.waste_kinds.size === 0) {
      toast.error('Оберіть хоч одну категорію');
      return;
    }

    setBusyId('new');
    const payload = {
      community_id: communityId,
      district: draft.district.trim(),
      day_of_week: draft.day_of_week,
      time_window: draft.time_window.trim(),
      waste_kinds: Array.from(draft.waste_kinds),
      notes: draft.notes.trim() || null,
      is_active: true,
    };
    const { data, error } = await pickupSchedulesTable()
      .insert(payload)
      .select('id, community_id, district, day_of_week, time_window, waste_kinds, notes, is_active')
      .single();
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data) {
      toast.error('Сервер не повернув новий запис');
      return;
    }
    setRows((prev) => [data as PickupSchedule, ...prev]);
    setDraft(EMPTY_DRAFT);
    setAdding(false);
    toast.success('Графік додано');
  };

  const toggleCategory = (cat: WasteCategoryId) => {
    setDraft((prev) => {
      const next = new Set(prev.waste_kinds);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return { ...prev, waste_kinds: next };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          <strong className="text-foreground">{rows.length}</strong> графіків у{' '}
          <strong className="text-foreground">{grouped.length}</strong> районах
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)} size="sm">
            <Plus className="size-4" aria-hidden /> Додати графік
          </Button>
        )}
      </div>

      {adding && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-base">Новий графік вивозу</CardTitle>
            <CardDescription>
              Один рядок = один день тижня для одного району. Багатоденні графіки створюйте
              окремими записами — це спрощує редагування.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Район">
                <input
                  type="text"
                  value={draft.district}
                  onChange={(e) => setDraft((d) => ({ ...d, district: e.target.value }))}
                  placeholder="мікрорайон Дружби"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field label="День тижня">
                <select
                  value={draft.day_of_week}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, day_of_week: Number(e.target.value) }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {DAY_OF_WEEK_LABELS_UA.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day.full}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Час (формат «07:00–09:00»)">
                <input
                  type="text"
                  value={draft.time_window}
                  onChange={(e) => setDraft((d) => ({ ...d, time_window: e.target.value }))}
                  placeholder="07:00–09:00"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Примітка (необовʼязково)">
                <input
                  type="text"
                  value={draft.notes}
                  onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                  placeholder="Контейнер біля підʼїзду"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
            </div>
            <Field label="Що вивозять">
              <div className="flex flex-wrap gap-2">
                {WASTE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
                      (draft.waste_kinds.has(cat)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-accent')
                    }
                  >
                    {WASTE_CATEGORY_ICONS[cat]} {WASTE_CATEGORY_LABELS_UA[cat]}
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={busyId !== null}>
                {busyId ? <Spinner label="Зберігаю…" /> : 'Створити'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAdding(false);
                  setDraft(EMPTY_DRAFT);
                }}
              >
                Скасувати
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Графіків ще немає. Додайте перший.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {grouped.map(([district, items]) => (
            <Card key={district}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{district}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {items.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background/50 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="secondary" className="font-normal">
                        {dayLabel(row.day_of_week)}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {row.time_window}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {row.waste_kinds.map((kind) => (
                          <Badge key={kind} variant="outline" className="text-[10px] font-normal">
                            {WASTE_CATEGORY_ICONS[kind as WasteCategoryId] ?? '•'}{' '}
                            {WASTE_CATEGORY_LABELS_UA[kind as WasteCategoryId] ?? kind}
                          </Badge>
                        ))}
                      </div>
                      {row.notes && (
                        <span className="text-xs italic text-muted-foreground">{row.notes}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(row)}
                      disabled={busyId === row.id}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                      Видалити
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function dayLabel(idx: number): string {
  return DAY_OF_WEEK_LABELS_UA[idx]?.full ?? '—';
}
