'use client';

import { useState } from 'react';
import { Bell, BellRing, Check, Home, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { clientEnv } from '@/lib/env';
import { palette } from '@/components/design/tokens';

export type HouseholdInfo = {
  id: string;
  qrToken: string;
  address: string;
  pricingTier: 'standard' | 'sorted' | 'unscanned';
  lat: number;
  lng: number;
  hasOwner: boolean;
};

const TIER_DETAILS: Record<HouseholdInfo['pricingTier'], { label: string; multiplier: string; tone: string; explainer: string }> = {
  sorted: {
    label: 'Сортувальник',
    multiplier: '×0.5',
    tone: 'var(--green-light)',
    explainer:
      'Ви сканували QR і фото показало, що сміття відсортовано — ціна вивозу вдвічі менша.',
  },
  standard: {
    label: 'Базовий',
    multiplier: '×1.0',
    tone: 'var(--c-paper)',
    explainer:
      'Ви сканували QR, але без сортування. Це базова ціна. Сортуйте — і отримаєте −50%.',
  },
  unscanned: {
    label: 'Без застосунку',
    multiplier: '×1.5',
    tone: 'var(--c-hazardous)',
    explainer:
      'Адміністрація громади переходить на платформу з 2027 року. Не сканований бак = +50% до тарифу.',
  },
};

export function MyBinClient({ household }: { household: HouseholdInfo }) {
  const [flagged, setFlagged] = useState(false);
  const [busy, setBusy] = useState(false);
  const tier = TIER_DETAILS[household.pricingTier];

  const flagFull = async () => {
    setBusy(true);
    try {
      const url = `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/flag_bin_full`;
      const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_qr_token: household.qrToken }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body);
      }
      setFlagged(true);
      toast.success('Заявку прийнято — бригада забере на найближчому маршруті');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не вдалося надіслати');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hero card with address */}
      <div
        className="relative overflow-hidden rounded-[24px] border border-[rgba(14,58,35,0.06)] bg-white p-5"
        style={{ boxShadow: 'var(--tf-shadow-sm)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="grid size-12 shrink-0 place-items-center rounded-[14px] text-[color:var(--green-deep)]"
            style={{ background: 'var(--green-pale)' }}
          >
            <Home className="size-6" strokeWidth={2} />
          </div>
          <div>
            <div
              className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Ваш бак
            </div>
            <div className="mt-0.5 text-[19px] font-bold tracking-[-0.01em] text-[color:var(--green-deep)]">
              {household.address}
            </div>
            <div
              className="mt-1 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              QR · {household.qrToken.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing tier card */}
      <div
        className="rounded-[24px] border bg-white p-5"
        style={{
          boxShadow: 'var(--tf-shadow-sm)',
          borderColor: tier.tone,
          background: `linear-gradient(165deg, ${tier.tone}11 0%, #fff 100%)`,
        }}
      >
        <div className="flex items-baseline gap-2">
          <div
            className="text-[10.5px] uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-mono)', color: tier.tone }}
          >
            Тариф вивозу
          </div>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: tier.tone }}
          >
            {tier.label}
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span
            className="text-[40px] font-normal leading-none tracking-[-0.04em] text-[color:var(--green-deep)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {tier.multiplier}
          </span>
          <span className="text-[13px] text-[color:var(--ink-mute)]">від базової ціни</span>
        </div>
        <p className="mt-2.5 text-[13px] leading-[1.55] text-[color:var(--ink-soft)]">
          {tier.explainer}
        </p>
      </div>

      {/* Action: flag bin as full */}
      <button
        type="button"
        onClick={flagFull}
        disabled={flagged || busy}
        className="flex w-full items-center justify-center gap-2.5 rounded-[22px] px-[22px] py-[15px] text-[15px] font-semibold tracking-[-0.01em] text-white transition-all"
        style={{
          background: flagged
            ? `linear-gradient(165deg, ${palette.greenLight} 0%, ${palette.greenMid} 100%)`
            : `linear-gradient(165deg, ${palette.yellow} 0%, #C79908 100%)`,
          color: flagged ? '#fff' : palette.greenDeep,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.12), 0 10px 22px -10px rgba(199, 153, 8, 0.55)',
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? (
          <Loader2 className="size-[18px] animate-spin" />
        ) : flagged ? (
          <BellRing className="size-[18px]" />
        ) : (
          <Bell className="size-[18px]" />
        )}
        {flagged ? 'Заявку прийнято' : 'Бак повний — забрати'}
      </button>

      {/* Education card */}
      <div
        className="rounded-[20px] p-4"
        style={{
          background: 'linear-gradient(165deg, #E8F5EC 0%, #F4F9F1 100%)',
          border: '1px dashed rgba(14,58,35,0.15)',
        }}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 shrink-0 text-[color:var(--green-light)]" strokeWidth={2.2} />
          <div className="space-y-1.5 text-[13px] leading-[1.5] text-[color:var(--ink-soft)]">
            <p className="font-semibold text-[color:var(--green-deep)]">
              Як отримати тариф ×0.5?
            </p>
            <p>
              1. Відсортуйте сміття за категоріями (пластик / папір / скло / метал /
              небезпечні).
            </p>
            <p>
              2. Зніміть фото у{' '}
              <a href="/classify" className="font-semibold text-[color:var(--green-deep)] underline">
                розділі «Класифікація»
              </a>{' '}
              — AI підтвердить категорію.
            </p>
            <p>3. На наступному вивозі бригада звірить QR і запише сортування — тариф буде ×0.5.</p>
          </div>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div
        className="rounded-[20px] border border-[rgba(14,58,35,0.06)] bg-white p-4"
        style={{ boxShadow: 'var(--tf-shadow-sm)' }}
      >
        <div
          className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Останні забори
        </div>
        <div className="mt-2 flex items-center gap-2 text-[13px] text-[color:var(--ink-soft)]">
          <Check className="size-4 text-[color:var(--green-light)]" />
          <span>Коли вас перший раз заберуть — побачите дату й результат сортування.</span>
        </div>
      </div>
    </div>
  );
}
