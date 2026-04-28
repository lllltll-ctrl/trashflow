'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ScanLine, MapPin, Clock, ArrowDownWideNarrow, type LucideIcon } from 'lucide-react';

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const items: Item[] = [
  { href: '/', label: 'Головна', icon: Home },
  { href: '/classify', label: 'Фото', icon: ScanLine },
  { href: '/points', label: 'Мапа', icon: MapPin },
  { href: '/schedule', label: 'Графік', icon: Clock },
  { href: '/rules', label: 'Сорт', icon: ArrowDownWideNarrow },
];

/**
 * Floating dark-glass bottom tab bar — sticky so it stays visible while the
 * page body scrolls. Hidden on /report since the 3-step flow fills the frame.
 */
export function TabBar() {
  const pathname = usePathname() ?? '/';
  if (pathname.startsWith('/report')) return null;

  return (
    <nav
      className="sticky bottom-0 z-30 mt-auto flex justify-center px-3.5 pb-[18px] pt-2"
      style={{
        background: 'linear-gradient(180deg, rgba(250, 247, 239, 0) 0%, var(--cream) 30%)',
      }}
    >
      <div
        className="flex gap-1 rounded-[24px] p-[7px] backdrop-blur-xl"
        style={{
          background: 'rgba(14, 58, 35, 0.94)',
          boxShadow:
            '0 14px 36px -10px rgba(14, 58, 35, 0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {items.map((it) => {
          const isActive =
            it.href === '/' ? pathname === '/' : pathname.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className="relative flex flex-col items-center justify-center gap-[2px] rounded-2xl px-[14px] py-[9px] text-[10px] font-semibold transition-all"
              style={{
                background: isActive ? 'var(--yellow)' : 'transparent',
                color: isActive ? 'var(--green-deep)' : 'rgba(255,255,255,0.55)',
              }}
            >
              <Icon
                className="size-[20px]"
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
