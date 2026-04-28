'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import {
  WASTE_CATEGORIES,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import { categoryStyle } from '@/components/design/tokens';

export type CategoryRule = {
  id: WasteCategoryId;
  name_ua: string;
  description: string | null;
  doList: string[];
  dontList: string[];
};

export function RulesBrowser({ categories }: { categories: CategoryRule[] }) {
  const [open, setOpen] = useState<WasteCategoryId | null>(null);

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Category visual grid (5 cols fit nicely on phone width for 5 cats) */}
      <div className="grid grid-cols-3 gap-2">
        {WASTE_CATEGORIES.map((id) => {
          const s = categoryStyle[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setOpen(id);
                setTimeout(() => {
                  document
                    .getElementById(`rule-${id}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 60);
              }}
              className="rounded-[16px] border border-[rgba(14,58,35,0.05)] p-3 text-center transition-transform hover:-translate-y-0.5"
              style={{ background: s.bg }}
            >
              <div
                className="mx-auto mb-1.5 mt-0.5 grid size-9 place-items-center rounded-[12px] bg-white text-xl"
                style={{
                  color: s.color,
                  boxShadow: 'inset 0 0 0 1px rgba(14,58,35,0.04)',
                }}
              >
                {s.glyph}
              </div>
              <div className="text-xs font-bold tracking-[-0.01em] text-[color:var(--ink)]">
                {WASTE_CATEGORY_LABELS_UA[id]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expandable cards */}
      <div className="flex flex-col gap-2.5">
        {categories.map((r) => {
          const s = categoryStyle[r.id];
          const isOpen = open === r.id;
          return (
            <div
              key={r.id}
              id={`rule-${r.id}`}
              className="overflow-hidden rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white"
              style={{ boxShadow: 'var(--tf-shadow-sm)' }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : r.id)}
                className="flex w-full items-center gap-[14px] p-4 text-left"
              >
                <div
                  className="grid size-12 shrink-0 place-items-center rounded-[14px] text-[22px]"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.glyph}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold tracking-[-0.01em] text-[color:var(--green-deep)]">
                    {r.name_ua}
                  </div>
                  <div className="mt-0.5 text-xs text-[color:var(--ink-mute)]">
                    {r.doList.length} правил · {r.dontList.length} заборон
                  </div>
                </div>
                <span
                  className="grid size-7 place-items-center rounded-full bg-[color:var(--green-pale)] text-[color:var(--green-deep)] transition-transform"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                >
                  <ChevronDown className="size-4" strokeWidth={2.2} />
                </span>
              </button>

              {isOpen && (
                <div
                  className="tf-fade-slide px-4 pb-[18px] pt-4"
                  style={{ borderTop: '1px dashed rgba(14,58,35,0.08)' }}
                >
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <div
                        className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--green-light)]"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        ✓ Можна
                      </div>
                      {r.doList.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 py-1.5 text-[13px] text-[color:var(--ink-soft)]"
                        >
                          <span className="mt-0.5 shrink-0 text-[color:var(--green-light)]">
                            •
                          </span>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div
                        className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--c-hazardous)]"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        ✕ Не можна
                      </div>
                      {r.dontList.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 py-1.5 text-[13px] text-[color:var(--ink-soft)]"
                        >
                          <span className="mt-0.5 shrink-0 text-[color:var(--c-hazardous)]">
                            •
                          </span>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={{ pathname: '/points', query: { category: r.id } }}
                    className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-[14px] px-[14px] py-2.5 text-[13px] font-bold"
                    style={{ background: s.bg, color: s.color }}
                  >
                    Де здати?
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
