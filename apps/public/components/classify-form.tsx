'use client';

import { useCallback, useRef, useState } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Spinner } from '@trashflow/ui';
import { compressImage } from '@/lib/compress';
import { classify, type ClassifyResult } from '@/lib/classify-client';
import { ClassifyResult as ClassifyResultView } from './classify-result';

type Stage = 'idle' | 'compressing' | 'uploading' | 'done';

export function ClassifyForm() {
  const [stage, setStage] = useState<Stage>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  return (
    <div className="space-y-4">
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

      {preview ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Ваше фото"
            className="aspect-square w-full rounded-lg object-cover"
          />
          {stage === 'compressing' && <Spinner label="Стискаю фото…" />}
          {stage === 'uploading' && <Spinner label="Розпізнаю категорію…" />}
          {stage === 'done' && result && (
            <>
              <ClassifyResultView result={result} />
              <Button variant="outline" size="lg" className="w-full" onClick={reset}>
                <RotateCcw className="size-4" /> Ще одне фото
              </Button>
            </>
          )}
        </div>
      ) : (
        <Button
          size="lg"
          className="h-36 w-full flex-col gap-2 text-base"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="size-8" aria-hidden />
          Зробити фото
        </Button>
      )}

      {!preview && (
        <p className="text-center text-xs text-muted-foreground">
          Фото обробляється локально та надсилається лише на наш сервер класифікації.
        </p>
      )}
    </div>
  );
}
