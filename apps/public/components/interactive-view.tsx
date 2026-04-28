'use client';

import { useState, useEffect, useRef, useReducer } from 'react';
import { Gamepad2, Play } from 'lucide-react';
import { palette } from '@/components/design/tokens';

type Mode = 'intro' | 'game';
type BinColor = 'blue' | 'yellow' | 'green';
type GamePhase = 'falling' | 'hit' | 'miss' | 'done';

// ─── Config ───────────────────────────────────────────────────────────────────

const BIN_CFG: Record<BinColor, { bg: string; border: string; textColor: string; label: string; icon: string }> = {
  blue:   { bg: '#3B82F6', border: '#1D4ED8', textColor: '#fff',    label: 'ПАПІР',   icon: '📄' },
  yellow: { bg: '#FFD23F', border: '#B8860B', textColor: '#2A1E00', label: 'ПЛАСТИК', icon: '🧴' },
  green:  { bg: '#2FA560', border: '#1E7A45', textColor: '#fff',    label: 'СКЛО',    icon: '🍾' },
};

// 3 items per bin color
const ALL_ITEMS: Array<{ color: BinColor; emoji: string }> = [
  { color: 'blue',   emoji: '📰' }, { color: 'blue',   emoji: '📦' }, { color: 'blue',   emoji: '📄' },
  { color: 'yellow', emoji: '🧴' }, { color: 'yellow', emoji: '🥤' }, { color: 'yellow', emoji: '🛍️' },
  { color: 'green',  emoji: '🍾' }, { color: 'green',  emoji: '🫙' }, { color: 'green',  emoji: '🥂' },
];

const FALL_MS = 2200;
const AREA_H  = 240;
const BALL_D  = 56;

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!; a[i] = a[j]!; a[j] = tmp;
  }
  return a;
}

// ─── Game state (reducer — no stale closures) ─────────────────────────────────

interface GState {
  queue: typeof ALL_ITEMS;
  idx: number;
  score: number;
  lives: number;
  phase: GamePhase;
  ballKey: number;
}

type GAction = { type: 'HIT' } | { type: 'MISS' } | { type: 'NEXT' };

function gReducer(s: GState, a: GAction): GState {
  switch (a.type) {
    case 'HIT':
      if (s.phase !== 'falling') return s;
      return { ...s, score: s.score + 1, phase: 'hit' };
    case 'MISS':
      if (s.phase !== 'falling') return s;
      return { ...s, lives: s.lives - 1, phase: 'miss' };
    case 'NEXT': {
      const next = s.idx + 1;
      if (next >= s.queue.length || s.lives <= 0) return { ...s, phase: 'done' };
      return { ...s, idx: next, ballKey: s.ballKey + 1, phase: 'falling' };
    }
  }
}

// ─── Falling ball ─────────────────────────────────────────────────────────────

