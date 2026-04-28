'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Grain } from '@/components/design/grain';
import { palette } from '@/components/design/tokens';

export type DigestSlide = {
  id: string;
  eyebrow: string;
  title: [string, string, string]; // [before, em, after]
  sub: string;
  bg: string;
  accent: string;
  glyph: string;
  href: string | null;
  cta: string;
};

const defaultSlides: DigestSlide[] = [
  {
    id: 'pickup',
    eyebrow: 'Завтра 07:00',
    title: ['Вивіз ', 'органіки', ' від під\u2019їзду'],
    sub: 'Бригада №3 · Котляревського 23',
    bg: 'linear-gradient(165deg, #1F7A4A 0%, #0E3A23 100%)',
    accent: '#FFD23F',
    glyph: '❦',
    href: '/schedule',
    cta: 'Дивитись графік',
  },
  {
    id: 'eco-action',
    eyebrow: 'Еко-акція 02.05',
    title: ['Збір ', 'батарейок', ' у школі №7'],
    sub: 'Принеси відпрацьовані — отримай саджанець',
    bg: 'linear-gradient(165deg, #B5384F 0%, #6f1f30 100%)',
    accent: '#FFE27A',
    glyph: '⚡',
    href: '/points',
    cta: 'Подробиці',
  },
  {
    id: 'achievement',
    eyebrow: 'Громада тижня',
    title: ['12 ', 'тонн', ' пластику відсортовано'],
    sub: 'Прилуки в трійці лідерів області',
    bg: 'linear-gradient(165deg, #4AA4B8 0%, #1c5560 100%)',
    accent: '#FFD23F',
    glyph: '◎',
    href: null,
    cta: 'Рейтинг громад',
  },
  {
    id: 'rules',
    eyebrow: 'Нагадування',
    title: ['Як ', 'правильно', ' сортувати скло'],
    sub: 'Без кришок та етикеток. 5 простих кроків.',
    bg: 'linear-gradient(165deg, #6B8E23 0%, #3a4f10 100%)',
    accent: '#FFE27A',
    glyph: '◇',
    href: '/rules',
    cta: 'Читати',
  },
];

export function DigestCarousel({ slides = defaultSlides }: { slides?: DigestSlide[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchRef = useRef({ x: 0, t: 0 });

  // Auto-rotate every 4.2s
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4200);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) touchRef.current = { x: touch.clientX, t: Date.now() };
    setPaused(true);
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - touchRef.current.x;
      if (Math.abs(dx) > 40) {
        setIdx((i) => (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length);
      }
      setTimeout(() => setPaused(false), 2000);
    },
    [slides.length],
  );

  const goToSlide = useCallback(
    (i: number) => {
      setIdx(i);
      setPaused(true);
      setTimeout(() => setPaused(false), 3000);
    },
    [],
  );

  return (
    <div className="mx-[14px] mb-[14px]">
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative overflow-hidden"
        style={{
          borderRadius: 26,
          height: 360,
          boxShadow: '0 18px 36px -18px rgba(14,58,35,0.45)',
        }}
      >
        {slides.map((s, i) => {
          const offset = i - idx;
          const isActive = offset === 0;
          return (
            <div
              key={s.id}
              className="absolute inset-0 flex flex-col"
              style={{
                background: s.bg,
                color: '#fff',
                padding: '22px 22px 24px',
                opacity: isActive ? 1 : 0,
                transform: `translateX(${offset * 18}px) scale(${isActive ? 1 : 0.98})`,
                transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.2,0.8,0.25,1)',
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <Grain opacity={0.15} />

              {/* Big decorative glyph in corner */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  top: -30,
                  right: -10,
                  fontSize: 220,
                  lineHeight: 1,
                  opacity: 0.08,
                  fontFamily: 'var(--font-display)',
                  color: s.accent,
                }}
              >
                {s.glyph}
              </div>

              {/* Eyebrow pill */}
              <div className="relative flex items-center gap-2">
                <span
                  className="rounded-full border px-[10px] py-1 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(255,255,255,0.14)',
                    borderColor: 'rgba(255,255,255,0.18)',
                  }}
                >
                  {s.eyebrow}
                </span>
              </div>

              {/* Centered glyph circle */}
              <div className="relative flex flex-1 items-center justify-center">
                <div
                  className="grid place-items-center rounded-full"
                  style={{
                    width: 132,
                    height: 132,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px dashed rgba(255,255,255,0.25)',
                    fontSize: 72,
                    color: s.accent,
                    fontFamily: 'var(--font-display)',
                    boxShadow: 'inset 0 0 30px rgba(255,255,255,0.05)',
                  }}
                >
                  {s.glyph}
                </div>
              </div>

              {/* Title */}
              <h2
                className="relative m-0"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: 28,
                  lineHeight: 1.06,
                  letterSpacing: '-0.025em',
                  textWrap: 'pretty',
                }}
              >
                {s.title[0]}
                <em style={{ color: s.accent, fontWeight: 500, fontStyle: 'italic' }}>
                  {s.title[1]}
                </em>
                {s.title[2]}
              </h2>

              {/* Subtitle */}
              <div className="relative mt-1.5 text-[13px] opacity-75">{s.sub}</div>

              {/* CTA pill */}
              {s.href ? (
                <a
                  href={s.href}
                  className="relative mt-3.5 mb-[18px] inline-flex items-center gap-1.5 self-start rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-white backdrop-blur-sm"
                  style={{
                    background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.22)',
                  }}
                >
                  {s.cta} <span style={{ color: s.accent }}>→</span>
                </a>
              ) : (
                <button
                  className="relative mt-3.5 mb-[18px] inline-flex items-center gap-1.5 self-start rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-white backdrop-blur-sm"
                  style={{
                    background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.22)',
                  }}
                >
                  {s.cta} <span style={{ color: s.accent }}>→</span>
                </button>
              )}
            </div>
          );
        })}

        {/* Dot indicators */}
        <div className="absolute bottom-[14px] left-0 right-0 z-10 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Слайд ${i + 1}`}
              className="cursor-pointer rounded-full border-0 p-0"
              style={{
                width: i === idx ? 22 : 7,
                height: 7,
                background: i === idx ? palette.yellow : 'rgba(255,255,255,0.45)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
