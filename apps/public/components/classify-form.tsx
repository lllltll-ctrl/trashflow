'use client';

import { useCallback, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, RotateCcw, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage } from '@/lib/compress';
import { classify, type ClassifyResult } from '@/lib/classify-client';
import { palette } from '@/components/design/tokens';
import { ClassifyResult as ClassifyResultView } from './classify-result';

type Stage = 'idle' | 'compressing' | 'uploading' | 'done';

export function ClassifyForm() {
  const [stage, setStage] = useState<Stage>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Потрібне фото. Оберіть файл-зображення.');
      return;
    }

    setResult(null);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setStage('compressing');
    let compressed: File;
    try {
      compressed = await compressImage(file);
    } catch (err) {
      console.error('compress error', err);
      toast.error('Не вдалося обробити фото. Спробуйте ще раз.');
      setStage('idle');
      return;
    }

    setStage('uploading');
    try {
      const response = await classify(compressed);
      setResult(response);
      setStage('done');
      if (response.stub) {
        toast.warning(
          'AI-сервіс зараз недоступний — це орієнтовний результат, перевірте власноруч.',
          { duration: 7000 },
        );
      }
    } catch (err) {
      console.error('classify error', err);
      toast.error(err instanceof Error ? err.message : 'Сервер класифікатора недоступний.', {
        action: { label: 'Повторити', onClick: () => handleFile(file) },
      });
      setStage('idle');
    }
  }, []);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    setStage('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
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
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {stage === 'idle' && !preview && (
        <>
          <CameraWindow onShoot={() => fileInputRef.current?.click()} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2.5 rounded-[22px] px-[22px] py-[15px] text-[15px] font-semibold tracking-[-0.01em] text-white transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(165deg, ${palette.greenLight} 0%, ${palette.greenMid} 100%)`,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.12), 0 10px 22px -10px rgba(14, 58, 35, 0.55)',
            }}
          >
            <Camera className="size-[18px]" strokeWidth={2} />
            Зробити фото
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[color:var(--green-pale)] px-[18px] py-3 text-sm font-semibold text-[color:var(--green-deep)]"
          >
            <ImageIcon className="size-[18px]" strokeWidth={2} />
            Завантажити з галереї
          </button>
          <p className="px-2 pt-1 text-center text-xs text-[color:var(--ink-mute)]">
            Фото обробляється локально та надсилається лише на наш сервер класифікації.
          </p>
        </>
      )}

      {(stage === 'compressing' || stage === 'uploading') && preview && (
        <ScanningState previewUrl={preview} label={stage === 'compressing' ? 'Стискаємо фото…' : 'Розпізнаємо…'} />
      )}

      {stage === 'done' && result && preview && (
        <div className="tf-fade-slide flex flex-col gap-3">
          <ClassifyResultView result={result} previewUrl={preview} />
          <button
            type="button"
            onClick={reset}
            className="flex w-full items-center justify-center gap-2.5 rounded-[22px] px-[22px] py-[15px] text-[15px] font-semibold tracking-[-0.01em] text-white transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(165deg, ${palette.greenLight} 0%, ${palette.greenMid} 100%)`,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.12), 0 10px 22px -10px rgba(14, 58, 35, 0.55)',
            }}
          >
            <RotateCcw className="size-[18px]" strokeWidth={2} />
            Спробувати інше фото
          </button>
        </div>
      )}
    </div>
  );
}

function CameraWindow({ onShoot }: { onShoot: () => void }) {
  return (
    <button
      type="button"
      onClick={onShoot}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px]"
      style={{
        background: 'linear-gradient(160deg, #0E3A23 0%, #185C38 100%)',
        boxShadow: 'var(--tf-shadow-lg)',
      }}
    >
      <div className="tf-grain absolute inset-0 opacity-20" />
      {/* Corner brackets */}
      {([
        { style: 'top-[18px] left-[18px] rotate-0' },
        { style: 'top-[18px] right-[18px] rotate-90' },
        { style: 'bottom-[18px] left-[18px] -rotate-90' },
        { style: 'bottom-[18px] right-[18px] rotate-180' },
      ] as const).map((b, i) => (
        <div key={i} className={`absolute size-[26px] ${b.style}`}>
          <div
            className="absolute left-0 top-0 h-[2px] w-[22px] rounded-[2px]"
            style={{ background: palette.yellow }}
          />
          <div
            className="absolute left-0 top-0 h-[22px] w-[2px] rounded-[2px]"
            style={{ background: palette.yellow }}
          />
        </div>
      ))}
      <div className="absolute inset-0 grid place-items-center px-6 text-center text-white/75">
        <div>
          <div
            className="mx-auto mb-3 grid size-[54px] place-items-center rounded-full border border-dashed border-white/35"
            style={{ color: palette.yellow }}
          >
            <Camera className="size-[22px]" strokeWidth={2} />
          </div>
          <div
            className="text-[20px] font-normal tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Наведіть камеру
          </div>
          <div className="mt-1 text-[12.5px] opacity-60">на обʼєкт у центрі кадру</div>
        </div>
      </div>
    </button>
  );
}

function ScanningState({ previewUrl, label }: { previewUrl: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-5 pt-5 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt="Ваше фото"
        className="aspect-square w-full rounded-[22px] object-cover opacity-80"
      />
      <div className="relative size-[120px]">
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(14,58,35,0.08)" strokeWidth="3" />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="var(--green-light)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="500"
            className="tf-ring-anim"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[color:var(--green-deep)]">
          <Leaf className="size-8" strokeWidth={1.6} />
        </div>
      </div>
      <div>
        <div
          className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--green-deep)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {label}
        </div>
        <div className="mt-1.5 text-[13px] text-[color:var(--ink-mute)]">
          Модель порівнює форму, колір, текстуру
        </div>
      </div>
    </div>
  );
}
