'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Home,
  Plus,
  Trash2,
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
  reportFullBin,
  submitComplaint,
  type SubmittedComplaint,
} from '@/lib/complaints-client';
import { palette, categoryStyle } from '@/components/design/tokens';
import { LocationPicker } from '@/components/location-picker';

type ReportType = 'illegal_dump' | 'full_bin';
type Stage = 'idle' | 'locating' | 'compressing' | 'submitting' | 'done';

const QUICK_TAGS = [
  'Будівельне сміття',
  'Стихійне звалище',
  'Переповнений контейнер',
  'Небезпечні відходи',
];

export function ReportForm() {
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stage, setStage] = useState<Stage>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [category, setCategory] = useState<WasteCategoryId | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState<SubmittedComplaint | null>(null);
  const [binReported, setBinReported] = useState(false);
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
    } catch {
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
      if (reportType === 'full_bin') {
        await reportFullBin({
          lat: location.lat,
          lng: location.lng,
          description: description.trim() || undefined,
        });
        setBinReported(true);
        setStage('done');
        toast.success('Бак відмічено як повний. Дякуємо!');
      } else {
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
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка надсилання.');
      setStage('idle');
    }
  }, [photoFile, location, description, category, reportType]);

  if (stage === 'done' && binReported) {
    return <BinReported />;
  }
  if (stage === 'done' && submitted) {
    return <ReportSubmitted complaint={submitted} />;
  }

  // Step 0: type selection
  if (reportType === null) {
    return <TypeSelector onSelect={setReportType} />;
  }

  const canNext = step === 1 ? photoFile !== null : step === 2 ? location !== null : true;
  const total = 3;

  return (
    <div className="tf-fade-slide flex flex-col gap-4">
      {/* Back to type selector */}
      <button
        type="button"
        onClick={() => {
          setReportType(null);
          setStep(1);
          setPreview(null);
          setPhotoFile(null);
          setLocation(null);
          setDescription('');
          setCategory(null);
        }}
        className="self-start text-[12px] font-semibold text-[color:var(--ink-mute)]"
      >
        ← Змінити тип
      </button>

      {/* Type badge */}
      <div
        className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-semibold"
        style={
          reportType === 'full_bin'
            ? { background: 'rgba(234,179,8,0.12)', color: '#713F12' }
            : { background: 'rgba(220,38,38,0.08)', color: '#7F1D1D' }
        }
      >
        {reportType === 'full_bin' ? (
          <><Trash2 className="size-3.5" strokeWidth={2.2} /> Повний бак</>
        ) : (
          <><AlertTriangle className="size-3.5" strokeWidth={2.2} /> Несанкціоноване звалище</>
        )}
      </div>

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
              border: preview ? 'none' : '2px dashed rgba(14,58,35,0.2)',
              color: preview ? '#fff' : 'var(--ink-mute)',
            }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Фото" className="size-full object-cover" />
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
          <LocationPicker
            value={location}
            onChange={setLocation}
            geolocate={fetchLocation}
            geolocating={stage === 'locating'}
          />
        </div>
      )}

      {/* STEP 3 — description + summary */}
      {step === 3 && (
        <div className="tf-fade-slide flex flex-col gap-4">
          <StepLabel n={3} label="Опис" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            placeholder={
              reportType === 'full_bin'
                ? 'Бак переповнений, сміття поруч із баком…'
                : 'Мішки з будівельним сміттям біля трансформатора…'
            }
            rows={5}
            className="w-full resize-none rounded-[20px] border border-[rgba(14,58,35,0.1)] bg-white p-4 text-sm leading-[1.5] text-[color:var(--ink)] outline-none"
          />

          {reportType === 'illegal_dump' && (
            <>
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
                  {"Категорія (необов’язково)"}
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
            </>
          )}

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
                  {reportType === 'full_bin' ? 'Повний бак' : 'Фото додано'}
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
            {reportType === 'full_bin' ? 'Відзначити бак' : 'Надіслати'}
            <ArrowRight className="size-[18px]" strokeWidth={2.2} />
          </>
        )}
      </button>
    </div>
  );
}

function TypeSelector({ onSelect }: { onSelect: (t: ReportType) => void }) {
  return (
    <div className="tf-fade-slide flex flex-col gap-4">
      <div
        className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Що ви побачили?
      </div>

      <button
        type="button"
        onClick={() => onSelect('illegal_dump')}
        className="flex items-start gap-4 rounded-[22px] border bg-white p-5 text-left transition-transform hover:-translate-y-0.5"
        style={{
          borderColor: 'rgba(220,38,38,0.2)',
          background: 'linear-gradient(165deg, rgba(220,38,38,0.04) 0%, #fff 100%)',
          boxShadow: 'var(--tf-shadow-sm)',
        }}
      >
        <div
          className="grid size-12 shrink-0 place-items-center rounded-[14px]"
          style={{ background: 'rgba(220,38,38,0.08)' }}
        >
          <AlertTriangle className="size-6 text-red-600" strokeWidth={1.8} />
        </div>
        <div>
          <div className="text-[16px] font-bold tracking-[-0.01em] text-[color:var(--green-deep)]">
            Несанкціоноване звалище
          </div>
          <p className="mt-1 text-[12.5px] leading-[1.5] text-[color:var(--ink-mute)]">
            Купа сміття, будівельні відходи, стихійне звалище — попадає до диспетчера як скарга.
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelect('full_bin')}
        className="flex items-start gap-4 rounded-[22px] border bg-white p-5 text-left transition-transform hover:-translate-y-0.5"
        style={{
          borderColor: 'rgba(234,179,8,0.25)',
          background: 'linear-gradient(165deg, rgba(234,179,8,0.05) 0%, #fff 100%)',
          boxShadow: 'var(--tf-shadow-sm)',
        }}
      >
        <div
          className="grid size-12 shrink-0 place-items-center rounded-[14px]"
          style={{ background: 'rgba(234,179,8,0.1)' }}
        >
          <Trash2 className="size-6 text-yellow-600" strokeWidth={1.8} />
        </div>
        <div>
          <div className="text-[16px] font-bold tracking-[-0.01em] text-[color:var(--green-deep)]">
            Повний бак на вулиці
          </div>
          <p className="mt-1 text-[12.5px] leading-[1.5] text-[color:var(--ink-mute)]">
            Вуличний контейнер переповнений — система відмічає бак і передає маршрутизатору.
          </p>
        </div>
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

function BinReported() {
  return (
    <div className="tf-fade-slide grid flex-1 place-items-center px-5 py-10">
      <div className="max-w-[320px] text-center">
        <div
          className="mx-auto mb-6 grid size-24 place-items-center rounded-full"
          style={{
            background: 'linear-gradient(165deg, #EAB308, #CA8A04)',
            boxShadow: '0 14px 40px -10px rgba(202,138,4,0.4)',
          }}
        >
          <Trash2 className="size-11 text-white" strokeWidth={1.8} />
        </div>
        <div
          className="text-[32px] font-normal tracking-[-0.03em] text-[color:var(--green-deep)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Бак відмічено
        </div>
        <p className="mt-2 text-[13px] leading-[1.5] text-[color:var(--ink-mute)]">
          Дякуємо! Маршрутизатор врахує цей бак у найближчому рейсі.
        </p>
        <Link
          href="/"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[18px] bg-[color:var(--green-pale)] px-[18px] py-3 text-sm font-semibold text-[color:var(--green-deep)]"
        >
          <Home className="size-4" strokeWidth={2} />
          На головну
        </Link>
      </div>
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
