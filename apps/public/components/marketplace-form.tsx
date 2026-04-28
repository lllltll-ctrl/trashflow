'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Camera, Check, Copy, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS_UA,
  CATEGORY_ORDER,
  postMarketplaceItem,
  uploadMarketplacePhoto,
  type MarketplaceCategory,
} from '@/lib/marketplace';
import { compressImage } from '@/lib/compress';
import { palette } from '@/components/design/tokens';

type Submitted = { id: string; editToken: string };

export function MarketplaceForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory>('other');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handlePhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Потрібне зображення');
      return;
    }
    setPhotoBusy(true);
    try {
      const compressed = await compressImage(file);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoFile(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch {
      toast.error('Не вдалося обробити фото');
    } finally {
      setPhotoBusy(false);
    }
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadMarketplacePhoto(photoFile);
      }
      const res = await postMarketplaceItem({
        title: title.trim(),
        description: description.trim(),
        category,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        photoUrl,
      });
      setSubmitted(res);
      toast.success('Оголошення опубліковано');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не вдалося опублікувати');
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return <SuccessView submitted={submitted} onAddAnother={() => router.refresh()} />;
  }

  const valid =
    title.trim().length >= 3 && contactName.trim().length >= 2 && contactPhone.trim().length >= 6;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePhoto(file);
        }}
      />

      <Field label="Фото (необовʼязково)" hint="Допоможе сусіду одразу зрозуміти що саме віддаєш">
        {photoPreview ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Фото товару" className="size-full object-cover" />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/95 text-[color:var(--green-deep)] shadow"
              aria-label="Видалити фото"
            >
              <X className="size-4" strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={photoBusy}
              className="absolute bottom-2 left-2 right-2 inline-flex items-center justify-center gap-1.5 rounded-[12px] bg-white/95 px-3 py-2 text-[12px] font-bold text-[color:var(--green-deep)]"
            >
              {photoBusy ? <Loader2 className="size-3.5 animate-spin" /> : <ImageIcon className="size-3.5" />}
              Замінити фото
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={photoBusy}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed py-7"
            style={{
              borderColor: 'rgba(14,58,35,0.18)',
              background:
                'repeating-linear-gradient(45deg, rgba(14,58,35,0.04) 0 10px, rgba(14,58,35,0.01) 10px 20px)',
              color: 'var(--ink-mute)',
            }}
          >
            {photoBusy ? (
              <Loader2 className="size-7 animate-spin text-[color:var(--green-light)]" />
            ) : (
              <Camera className="size-7 text-[color:var(--green-light)]" strokeWidth={1.8} />
            )}
            <span className="text-[12.5px] font-semibold">
              {photoBusy ? 'Стискаю…' : 'Додати фото'}
            </span>
          </button>
        )}
      </Field>

      <Field label="Що віддаєш?">
        <input
          required
          minLength={3}
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={'напр. Старий монітор Samsung 22"'}
          className="w-full rounded-[14px] border border-[rgba(14,58,35,0.12)] bg-white px-3.5 py-3 text-[14px] outline-none focus:border-[color:var(--green-light)]"
        />
      </Field>

      <Field label="Категорія">
        <div className="grid grid-cols-3 gap-2">
          {CATEGORY_ORDER.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className="flex flex-col items-center gap-1 rounded-[14px] border px-2 py-2.5 text-[12px] font-semibold transition-colors"
                style={{
                  background: active ? 'var(--green-pale)' : '#fff',
                  borderColor: active ? 'var(--green-light)' : 'rgba(14,58,35,0.08)',
                  color: active ? palette.greenDeep : 'var(--ink-soft)',
                }}
              >
                <span className="text-xl">{CATEGORY_ICONS[c]}</span>
                {CATEGORY_LABELS_UA[c]}
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="Опис (необовʼязково)"
        hint="Стан, розмір, де забрати — все що допомагає сусіду вирішити"
      >
        <textarea
          maxLength={500}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="напр. Працює, без подряпин. Кабель VGA в комплекті. Самовивіз з вул. Київська."
          className="w-full resize-none rounded-[14px] border border-[rgba(14,58,35,0.12)] bg-white px-3.5 py-3 text-[14px] outline-none focus:border-[color:var(--green-light)]"
        />
        <div className="mt-1 text-right text-[10.5px] text-[color:var(--ink-mute)]">
          {description.length}/500
        </div>
      </Field>

      <Field label="Імʼя">
        <input
          required
          minLength={2}
          maxLength={60}
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="напр. Олена"
          className="w-full rounded-[14px] border border-[rgba(14,58,35,0.12)] bg-white px-3.5 py-3 text-[14px] outline-none focus:border-[color:var(--green-light)]"
        />
      </Field>

      <Field label="Телефон" hint="Сусід зателефонує, щоб домовитись про самовивіз">
        <input
          required
          inputMode="tel"
          minLength={6}
          maxLength={30}
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="+380 67 123 4567"
          className="w-full rounded-[14px] border border-[rgba(14,58,35,0.12)] bg-white px-3.5 py-3 text-[14px] outline-none focus:border-[color:var(--green-light)]"
        />
      </Field>

      <button
        type="submit"
        disabled={!valid || busy}
        className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-[22px] px-[22px] py-[15px] text-[15px] font-semibold tracking-[-0.01em] text-white transition-all disabled:opacity-50"
        style={{
          background: `linear-gradient(165deg, ${palette.greenLight} 0%, ${palette.greenMid} 100%)`,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.12), 0 10px 22px -10px rgba(14, 58, 35, 0.55)',
        }}
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Публікую…
          </>
        ) : (
          <>
            Опублікувати
            <ArrowRight className="size-[18px]" strokeWidth={2.2} />
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-[color:var(--ink-mute)]">
        Натискаючи «Опублікувати» ви погоджуєтесь, що ваше імʼя та телефон будуть видимі
        іншим резидентам громади. Оголошення живе 30 днів і автоматично закривається.
      </p>
    </form>
  );
}