function FallingBall({
  item,
  phase,
  onMiss,
}: {
  item: (typeof ALL_ITEMS)[number];
  phase: GamePhase;
  onMiss: () => void;
}) {
  const [y, setY] = useState(0);
  const rafRef   = useRef<number>(0);
  const startRef = useRef(0);
  const firedRef = useRef(false);
  const [lane]   = useState(() => Math.floor(Math.random() * 3));
  const maxY     = AREA_H - BALL_D - 4;
  const cfg      = BIN_CFG[item.color];

  useEffect(() => {
    if (phase !== 'falling') {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    firedRef.current = false;
    setY(0);
    startRef.current = performance.now();

    function step(now: number) {
      const p = Math.min((now - startRef.current) / FALL_MS, 1);
      setY(p * maxY);
      if (p >= 1) {
        if (!firedRef.current) { firedRef.current = true; onMiss(); }
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, onMiss, maxY]);

  const laneW = 100 / 3;
  const cx    = laneW * lane + laneW / 2;

  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: `calc(${cx}% - ${BALL_D / 2}px)`,
        width: BALL_D,
        height: BALL_D,
        borderRadius: '50%',
        background: cfg.bg,
        border: `3px solid ${cfg.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
        boxShadow: `0 8px 24px -6px ${cfg.bg}aa`,
        pointerEvents: 'none',
        transition: phase !== 'falling' ? 'transform 0.25s, opacity 0.25s' : undefined,
        transform: phase === 'hit' ? 'scale(1.35)' : phase === 'miss' ? 'scale(0.6) rotate(20deg)' : 'scale(1)',
        opacity: phase === 'miss' ? 0.2 : 1,
      }}
    >
      {item.emoji}
    </div>
  );
}

// ─── Mini-game ────────────────────────────────────────────────────────────────

function MiniGame({ onBack }: { onBack: () => void }) {
  const [gs, dispatch] = useReducer(gReducer, undefined, (): GState => ({
    queue: shuffled(ALL_ITEMS),
    idx: 0,
    score: 0,
    lives: 3,
    phase: 'falling',
    ballKey: 0,
  }));

  // stable ref so callbacks never capture stale dispatch
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  // auto-advance after hit/miss
  useEffect(() => {
    if (gs.phase !== 'hit' && gs.phase !== 'miss') return;
    const t = setTimeout(() => dispatchRef.current({ type: 'NEXT' }), 550);
    return () => clearTimeout(t);
  }, [gs.phase, gs.ballKey]);

  // stable miss callback for FallingBall
  const onMiss = useRef(() => dispatchRef.current({ type: 'MISS' })).current;

  // ── Done screen ──
  if (gs.phase === 'done') {
    const pct = Math.round((gs.score / gs.queue.length) * 100);
    return (
      <div className="flex flex-col items-center gap-5 pt-8 text-center">
        <div className="text-[50px]">{pct >= 70 ? '🎉' : pct >= 40 ? '👍' : '💪'}</div>
        <div
          className="text-[24px] font-bold tracking-[-0.02em]"
          style={{ color: 'var(--green-deep)', fontFamily: 'var(--font-display)' }}
        >
          {pct >= 70 ? 'Чудово!' : pct >= 40 ? 'Непогано!' : 'Тренуйся!'}
        </div>
        <div className="text-[13px]" style={{ color: 'var(--ink-mute)' }}>
          {gs.score} з {gs.queue.length} спійманих правильно
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-[18px] border px-5 py-3 text-[14px] font-semibold"
            style={{ borderColor: 'rgba(14,58,35,0.15)', color: 'var(--green-deep)' }}
          >
            До опису
          </button>
        </div>
      </div>
    );
  }

  // idx is always in-bounds when phase !== 'done'
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const current = gs.queue[gs.idx]!;

  return (
    <div className="flex select-none flex-col gap-3">
      {/* Header: lives + score */}
      <div className="flex items-center justify-between px-1">
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="text-[18px]">{i < gs.lives ? '❤️' : '🖤'}</span>
          ))}
        </div>
        <div className="text-[14px] font-bold" style={{ color: 'var(--green-deep)' }}>
          {gs.score} / {gs.queue.length}
        </div>
      </div>

      {/* Falling zone */}
      <div
        className="relative overflow-hidden rounded-[20px]"
        style={{
          height: AREA_H,
          background: 'linear-gradient(180deg, #DCF0E6 0%, #C4E8D5 100%)',
          boxShadow: 'inset 0 2px 8px rgba(14,58,35,0.08)',
        }}
      >
        {/* Lane guides */}
        <div className="absolute inset-0 flex">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 border-r last:border-r-0"
              style={{ borderColor: 'rgba(14,58,35,0.07)', borderStyle: 'dashed' }}
            />
          ))}
        </div>
        <FallingBall key={gs.ballKey} item={current} phase={gs.phase} onMiss={onMiss} />
      </div>

      {/* Bins */}
      <div className="grid grid-cols-3 gap-2">
        {(['blue', 'yellow', 'green'] as BinColor[]).map((color) => {
          const cfg = BIN_CFG[color];
          return (
            <button
              key={color}
              type="button"
              onClick={() => {
                if (gs.phase !== 'falling') return;
                dispatch(color === current.color ? { type: 'HIT' } : { type: 'MISS' });
              }}
              className="flex flex-col items-center gap-1.5 rounded-[18px] py-3 transition-transform active:scale-95"
              style={{
                background: cfg.bg,
                border: `2px solid ${cfg.border}`,
                boxShadow: `0 4px 14px -4px ${cfg.bg}88`,
              }}
            >
              <span className="text-[22px]">{cfg.icon}</span>
              <span
                className="text-[11px] font-extrabold tracking-[0.04em]"
                style={{ color: cfg.textColor }}
              >
                {cfg.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="self-center pt-1 text-[12px] font-semibold"
        style={{ color: 'var(--ink-mute)' }}
      >
        ← До опису
      </button>
    </div>
  );
}

// ─── Interactive view (intro + game) ─────────────────────────────────────────

export function InteractiveView() {
  const [mode, setMode] = useState<Mode>('intro');

  if (mode === 'game') {
    return (
      <div className="tf-fade-slide flex flex-col gap-3 pt-2">
        <div
          className="mb-1 text-[10.5px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}
        >
          Навчання та ігри · Сортування
        </div>
        <MiniGame onBack={() => setMode('intro')} />
      </div>
    );
  }

  return (
    <div className="tf-fade-slide flex flex-col gap-5 pt-2">
      <div
        className="text-[10.5px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}
      >
        Навчання та ігри
      </div>

      <div>
        <div
          className="text-[28px] font-normal leading-tight tracking-[-0.03em]"
          style={{ color: 'var(--green-deep)', fontFamily: 'var(--font-display)' }}
        >
          Навчись сортувати
          <br />
          <em className="not-italic" style={{ color: palette.greenLight }}>
            граючи
          </em>
        </div>
      </div>

      {/* Video placeholder */}
      <div
        className="relative overflow-hidden rounded-[24px]"
        style={{
          background: 'linear-gradient(160deg, #0E3A23 0%, #185C38 100%)',
          aspectRatio: '16/9',
          boxShadow: '0 12px 28px -10px rgba(14,58,35,0.45)',
        }}
      >
        <div className="tf-grain absolute inset-0 opacity-20" />
        {([
          'top-[14px] left-[14px]',
          'top-[14px] right-[14px] rotate-90',
          'bottom-[14px] left-[14px] -rotate-90',
          'bottom-[14px] right-[14px] rotate-180',
        ] as const).map((cls, i) => (
          <span key={i} className={`absolute ${cls} block size-[20px]`} aria-hidden>
            <span className="absolute top-0 left-0 h-[2px] w-[16px] rounded-sm" style={{ background: '#FFD23F' }} />
            <span className="absolute top-0 left-0 w-[2px] h-[16px] rounded-sm" style={{ background: '#FFD23F' }} />
          </span>
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div
            className="text-[10px] uppercase tracking-[0.22em] text-white/60"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Як користуватися
          </div>
          <div
            className="text-[20px] font-normal leading-tight tracking-[-0.025em] text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Сортуй правильно
          </div>
          <div
            className="grid size-14 place-items-center rounded-full border border-white/20"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
          >
            <Play className="size-[22px] translate-x-[2px]" strokeWidth={0} fill="#FFD23F" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5">
          <div className="h-[3px] overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-[28%] rounded-full" style={{ background: '#FFD23F' }} />
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-[9.5px] text-white/50" style={{ fontFamily: 'var(--font-mono)' }}>0:42</span>
            <span className="text-[9.5px] text-white/50" style={{ fontFamily: 'var(--font-mono)' }}>2:30</span>
          </div>
        </div>
      </div>

      {/* Start CTA */}
      <button
        type="button"
        onClick={() => setMode('game')}
        className="flex w-full items-center justify-between gap-3 rounded-[22px] px-[20px] py-[16px] text-white"
        style={{
          background: `linear-gradient(165deg, ${palette.greenLight} 0%, ${palette.greenMid} 100%)`,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.12), 0 10px 22px -10px rgba(14,58,35,0.55)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-[42px] place-items-center rounded-[14px]"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <Gamepad2 className="size-[22px]" strokeWidth={1.8} />
          </span>
          <div className="text-left">
            <div
              className="text-[10px] uppercase tracking-[0.15em] opacity-70"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Сортування
            </div>
            <div className="text-[17px] font-bold tracking-[-0.02em]">Почати гру</div>
          </div>
        </div>
        <span aria-hidden className="text-[22px] opacity-70">→</span>
      </button>
    </div>
  );
}
