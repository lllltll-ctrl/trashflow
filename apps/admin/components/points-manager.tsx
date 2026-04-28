'use client';

import { useMemo, useState } from 'react';
import { Check, Edit2, MapPin, Plus, Trash2, X } from 'lucide-react';
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
  PRYLUKY_CENTER,
  PRYLUKY_COMMUNITY_ID,
  WASTE_CATEGORIES,
  WASTE_CATEGORY_ICONS,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import { createClient } from '@/lib/supabase/client';
import type { CollectionPoint } from '@/lib/points';

type DraftPoint = {
  name: string;
  address: string;
  lat: string;
  lng: string;
  accepts: Set<WasteCategoryId>;
};

const EMPTY_DRAFT: DraftPoint = {
  name: '',
  address: '',
  lat: PRYLUKY_CENTER.lat.toString(),
  lng: PRYLUKY_CENTER.lng.toString(),
  accepts: new Set(['plastic']),
};

export function PointsManager({ initial }: { initial: CollectionPoint[] }) {
  const [points, setPoints] = useState<CollectionPoint[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<DraftPoint>(EMPTY_DRAFT);
  const [busyId, setBusyId] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      total: points.length,
      active: points.filter((p) => p.is_active).length,
    }),
    [points],
  );

  const resetDraft = () => {
    setDraft(EMPTY_DRAFT);
    setAdding(false);
    setEditingId(null);
  };

  const startEdit = (p: CollectionPoint) => {
    setEditingId(p.id);
    setAdding(false);
    setDraft({
      name: p.name,
      address: p.address ?? '',
      lat: p.lat?.toString() ?? '',
      lng: p.lng?.toString() ?? '',
      accepts: new Set(p.accepts.filter((c): c is WasteCategoryId =>
        (WASTE_CATEGORIES as ReadonlyArray<string>).includes(c),
      )),
    });
  };

  // TODO(types): drop the casts after `pnpm exec supabase gen types typescript --linked`
  // replaces packages/db/src/types.gen.ts. The hand-written shim doesn't
  // fully satisfy postgrest-js's GenericTable contract for Update/Insert overloads.
  const collectionPointsTable = () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createClient().from('collection_points') as any;

  const toggleActive = async (p: CollectionPoint) => {
    setBusyId(p.id);
    const { error } = await collectionPointsTable()
      .update({ is_active: !p.is_active })
      .eq('id', p.id);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPoints((prev) =>
      prev.map((row) => (row.id === p.id ? { ...row, is_active: !p.is_active } : row)),
    );
    toast.success(p.is_active ? 'Точку вимкнено' : 'Точку увімкнено');
  };

  const remove = async (p: CollectionPoint) => {
    if (!confirm(`Видалити точку "${p.name}"? Скасувати не можна.`)) return;
    setBusyId(p.id);
    const { error } = await collectionPointsTable().delete().eq('id', p.id);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPoints((prev) => prev.filter((row) => row.id !== p.id));
    toast.success('Точку видалено');
  };

  const save = async () => {
    if (!draft.name.trim()) {
      toast.error('Назва обов’язкова');
      return;
    }
    if (draft.accepts.size === 0) {
      toast.error('Оберіть хоч одну категорію');
      return;
    }
    const lat = Number(draft.lat);
    const lng = Number(draft.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error('Координати — числа');
      return;
    }

    setBusyId(editingId ?? 'new');
    const payload = {
      name: draft.name.trim(),
      address: draft.address.trim() || null,
      accepts: Array.from(draft.accepts),
      location: `SRID=4326;POINT(${lng} ${lat})`,
      is_active: true,
    };

    if (editingId) {
      // Use the update_collection_point RPC: same server-side validation /
      // role check / numeric coordinates as the create RPC. This drops the
      // last client-side `SRID=4326;POINT(...)` WKT concatenation in the app.
      const client = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rpc = client.rpc as any;
      const { data, error } = await rpc('update_collection_point', {
        p_id: editingId,
        p_lat: lat,
        p_lng: lng,
        p_name: payload.name,
        p_address: payload.address,
        p_accepts: payload.accepts,
      });
      setBusyId(null);
      if (error) {
        toast.error(error.message);
        return;
      }
      const updated = (data ?? [])[0];
      if (!updated) {
        toast.error('Сервер не повернув оновлений запис');
        return;
      }
      setPoints((prev) =>
        prev.map((row) =>
          row.id === editingId
            ? {
                ...row,
                name: updated.name,
                address: updated.address,
                accepts: updated.accepts as typeof payload.accepts,
                is_active: updated.is_active,
                lat: updated.lat,
                lng: updated.lng,
              }
            : row,
        ),
      );
      toast.success('Точку оновлено');
    } else {
      // Use the create_collection_point RPC instead of a direct insert: it
      // (1) resolves community_id server-side from the caller's profile —
      // dropping the hardcoded PRYLUKY_COMMUNITY_ID, (2) builds the geography
      // from numeric lat/lng instead of a client-concatenated WKT string,
      // (3) validates lat/lng range and role inside the function.
      const client = createClient();
      // TODO(types): drop the cast after `pnpm exec supabase gen types typescript --linked`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rpc = client.rpc as any;
      const { data, error } = await rpc('create_collection_point', {
        p_lat: lat,
        p_lng: lng,
        p_name: payload.name,
        p_address: payload.address,
        p_accepts: payload.accepts,
        p_schedule: null,
      });
      setBusyId(null);
      if (error) {
        toast.error(error.message);
        return;
      }
      const row = (data ?? [])[0];
      if (!row) {
        toast.error('Сервер не повернув новий запис');
        return;
      }
      setPoints((prev) => [
        {
          id: row.id,
          community_id: PRYLUKY_COMMUNITY_ID, // RPC scopes this server-side; UI keeps a copy for filtering.
          name: row.name,
          address: row.address,
          accepts: row.accepts as typeof payload.accepts,
          schedule: null,
          is_active: row.is_active,
          lat: row.lat,
          lng: row.lng,
          created_at: row.created_at,
        },
        ...prev,
      ]);
      toast.success('Точку додано');
    }
    resetDraft();
  };

  const toggleCategory = (cat: WasteCategoryId) => {
    setDraft((prev) => {
      const next = new Set(prev.accepts);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return { ...prev, accepts: next };
    });
  };

  const isEditing = (id: string) => editingId === id;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          <strong className="text-foreground">{stats.active}</strong> активних /{' '}
          <strong className="text-foreground">{stats.total}</strong> усього
        </div>
        {!adding && !editingId && (
          <Button onClick={() => setAdding(true)} size="sm">
            <Plus className="size-4" aria-hidden />
            Додати точку
          </Button>
        )}
      </div>

      {(adding || editingId) && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Редагувати точку' : 'Нова точка збору'}
            </CardTitle>
            <CardDescription>
              Координати можна взяти з Google Maps: правий клік на мапі → клацни по широті/довготі.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <LabeledInput
                label="Назва"
                value={draft.name}
                onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
                placeholder="Пункт прийому ПЕТ — вул. Київська"
              />
              <LabeledInput
                label="Адреса"
                value={draft.address}
                onChange={(v) => setDraft((d) => ({ ...d, address: v }))}
                placeholder="вул. Київська, 78"
              />
              <LabeledInput
                label="Широта (lat)"
                value={draft.lat}
                onChange={(v) => setDraft((d) => ({ ...d, lat: v }))}
                placeholder="50.5942"
              />
              <LabeledInput
                label="Довгота (lng)"
                value={draft.lng}
                onChange={(v) => setDraft((d) => ({ ...d, lng: v }))}
                placeholder="32.3874"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Що приймає
              </p>
              <div className="flex flex-wrap gap-2">
                {WASTE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
                      (draft.accepts.has(cat)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-accent')
                    }
                  >
                    {WASTE_CATEGORY_ICONS[cat]} {WASTE_CATEGORY_LABELS_UA[cat]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={busyId !== null}>
                {busyId ? <Spinner label="Зберігаю…" /> : editingId ? 'Зберегти зміни' : 'Створити'}
              </Button>
              <Button variant="outline" onClick={resetDraft}>
                Скасувати
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {points.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Точок збору немає. Додайте першу.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {points.map((p) => (
            <Card
              key={p.id}
              className={isEditing(p.id) ? 'border-primary/50' : p.is_active ? '' : 'opacity-60'}
            >
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{p.name}</h3>
                    {!p.is_active && (
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        вимкнено
                      </Badge>
                    )}
                  </div>
                  {p.address && (
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden />
                      {p.address}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {p.accepts.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs font-normal">
                        {WASTE_CATEGORY_ICONS[cat as WasteCategoryId] ?? '•'}{' '}
                        {WASTE_CATEGORY_LABELS_UA[cat as WasteCategoryId] ?? cat}
                      </Badge>
                    ))}
                  </div>
                  {p.lat !== null && p.lng !== null && (
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Button
                    size="sm"
                    variant={p.is_active ? 'outline' : 'default'}
                    onClick={() => toggleActive(p)}
                    disabled={busyId === p.id}
                    title={p.is_active ? 'Вимкнути для мешканців' : 'Увімкнути для мешканців'}
                  >
                    {p.is_active ? <X className="size-3.5" /> : <Check className="size-3.5" />}
                    {p.is_active ? 'Вимкнути' : 'Увімкнути'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(p)}
                    disabled={busyId === p.id}
                  >
                    <Edit2 className="size-3.5" />
                    Редагувати
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(p)}
                    disabled={busyId === p.id}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Видалити
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}
