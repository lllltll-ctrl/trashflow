'use client';

import { Recycle, X } from 'lucide-react';
import { palette } from '@/components/design/tokens';

export function AuthModal({
  open,
  onClose,
  onSignIn,
}: {
  open: boolean;
  onClose: () => void;
  onSignIn: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(14,58,35,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-[400px] rounded-t-[28px] sm:rounded-[28px] bg-white px-6 pb-8 pt-6"
        style={{ boxShadow: '0 -8px 40px rgba(14,58,35,0.2)' }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 grid size-8 place-items-center rounded-full"
          style={{ background: 'rgba(14,58,35,0.07)', color: 'var(--ink-mute)' }}
        >
          <X className="size-[16px]" strokeWidth={2.5} />
        </button>

        {/* Logo + title */}
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <span
            className="grid size-[56px] place-items-center rounded-[18px]"
            style={{
              background: `linear-gradient(160deg, ${palette.yellowSoft}, ${palette.yellow})`,
              color: palette.greenDeep,
              boxShadow: `inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -3px 0 ${palette.yellowShadow}`,
              transform: 'rotate(-6deg)',
            }}
          >
            <Recycle className="size-[26px]" strokeWidth={2.6} />
          </span>

          <div>
            <div
              className="text-[22px] font-bold tracking-[-0.02em]"
              style={{ color: palette.greenDeep, fontFamily: 'var(--font-display)' }}
            >
              TrashFlow
            </div>
            <div className="mt-1 text-[13px]" style={{ color: 'var(--ink-mute)' }}>
              Акаунт резидента · Прилуки
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onSignIn}
          className="w-full rounded-[18px] py-[18px] text-[17px] font-bold text-white"
          style={{
            background: `linear-gradient(165deg, ${palette.greenLight} 0%, ${palette.greenMid} 100%)`,
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.12), 0 10px 24px -8px rgba(14,58,35,0.5)',
          }}
        >
          Увійти в акаунт
        </button>
      </div>
    </div>
  );
}
