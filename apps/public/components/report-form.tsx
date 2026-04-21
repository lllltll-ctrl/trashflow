'use client';

import { useCallback, useRef, useState } from 'react';
import { Camera, CheckCircle2, MapPin } from 'lucide-react';
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
  WASTE_CATEGORIES,
  WASTE_CATEGORY_ICONS,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import { compressImage } from '@/lib/compress';
import {
  getBrowserLocation,
  submitComplaint,
  type SubmittedComplaint,
} from '@/lib/complaints-client';

type Stage = 'idle' | 'locating' | 'compressing' | 'submitting' | 'done';

export function ReportForm() {
  const [stage, setStage] = useState<Stage>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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

  const submit = useCallback(async () => {
    if (!photoFile) {
      toast.error('Додайте фото перед надсиланням.');
      return;
    }

    setStage('locating');
    let location: { lat: number; lng: number };
    try {
      location = await getBrowserLocation();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка геолокації.');
      setStage('idle');
      return;
    }

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
  }, [photoFile, description, category]);

  if (stage === 'done' && submitted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-8" aria-hidden />
          </div>
          <CardTitle>Скаргу прийнято</CardTitle>
          <CardDescription>№ {submitted.id.slice(0, 8)} · {formatDate(submitted.created_at)}</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Диспетчер уже бачить вашу скаргу в робочій черзі. Статус можна буде перевірити пізніше
          (після входу в акаунт).
        </CardContent>
      </Card>
    );
  }

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
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Фото звалища" className="aspect-square w-full rounded-lg object-cover" />
      ) : (
        <Button
          size="lg"
          variant="outline"
          className="h-36 w-full flex-col gap-2 text-base"
          onClick={() => fileInputRef.current?.click()}
          disabled={stage !== 'idle'}
        >
          <Camera className="size-8" aria-hidden />
          {stage === 'compressing' ? 'Обробляю фото…' : 'Зробити фото'}
        </Button>
      )}

      {preview && (
        <Button
          size="sm"
          variant="ghost"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={stage !== 'idle'}
        >
          Замінити фото
        </Button>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Тип відходів (необов&apos;язково)</p>
        <div className="flex flex-wrap gap-2">
          {WASTE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory((prev) => (prev === cat ? null : cat))}
              className={
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
                (category === cat
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-accent')
              }
            >
              {WASTE_CATEGORY_ICONS[cat]} {WASTE_CATEGORY_LABELS_UA[cat]}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-2 text-sm font-medium">
        Опис (необов&apos;язково)
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="Наприклад: велика купа будівельного сміття біля школи"
          className="w-full rounded-md border border-input bg-background p-3 text-sm"
        />
        <span className="text-xs text-muted-foreground">{description.length}/500</span>
      </label>

      <Card className="bg-muted/40">
        <CardContent className="flex items-start gap-2 py-3 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            Координати додаються автоматично з вашого пристрою при надсиланні. Вимкніть{' '}
            <Badge variant="outline" className="text-[10px] font-normal">
              VPN
            </Badge>{' '}
            якщо геолокація покаже неправильне місце.
          </span>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full"
        onClick={submit}
        disabled={!photoFile || stage !== 'idle'}
      >
        {stage === 'locating' && <Spinner label="Визначаю координати…" />}
        {stage === 'submitting' && <Spinner label="Надсилаю скаргу…" />}
        {stage === 'idle' && 'Надіслати скаргу'}
      </Button>
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
