'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Crosshair,
  Home,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@trashflow/ui';
import {
  WASTE_CATEGORIES,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import { compressImage } from '@/lib/compress';
import {
  getBrowserLocation,
  submitComplaint,
  type SubmittedComplaint,
} from '@/lib/complaints-client';
import { palette, categoryStyle } from '@/components/design/tokens';

type Stage = 'idle' | 'locating' | 'compressing' | 'submitting' | 'done';

const QUICK_TAGS = [
  'Будівельне сміття',
  'Стихійне звалище',
  'Переповнений контейнер',
  'Небезпечні відходи',
];

export function ReportForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stage, setStage] = useState<Stage>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [category, setCategory] = useState<WasteCategoryId | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState<SubmittedComplaint | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Потрібне фото. Оберіть файл-зображення.');
      return;
    }
    setStage('compressing');
    try {
      const compressed = await compressImage(file);
      setPhotoFile(compressed);
      setPreview(URL.createObjectURL(compressed));
      setStage('idle');
    } catch (err) {
      console.error('compress error', err);
      toast.error('Не вдалося обробити фото.');
      setStage('idle');
    }
  }, []);

  const fetchLocation = useCallback(async () => {
    setStage('locating');
    try {
      const loc = await getBrowserLocation();
      setLocation(loc);
      setStage('idle');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка геолокації.');
      setStage('idle');
    }
  }, []);

  const submit = useCallback(async () => {
    if (!photoFile || !location) return;
    setStage('submitting');
    try {
      const result = await submitComplaint({
        photo: photoFile,
        lat: location.lat,
        lng: location.lng,
        description: description.trim() || undefined,
        category: category ?? undefined,
      });
      setSubmitted(result);
      setStage('done');
      toast.success('Скаргу прийнято. Диспетчер уже її бачить.');
    } catch (err) {
      console.error('submit error', err);
      toast.error(err instanceof Error ? err.message : 'Помилка надсилання.');
      setStage('idle');
    }
  }, [photoFile, location, description, category]);

  if (stage === 'done' && submitted) {
    return <ReportSubmitted complaint={submitted} />;
  }

  const canNext = step === 1 ? photoFile !== null : step === 2 ? location !== null : true;
  const total = 3;

  return (
    <div className="tf-fade-slide flex flex-col gap-4">
      {/* Progress */}
      <div
        className="flex items-center gap-3 rounded-[14px] px-4 py-3"
        style={{ background: 'var(--green-pale)' }}
      >
        <div
          className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--green-deep)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Крок {step}/{total}
        </div>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(14,58,35,0.1)]">
          <div
            className="h-full bg-[color:var(--green-light)] transition-all duration-300"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* STEP 1 — photo */}
      {step === 1 && (
        <div className="tf-fade-slide flex flex-col gap-3">
          <StepLabel n={1} label="Фото" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={stage === 'compressing'}
            className="grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-[24px] transition-all"
            style={{
              background: preview
                ? 'transparent'
                : 'repeating-linear-gradient(45deg, rgba(14,58,35,0.05) 0 10px, rgba(14,58,35,0.02) 10px 20px)',
              border: preview
                ? 'none'
                : '2px dashed rgba(14,58,35,0.2)',
              color: preview ? '#fff' : 'var(--ink-mute)',
            }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Фото звалища" className="size-full object-cover" />
            ) : stage === 'compressing' ? (
              <Spinner label="Обробляю фото…" />
            ) : (
              <div className="text-center">
                <Camera
                  className="mx-auto size-9 text-[color:var(--green-light)]"
                  strokeWidth={1.8}
                />
                <div
                  className="mt-2 text-xs uppercase tracking-[0.1em]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Натисніть, щоб зняти
                </div>
              </div>
            )}
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="self-center text-xs font-semibold text-[color:var(--green-deep)]"
            >
              Замінити фото
            </button>
          )}
        </div>
      )}

      {/* STEP 2 — location */}
      {step === 2 && (
        <div className="tf-fade-slide flex flex-col gap-3">
          <StepLabel n={2} label="Локація" />
          <div
            className="relative h-[260px] overflow-hidden rounded-[24px] border border-[rgba(14,58,35,0.08)]"
            style={{
              background: `radial-gradient(ellipse 60% 40% at 30% 30%, rgba(111,211,154,0.35) 0%, transparent 70%), linear-gradient(165deg, #E8F5EC 0%, #F4F9F1 100%)`,
            }}
          >
            <svg
              viewBox="0 0 400 260"
              className="absolute inset-0 size-full"
              preserveAspectRatio="none"
            >
              <g stroke="rgba(14,58,35,0.12)" strokeWidth="1.5" fill="none">
                <path d="M-10 90 Q 100 70 200 100 T 410 120" />
                <path d="M-10 160 Q 150 140 260 170 T 410 190" />
                <path d="M80 -10 Q 100 100 110 270" />
                <path d="M230 -10 Q 240 100 255 270" />
              </g>
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <div
                className="grid size-11 place-items-center rounded-[50%_50%_50%_2px] border-[3px] border-white"
                style={{
                  background: location ? 'var(--green-light)' : palette.yellow,
                  transform: 'rotate(-45deg)',
                  boxShadow: '0 8px 20px -4px rgba(0,0,0,0.35)',
                }}
              >
                <div
                  className="size-2.5 rounded-full bg-white"
                  style={{ transform: 'rotate(45deg)' }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={fetchLocation}
              disabled={stage === 'locating'}
              className="absolute inset-x-3.5 bottom-3.5 flex items-center justify-center gap-2 rounded-[14px] bg-white/95 px-4 py-3 text-[13px] font-bold text-[color:var(--green-deep)] backdrop-blur"
            >
              {stage === 'locating' ? (
                <Spinner label="Визначаю…" />
              ) : location ? (
                <>
                  <Check className="size-4" strokeWidth={2.4} /> Локацію зафіксовано
                </>
              ) : (
                <>
                  <Crosshair className="size-4" strokeWidth={2} /> Використати моє місце
                </>
              )}
            </button>
          </div>

          {location && (
            <div
              className="tf-fade-slide flex items-center gap-3 rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white px-4 py-3"
              style={{ boxShadow: 'var(--tf-shadow-sm)' }}
            >
              <div className="size-2 rounded-full bg-[color:var(--green-light)]" />
              <div
                className="text-xs tracking-[0.08em] text-[color:var(--ink-soft)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
              <div className="ml-auto text-xs text-[color:var(--ink-mute)]">±5м</div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3 — description + category + summary */}
      {step === 3 && (
        <div className="tf-fade-slide flex flex-col gap-4">
          <StepLabel n={3} label="Опис" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            placeholder="Мішки з будівельним сміттям біля трансформатора…"
            rows={5}
            className="w-full resize-none rounded-[20px] border border-[rgba(14,58,35,0.1)] bg-white p-4 text-sm leading-[1.5] text-[color:var(--ink)] outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setDescription((prev) =>
                    prev ? `${prev}, ${tag.toLowerCase()}` : tag,
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(14,58,35,0.15)] bg-transparent px-3 py-2 text-[12.5px] font-semibold text-[color:var(--ink-soft)]"
              >
                <Plus className="size-3" strokeWidth={2.4} />
                {tag}
              </button>
            ))}
          </div>

          <div>
            <div
              className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Категорія (необов'язково)
            </div>
            <div className="flex flex-wrap gap-2">
              {WASTE_CATEGORIES.map((cat) => {
                const s = categoryStyle[cat];
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory((prev) => (prev === cat ? null : cat))}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                    style={{
                      background: active ? s.color : 'rgba(14,58,35,0.05)',
                      color: active ? '#fff' : 'var(--ink-soft)',
                      borderColor: active ? s.color : 'transparent',
                    }}
                  >
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ background: active ? '#fff' : s.color }}
                    />
                    {WASTE_CATEGORY_LABELS_UA[cat]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div
            className="rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white p-4"
            style={{ boxShadow: 'var(--tf-shadow-sm)' }}
          >
            <div
              className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Перегляд
            </div>
            <div className="flex items-center gap-3 py-2">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Мініатюра"
                  className="size-12 shrink-0 rounded-[12px] object-cover"
                />
              ) : (
                <div className="size-12 shrink-0 rounded-[12px] bg-[rgba(14,58,35,0.05)]" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-[color:var(--ink)]">
                  Фото додано
                </div>
                <div
                  className="mt-0.5 text-[11.5px] text-[color:var(--ink-mute)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {location
                    ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)} · ±5м`
                    : '—'}
                </div>
              </div>
              <Check
                className="size-5 text-[color:var(--green-light)]"
                strokeWidth={2.4}
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!canNext || stage !== 'idle'}
        onClick={() => {
          if (step < 3) setStep(((step + 1) as 1 | 2 | 3));
          else submit();
        }}
        className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-[22px] px-[22px] py-[15px] text-[15px] font-semibold tracking-[-0.01em] text-white transition-all"
        style={{
          background: `linear-gradient(165deg, ${palette.greenLight} 0%, ${palette.greenMid} 100%)`,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.12), 0 10px 22px -10px rgba(14, 58, 35, 0.55)',
          opacity: !canNext || stage !== 'idle' ? 0.4 : 1,
          pointerEvents: !canNext || stage !== 'idle' ? 'none' : 'auto',
        }}
      >
        {stage === 'submitting' ? (
          <Spinner label="Надсилаю…" />
        ) : step < 3 ? (
          <>
            Далі
            <ArrowRight className="size-[18px]" strokeWidth={2.2} />
          </>
        ) : (
          <>
            Надіслати
            <ArrowRight className="size-[18px]" strokeWidth={2.2} />
          </>
        )}
      </button>
    </div>
  );
}

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div
      className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {n} · {label}
    </div>
  );
}

function ReportSubmitted({ complaint }: { complaint: SubmittedComplaint }) {
  return (
    <div className="tf-fade-slide grid flex-1 place-items-center px-5 py-10">
      <div className="max-w-[320px] text-center">
        <div
          className="mx-auto mb-6 grid size-24 place-items-center rounded-full text-white"
          style={{
            background: `linear-gradient(165deg, ${palette.greenLight}, ${palette.greenMid})`,
            boxShadow: '0 14px 40px -10px rgba(14,58,35,0.35)',
          }}
        >
          <CheckCircle2 className="size-12" strokeWidth={1.8} />
        </div>
        <div
          className="text-[32px] font-normal tracking-[-0.03em] text-[color:var(--green-deep)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Скаргу прийнято
        </div>
        <p className="mt-2 text-[13px] leading-[1.5] text-[color:var(--ink-mute)]">
          Диспетчер отримав вашу скаргу. Орієнтовний час реагування — 48 годин.
        </p>

        <div
          className="mt-6 flex items-center justify-between gap-2.5 rounded-[16px] px-4 py-3.5 text-left"
          style={{ background: 'var(--green-pale)' }}
        >
          <div>
            <div
              className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Номер скарги
            </div>
            <div
              className="mt-0.5 text-[15px] font-bold text-[color:var(--green-deep)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              TF-{complaint.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <div
            className="text-[11px] text-[color:var(--ink-mute)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {formatDate(complaint.created_at)}
          </div>
        </div>

        <Link
          href="/"
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-[18px] bg-[color:var(--green-pale)] px-[18px] py-3 text-sm font-semibold text-[color:var(--green-deep)]"
        >
          <Home className="size-4" strokeWidth={2} />
          На головну
        </Link>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}
