/**
 * Resident chrome — two modes:
 *
 * Mobile (< lg): cream canvas + phone-frame card centred on screen. Tab bar is
 * gone; navigation happens through the home tile grid and back buttons.
 *
 * Desktop (≥ lg): full-width web layout — no phone frame, gradient canvas
 * fills the viewport, content lives inside a centred max-w-5xl container.
 */
import Link from 'next/link';
import { Recycle } from 'lucide-react';

const NAV_LINKS = [
  { href: '/points',   label: 'Точки'     },
  { href: '/classify', label: 'Інтерактив' },
  { href: '/schedule', label: 'Графік'    },
  { href: '/rules',    label: 'Правила'   },
  { href: '/barakholka', label: 'Барахолка' },
] as const;

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen justify-center"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 10% -10%, rgba(111, 211, 154, 0.18), transparent 60%),
          radial-gradient(ellipse 80% 50% at 110% 110%, rgba(255, 210, 63, 0.10), transparent 55%),
          var(--cream)
        `,
      }}
    >
      {/* ── Desktop top navbar (hidden on mobile) ───────────────────────── */}
      <nav
        aria-label="Головна навігація"
        className="hidden lg:flex fixed top-0 left-0 right-0 z-50 items-center gap-6 px-8 h-14 border-b border-[rgba(14,58,35,0.08)]"
        style={{ background: 'rgba(250,247,239,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <Link
          href="/"
          aria-label="TrashFlow — на головну"
          className="flex items-center gap-2 mr-4 shrink-0"
        >
          <span
            aria-hidden
            className="grid size-[30px] place-items-center rounded-[10px] text-lg font-extrabold"
            style={{
              background: 'linear-gradient(160deg, #FFE27A, #FFD23F)',
              color: '#0E3A23',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -3px 0 #C79908',
              transform: 'rotate(-6deg)',
            }}
          >
            <Recycle className="size-[15px]" strokeWidth={2.6} />
          </span>
          <span className="text-[15px] font-extrabold tracking-[-0.01em] text-[color:var(--green-deep)]">
            TrashFlow
          </span>
        </Link>

        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-[13.5px] font-semibold text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--green-light)]"
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* ── Mobile phone-frame card / Desktop content column ───────────── */}
      <div
        className={[
          /* Mobile: centred phone card */
          'tf-phone-frame relative flex w-full max-w-[460px] flex-col overflow-hidden',
          'md:my-10 md:min-h-[860px] md:rounded-[44px] md:border md:border-[rgba(14,58,35,0.08)]',
          /* Desktop: break out of phone frame — full-width content column */
          'lg:max-w-5xl lg:my-0 lg:rounded-none lg:border-none lg:mt-14',
        ].join(' ')}
        style={{ background: 'var(--cream)' }}
      >
        <main className="tf-fade-slide flex flex-1 flex-col pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
