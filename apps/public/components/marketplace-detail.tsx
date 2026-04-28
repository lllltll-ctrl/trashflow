'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Loader2, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS_UA,
  markMarketplaceItemTaken,
  type MarketplaceItemFull,
} from '@/lib/marketplace';
import { palette } from '@/components/design/tokens';

export function MarketplaceDetail({
  item,
  editToken,
}: {
  item: MarketplaceItemFull;
  editToken: string | null;
}) {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(item.status);
  const router = useRouter();

  const isOwner = editToken !== null;
  const isAvailable = status === 'available';

  const tel = item.contactPhone.replace(/[^+\d]/g, '');

  const reveal = () => setPhoneRevealed(true);

  const markTaken = async () => {
    if (!editToken) return;
    setBusy(true);
    try {
      await markMarketplaceItemTaken(item.id, editToken);
      setStatus('taken');
      toast.success('Помічено як «забрано». Дякуємо!');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не вдалося оновити');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hero card */}
      <div
        className="rounded-[24px] border bg-white p-5"
        style={{
          boxShadow: 'var(--tf-shadow-md)',
          borderColor: 'rgba(14,58,35,0.06)',
          background: !isAvailable
            ? 'linear-gradient(165deg, rgba(108,117,125,0.05) 0%, #fff 100%)'
            : 'linear-gradient(165deg, rgba(47,165,96,0.06) 0%, #fff 100%)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="grid size-14 shrink-0 place-items-center rounded-[16px] text-3xl"
            style={{ background: 'var(--green-pale)' }}
          >
            {CATEGORY_ICONS[item.category]}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[10.5px] uppercase tracking-[0.18em]"
              style={{
                fontFamily: 'var(--font-mono)',
                color: isAvailable ? 'var(--green-light)' : 'var(--ink-mute)',
              }}
            >
              {CATEGORY_LABELS_UA[item.category]} ·{' '}
              {isAvailable ? 'Доступно' : 'Забрано'}
            </div>
            <div
              className="mt-1 text-[24px] font-normal leading-tight tracking-[-0.025em] text-[color:var(--green-deep)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {item.title}
            </div>
          </div>
        </div>

        {item.description && (
          <p className="mt-3.5 text-[14px] leading-[1.55] text-[color:var(--ink-soft)]">
            {item.description}
          </p>
        )}
      </div>

      {/* Contact card */}
      <div
        className="rounded-[24px] border border-[rgba(14,58,35,0.06)] bg-white p-5"
        style={{ boxShadow: 'var(--tf-shadow-sm)' }}
      >
        <div
          className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Контакт
        </div>
        <div className="mt-2 flex items-center gap-2">
          <User className="size-4 text-[color:var(--green-deep)]" />
          <span className="text-[15px] font-bold tracking-[-0.01em] text-[color:var(--green-deep)]">
            {item.contactName}
          </span>
        </div>

        {!isAvailable ? (
          <div className="mt-3 rounded-[12px] bg-[rgba(14,58,35,0.04)] px-3 py-2 text-[12.5px] text-[color:var(--ink-mute)]">
            Цей товар уже забрали — телефон закрито.
          </div>
        ) : phoneRevealed ? (
          <a
            href={`tel:${tel}`}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[16px] px-4 py-3 text-[15px] font-bold text-white"
            style={{
              background: `linear-gradient(165deg, ${palette.greenLight} 0%, ${palette.greenMid} 100%)`,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.12), 0 10px 22px -10px rgba(14, 58, 35, 0.55)',
            }}
          >
            <Phone className="size-[18px]" strokeWidth={2.2} />
            {item.contactPhone}
          </a>
        ) : (
          <button
            type="button"
            onClick={reveal}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[color:var(--green-pale)] px-4 py-3 text-[14px] font-bold text-[color:var(--green-deep)]"
          >
            <Phone className="size-[16px]" strokeWidth={2.2} />
            Показати телефон
          </button>
        )}
      </div>

      {/* Owner action: mark taken */}
      {isOwner && isAvailable && (
        <div
          className="rounded-[20px] border border-dashed p-4"
          style={{
            borderColor: 'rgba(199,153,8,0.4)',
            background: 'linear-gradient(180deg, #FFF8E7 0%, #FFF1C9 100%)',
          }}
        >
          <div className="text-[12.5px] font-semibold text-[#4A3500]">
            Це ваше оголошення.
          </div>
          <p className="mt-1 text-[12px] text-[#4A3500]/75">
            Якщо вже забрали — натисніть нижче. Воно зникне зі списку.
          </p>
          <button
            type="button"
            onClick={markTaken}
            disabled={busy}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#4A3500] px-4 py-2.5 text-[13px] font-bold text-[color:var(--yellow-soft)] disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" strokeWidth={2.4} />
            )}
            Помітити як «забрано»
          </button>
        </div>
      )}

      {isOwner && !isAvailable && (
        <div className="rounded-[16px] bg-[rgba(14,58,35,0.04)] p-3 text-center text-[12.5px] text-[color:var(--ink-mute)]">
          Дякуємо! Оголошення закрито.
        </div>
      )}

      <Link
        href="/barakholka"
        className="self-center text-[12px] text-[color:var(--ink-mute)]"
      >
        ← До всіх оголошень
      </Link>
    </div>
  );
}