function SuccessView({
  submitted,
  onAddAnother,
}: {
  submitted: Submitted;
  onAddAnother: () => void;
}) {
  const itemUrl = `/barakholka/${submitted.id}`;
  const editUrl = `/barakholka/${submitted.id}?edit=${submitted.editToken}`;

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div
        className="grid size-20 place-items-center rounded-full text-white"
        style={{
          background: `linear-gradient(165deg, ${palette.greenLight}, ${palette.greenMid})`,
          boxShadow: '0 14px 40px -10px rgba(14,58,35,0.35)',
        }}
      >
        <Check className="size-10" strokeWidth={2.2} />
      </div>
      <div>
        <div
          className="text-[28px] font-normal tracking-[-0.03em] text-[color:var(--green-deep)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Опубліковано
        </div>
        <p className="mt-1 text-[13px] leading-[1.5] text-[color:var(--ink-mute)]">
          Сусіди з громади побачать ваше оголошення прямо зараз.
        </p>
      </div>

      <div
        className="w-full rounded-[18px] border border-dashed border-[rgba(199,153,8,0.4)] p-4"
        style={{ background: 'linear-gradient(180deg, #FFF8E7 0%, #FFF1C9 100%)' }}
      >
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-[color:#4A3500]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Збережіть посилання щоб помітити «забрано»
        </div>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 truncate rounded-[8px] bg-white/70 px-2 py-1 text-[11px]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {editUrl}
          </code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard
                .writeText(`${window.location.origin}${editUrl}`)
                .then(() => toast.success('Скопійовано'))
                .catch(() => toast.error('Не вдалося скопіювати'));
            }}
            className="grid size-8 place-items-center rounded-[8px] bg-[#4A3500] text-white"
          >
            <Copy className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Link
          href={itemUrl}
          className="flex items-center justify-center gap-2 rounded-[18px] bg-[color:var(--green-deep)] px-4 py-3 text-sm font-bold text-white"
        >
          Переглянути оголошення
          <ArrowRight className="size-4" />
        </Link>
        <button
          type="button"
          onClick={onAddAnother}
          className="rounded-[18px] bg-[color:var(--green-pale)] px-4 py-3 text-sm font-semibold text-[color:var(--green-deep)]"
        >
          Виставити ще одне
        </button>
        <Link
          href="/barakholka"
          className="text-[12px] text-[color:var(--ink-mute)]"
        >
          ← До списку
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[11px] text-[color:var(--ink-mute)]">{hint}</span>
      )}
    </label>
  );
}
