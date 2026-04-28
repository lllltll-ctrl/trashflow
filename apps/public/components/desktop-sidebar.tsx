'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Recycle,
  Home,
  Gamepad2,
  MapPin,
  Clock,
  ArrowDownWideNarrow,
  ShoppingBag,
  AlertTriangle,
  LifeBuoy,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/',            label: 'Головна',           icon: Home              },
  { href: '/classify',    label: 'Інтерактив',         icon: Gamepad2          },
  { href: '/points',      label: 'Точки на мапі',      icon: MapPin            },
  { href: '/schedule',    label: 'Графік вивозу',      icon: Clock             },
  { href: '/rules',       label: 'Правила сортування', icon: ArrowDownWideNarrow },
  { href: '/barakholka',  label: 'Барахолка',          icon: ShoppingBag       },
  { href: '/report',      label: 'Звалище',            icon: AlertTriangle, badge: '3' },
];

const TOOL_ITEMS: NavItem[] = [
  { href: '/support', label: 'Підтримка', icon: LifeBuoy },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { session, loading, showSignIn, signOut } = useAuth();

  /** Exact match for root, prefix match for others. */
  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="tf-desktop-sidebar flex h-screen w-[264px] shrink-0 flex-col overflow-y-auto"
      aria-label="Бічна навігація"
    >
      {/* ── Logo section ───────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <Link
          href="/"
          aria-label="TrashFlow — на головну"
          className="flex items-center gap-3"
        >
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-[12px] text-[color:var(--green-deep)] shrink-0"
            style={{
              background: 'linear-gradient(160deg, #FFE27A, #FFD23F)',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -2px 0 #C79908',
              transform: 'rotate(-6deg)',
            }}
          >
            <Recycle className="size-[18px]" strokeWidth={2.6} />
          </span>
          <div>
            <div className="text-[16px] font-extrabold tracking-[-0.01em] text-white leading-none">
              TrashFlow
            </div>
            <div className="mt-0.5 text-[10.5px] font-medium text-white/50 leading-none">
              Кабінет жителя
            </div>
          </div>
        </Link>

        {/* Community status pill */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <span
            className="inline-block size-1.5 animate-pulse rounded-full"
            style={{ background: '#6FD39A' }}
          />
          <span className="text-[12px] font-semibold text-white/80">
            Прилуки
          </span>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3" aria-label="Основна навігація">
        <p
          className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Навігація
        </p>

        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'tf-sidebar-link flex items-center gap-3 rounded-[12px] px-3 py-2.5',
                    active ? 'tf-sidebar-link--active' : '',
                  ].join(' ')}
                >
                  <Icon
                    className="size-[17px] shrink-0"
                    strokeWidth={active ? 2.4 : 2}
                    aria-hidden
                  />
                  <span className="flex-1 text-[13.5px] font-semibold tracking-[-0.005em]">
                    {label}
                  </span>
                  {badge && (
                    <span
                      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                      style={{ background: '#B5384F' }}
                      aria-label={`${badge} нових`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── Tools section ────────────────────────────────────────────── */}
        <p
          className="mt-4 mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Інструменти
        </p>

        <ul className="space-y-0.5" role="list">
          {TOOL_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href) && href !== '/rules';
            return (
              <li key={`tool-${href}-${label}`}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'tf-sidebar-link flex items-center gap-3 rounded-[12px] px-3 py-2.5',
                    active ? 'tf-sidebar-link--active' : '',
                  ].join(' ')}
                >
                  <Icon className="size-[17px] shrink-0" strokeWidth={2} aria-hidden />
                  <span className="text-[13.5px] font-semibold tracking-[-0.005em]">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Account card ───────────────────────────────────────────────── */}
      <div className="px-3 pb-5 pt-3">
        <div
          className="flex items-center gap-3 rounded-[14px] p-3"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          {/* Avatar initials */}
          <div
            className="grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-bold text-[color:var(--green-deep)]"
            style={{ background: 'linear-gradient(160deg, #FFE27A, #FFD23F)' }}
            aria-hidden
          >
            МЖ
          </div>

          <div className="flex-1 min-w-0">
            <div className="truncate text-[13px] font-semibold text-white leading-none">
              Мешканець громади
            </div>
            <div className="mt-0.5 truncate text-[11px] text-white/45">
              Прилуки · житель
            </div>
          </div>

          {/* Logout / sign-in button */}
          {loading ? (
            <div className="size-7 animate-pulse rounded-[8px]" style={{ background: 'rgba(255,255,255,0.1)' }} />
          ) : session ? (
            <button
              type="button"
              onClick={signOut}
              aria-label="Вийти з акаунту"
              title="Вийти"
              className="grid size-7 place-items-center rounded-[8px] text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-[15px]" strokeWidth={2} />
            </button>
          ) : (
            <button
              type="button"
              onClick={showSignIn}
              aria-label="Увійти в акаунт"
              title="Увійти"
              className="rounded-[8px] px-2 py-1 text-[11px] font-bold text-[color:var(--green-deep)] transition-opacity hover:opacity-90"
              style={{ background: '#FFD23F' }}
            >
              Увійти
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
