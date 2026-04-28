'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS_UA,
  CATEGORY_ORDER,
  type MarketplaceCategory,
  type MarketplaceListItem,
} from '@/lib/marketplace';

export function MarketplaceList({
  initial,
  activeCategory,
}: {
  initial: MarketplaceListItem[];
  activeCategory: MarketplaceCategory | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const goCategory = (next: MarketplaceCategory | null) => {
    const params = new URLSearchParams();
    if (next) params.set('c', next);
    startTransition(() => {
      router.push(`/barakholka${params.toString() ? `?${params.toString()}` : ''}`);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top action — post new item */}
      <Link
        href="/barakholka/new"
        className="flex items-center justify-between gap-3 rounded-[20px] px-4 py-3.5 font-semibold text-white"
        style={{
          background: 'linear-gradient(165deg, #2FA560 0%, #185C38 100%)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.12), 0 10px 22px -10px rgba(14, 58, 35, 0.55)',
        }}
      >
        <span className="flex items-center gap-2">
          <Plus className="size-[18px]" strokeWidth={2.4} />
          Виставити товар
        </span>
        <ArrowRight className="size-4" />
      </Link>

      {/* Category chips */}
      <div className="-mx-5 px-5">
        <div className="tf-scroll-x flex gap-2 pb-2">
          <Chip active={activeCategory === null} onClick={() => goCategory(null)}>
            Всі · {initial.length}
          </Chip>
          {CATEGORY_ORDER.map((c) => {
            const count = initial.filter((it) => it.category === c).length;
            return (
              <Chip
                key={c}
                active={activeCategory === c}
                onClick={() => goCategory(c)}
                disabled={pending}
              >
                <span className="mr-1.5">{CATEGORY_ICONS[c]}</span>
                {CATEGORY_LABELS_UA[c]}
                {count > 0 && ` · ${count}`}
              </Chip>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2.5">
        {initial.length === 0 && (
          <div
            className="rounded-[20px] border border-[rgba(14,58,35,0.06)] bg-white p-6 text-center text-sm text-[color:var(--ink-mute)]"
            style={{ boxShadow: 'var(--tf-shadow-sm)' }}
          >
            Поки що нічого не виставили в цій категорії. Будь першим — натисни
            «Виставити товар».
          </div>
        )}
        {initial.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: MarketplaceListItem }) {
  const ago = formatRelative(item.createdAt);
  return (
    <Link
      href={`/barakholka/${item.id}`}
      className="flex items-start gap-3 rounded-[20px] border border-[rgba(14,58,35,0.06)] bg-white p-3.5 transition-transform hover:-translate-y-0.5"
      style={{ boxShadow: 'var(--tf-shadow-sm)' }}
    >
      {item.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.photoUrl}
          alt={item.title}
          loading="lazy"
          className="size-16 shrink-0 rounded-[14px] object-cover"
        />
      ) : (
        <div
          className="grid size-16 shrink-0 place-items-center rounded-[14px] text-2xl"
          style={{ background: 'var(--green-pale)' }}
        >
          {CATEGORY_ICONS[item.category]}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="truncate text-[15px] font-bold tracking-[-0.01em] text-[color:var(--green-deep)]">
            {item.title}
          </div>
          <div
            className="shrink-0 text-[10.5px] text-[color:var(--ink-mute)]"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
          >
            {ago}
          </div>
        </div>
        {item.description && (
          <div className="mt-0.5 line-clamp-2 text-[12.5px] text-[color:var(--ink-soft)]">
            {item.description}
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-[color:var(--ink-mute)]">
          <span
            className="rounded-full bg-[rgba(14,58,35,0.05)] px-2 py-0.5 font-medium"
          >
            {CATEGORY_LABELS_UA[item.category]}
          </span>
          <span>{item.contactName}</span>
        </div>
      </div>
    </Link>
  );
}

function Chip({
  children,
  active,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-transparent px-3 py-2 text-[12.5px] font-semibold transition-colors disabled:opacity-50"
      style={{
        background: active ? 'var(--green-deep)' : 'rgba(14, 58, 35, 0.05)',
        color: active ? '#fff' : 'var(--ink-soft)',
      }}
    >
      {children}
    </button>
  );
}

function formatRelative(iso: string): string {
  const ageMs = Date.now() - Date.parse(iso);
  const minutes = Math.floor(ageMs / 60_000);
  if (minutes < 1) return 'щойно';
  if (minutes < 60) return `${minutes} хв`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} год`;
  const days = Math.floor(hours / 24);
  return `${days} дн`;
}
