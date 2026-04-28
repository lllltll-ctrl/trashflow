'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  Loader2,
  Navigation,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { clientEnv } from '@/lib/env';
import { palette } from '@/components/design/tokens';

export type DriverRouteStop = {
  seq: number;
  binId: string;
  address: string | null;
  lat: number;
  lng: number;
  fillPct: number;
  kind: 'public' | 'household';
};

export type DriverRouteData = {
  id: string;
  vehicleLabel: string;
  plate: string;
  plannedFor: string;
  status: 'planned' | 'in_progress' | 'done' | 'cancelled';
  distanceM: number;
  durationS: number;
  stops: DriverRouteStop[];
  completedBinIds: string[];
};

export function DriverRoute({
  initial,
  token,
}: {
  initial: DriverRouteData;
  token: string;
}) {
  const [data, setData] = useState(initial);
  const [busyBin, setBusyBin] = useState<string | null>(null);

  const completed = new Set(data.completedBinIds);
  const remaining = data.stops.filter((s) => !completed.has(s.binId));
  const nextStop = remaining[0];

  const recordPickup = async (binId: string, sorted: boolean | null) => {
    setBusyBin(binId);
    try {
      const url = `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/record_pickup`;
      const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_driver_token: token,
          p_bin_id: binId,
          p_sorted: sorted,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body);
      }
      setData((prev) => ({
        ...prev,
        completedBinIds: [...prev.completedBinIds, binId],
      }));
      toast.success('Забір записано');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не вдалося записати');
    } finally {
      setBusyBin(null);
    }
  };

  const mapsUrl = useMemo(() => {
    if (data.stops.length === 0) return 'https://maps.google.com';
    const dest = data.stops[data.stops.length - 1]!;
    const waypoints = data.stops
      .slice(0, -1)
      .map((s) => `${s.lat},${s.lng}`)
      .join('|');
    const params = new URLSearchParams({
      api: '1',
      travelmode: 'driving',
      destination: `${dest.lat},${dest.lng}`,
    });
    if (waypoints) params.set('waypoints', waypoints);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [data.stops]);

  const nextStopMaps = nextStop
    ? `https://www.google.com/maps/search/?api=1&query=${nextStop.lat},${nextStop.lng}`
    : null;

  const distanceKm = (data.distanceM / 1000).toFixed(1);
  const durationMin = Math.round(data.durationS / 60);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(111,211,154,0.18), transparent 60%), var(--cream)',
      }}
    >
      <div className="mx-auto flex max-w-[480px] flex-col gap-3 px-4 pb-12 pt-5">
        {/* Header */}
        <header
          className="relative overflow-hidden rounded-[24px] px-5 py-5 text-white"
          style={{
            background: `linear-gradient(165deg, ${palette.greenLight} 0%, ${palette.greenMid} 100%)`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div
                className="text-[11px] uppercase tracking-[0.22em] opacity-70"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Маршрут на {new Date(data.plannedFor).toLocaleDateString('uk-UA')}
              </div>
              <div
                className="mt-1.5 text-[26px] font-normal leading-[1.05] tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {data.vehicleLabel}
              </div>
              <div
                className="mt-0.5 text-[12px] opacity-75"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {data.plate}
              </div>
            </div>
            <div
              className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-white/15"
              aria-hidden
            >
              <Truck className="size-6" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[13px]">
            <Stat label="Зупинок" value={`${data.stops.length}`} />
            <Stat label="Виконано" value={`${data.completedBinIds.length}`} />
            <Stat label="Дистанція" value={`${distanceKm} км`} />
            <Stat label="Орієнтовно" value={`~${durationMin} хв`} />
          </div>
        </header>

        {/* Big actions */}
        <div className="grid gap-2.5">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3.5 text-[14px] font-bold text-[color:var(--green-deep)] shadow-[var(--tf-shadow-sm)]"
          >
            <span className="flex items-center gap-2">
              <Navigation className="size-[18px]" strokeWidth={2.2} />
              Відкрити весь маршрут у Google Maps
            </span>
            <ArrowRight className="size-4" />
          </a>
          {nextStop && nextStopMaps && (
            <a
              href={nextStopMaps}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-[18px] px-4 py-3.5 text-[14px] font-bold text-white shadow-[var(--tf-shadow-md)]"
              style={{ background: palette.greenDeep }}
            >
              <span>
                Наступна зупинка #{nextStop.seq}
                <span className="ml-2 text-xs opacity-70">{nextStop.address ?? '—'}</span>
              </span>
              <ArrowRight className="size-5" />
            </a>
          )}
        </div>

        {/* Stop list */}
        <div className="mt-2 flex flex-col gap-2.5">
          {data.stops.map((s) => {
            const isDone = completed.has(s.binId);
            const isNext = nextStop?.binId === s.binId;
            const stopMapsUrl = `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
            return (
              <div
                key={s.binId}
                className="rounded-[18px] border bg-white p-3.5"
                style={{
                  borderColor: isNext
                    ? 'rgba(255,210,63,0.5)'
                    : 'rgba(14,58,35,0.06)',
                  background: isNext
                    ? 'linear-gradient(165deg, #FFFCEB 0%, #FFFFFF 60%)'
                    : '#fff',
                  opacity: isDone ? 0.55 : 1,
                  boxShadow: 'var(--tf-shadow-sm)',
                }}
              >
                <div className="flex gap-3">
                  <div
                    className="grid size-9 shrink-0 place-items-center rounded-[12px] text-sm font-bold"
                    style={{
                      background: isDone
                        ? 'var(--green-light)'
                        : isNext
                          ? palette.yellow
                          : 'var(--green-pale)',
                      color: isDone || isNext ? palette.greenDeep : 'var(--green-deep)',
                    }}
                  >
                    {isDone ? <Check className="size-4" strokeWidth={2.4} /> : s.seq}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold tracking-[-0.01em] text-[color:var(--green-deep)]">
                      {s.address ?? 'Без адреси'}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-[color:var(--ink-mute)]">
                      <span>{s.kind === 'household' ? 'приватний' : 'публічний'}</span>
                      <span>·</span>
                      <span>заповнення {s.fillPct}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-2 border-t pt-2.5"
                  style={{ borderTop: '1px dashed rgba(14,58,35,0.08)' }}
                >
                  <a
                    href={stopMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-[10px] bg-[color:var(--green-pale)] px-2.5 py-1.5 text-[12px] font-semibold text-[color:var(--green-deep)]"
                  >
                    <Navigation className="size-3.5" strokeWidth={2.2} />
                    Карта
                  </a>
                  {isDone ? (
                    <span className="ml-auto text-[12px] font-semibold text-[color:var(--green-light)]">
                      ✓ Забрав
                    </span>
                  ) : s.kind === 'household' ? (
                    <div className="ml-auto flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => recordPickup(s.binId, true)}
                        disabled={busyBin === s.binId}
                        className="inline-flex items-center gap-1.5 rounded-[10px] bg-[color:var(--green-light)] px-2.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
                      >
                        {busyBin === s.binId ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5" strokeWidth={2.4} />
                        )}
                        Сорт.
                      </button>
                      <button
                        type="button"
                        onClick={() => recordPickup(s.binId, false)}
                        disabled={busyBin === s.binId}
                        className="inline-flex items-center gap-1.5 rounded-[10px] bg-[color:var(--ink-soft)] px-2.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
                      >
                        Без сорт.
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => recordPickup(s.binId, null)}
                      disabled={busyBin === s.binId}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-[10px] bg-[color:var(--green-deep)] px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
                    >
                      {busyBin === s.binId ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" strokeWidth={2.4} />
                      )}
                      Забрав
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {data.stops.length === 0 && (
          <div className="rounded-[18px] bg-white p-6 text-center text-sm text-[color:var(--ink-mute)] shadow-[var(--tf-shadow-sm)]">
            На сьогодні зупинок немає. Гарного дня! 🚛
          </div>
        )}

        <footer className="mt-2 flex items-center justify-center gap-1 text-[10.5px] text-[color:var(--ink-mute)]">
          <Clock className="size-3" />
          Оновлено в реальному часі — диспетчер бачить ваш прогрес
        </footer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-white/15 px-2.5 py-1.5">
      <div
        className="text-[9.5px] uppercase tracking-[0.16em] opacity-70"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </div>
      <div className="mt-0.5 text-[15px] font-bold tracking-[-0.01em]">{value}</div>
    </div>
  );
}
