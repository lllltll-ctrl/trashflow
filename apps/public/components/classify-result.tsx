'use client';

import Link from 'next/link';
import { MapPin, Info, ArrowRight } from 'lucide-react';
import {
  WASTE_CATEGORIES,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import { categoryStyle } from '@/components/design/tokens';
import type { ClassifyResult as Result } from '@/lib/classify-client';

const CONFIDENCE_THRESHOLD = 0.5;

const PREP_STEPS_UA: Record<WasteCategoryId, string[]> = {
  plastic: ['Сполосніть від залишків', 'Зніміть етикетку, якщо легко', 'Стисніть для компактності'],
  paper: ['Розпакуйте коробки', 'Зніміть скотч і скоби', 'Уникайте намоклого паперу'],
  glass: ['Сполосніть банки й пляшки', 'Зніміть металеві кришки', 'Не розбивайте — небезпечно'],
  metal: ['Сполосніть банки', 'Розчавте алюміній — економить місце', 'Тримайте окремо від електроніки'],
  hazardous: ['Збирайте окремо', 'Лампи — у заводській упаковці', 'Батарейки — у спец-контейнер'],
};

export function ClassifyResult({
  result,
  previewUrl,
}: {
  result: Result;
  previewUrl?: string;
}) {
  const topCategory = result.category;
  const confidencePct = Math.round(result.confidence * 100);
  const lowConfidence = result.confidence < CONFIDENCE_THRESHOLD;
  const s = categoryStyle[topCategory];
  const prep = PREP_STEPS_UA[topCategory];

  return (
    <div className="flex flex-col gap-3">
      {/* Result card */}
      <div
        className="relative overflow-hidden rounded-[28px] p-[22px]"
        style={{
          background: `linear-gradient(160deg, ${s.bg} 0%, #fff 100%)`,
          border: `1px solid ${s.color}22`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-5 -top-8 text-[150px] leading-none opacity-[0.08]"
          style={{ color: s.color, fontFamily: 'var(--font-display)' }}
        >
          {s.glyph}
        </div>
        <div
          className="text-[11px] uppercase tracking-[0.22em]"
          style={{ color: s.color, fontFamily: 'var(--font-mono)' }}
        >
          Розпізнано
          {result.stub && ' · модель вчиться'}
        </div>
        <div
          className="mt-1 text-[38px] font-normal tracking-[-0.03em] text-[color:var(--green-deep)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {WASTE_CATEGORY_LABELS_UA[topCategory]}
        </div>

        <div className="mt-[18px] flex items-baseline gap-2">
          <span
            className="text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-mute)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Впевненість
          </span>
          <span className="text-sm font-bold text-[color:var(--green-deep)]">
            {confidencePct}%
            {lowConfidence && !result.stub && (
              <span className="ml-1 font-normal text-[color:var(--ink-mute)]">
                · фото неоднозначне
              </span>
            )}
          </span>
        </div>
        <div className="mt-1.5 h-[6px] overflow-hidden rounded-[3px] bg-[rgba(14,58,35,0.08)]">
          <div
            className="h-full rounded-[3px]"
            style={{ width: `${confidencePct}%`, background: s.color }}
          />
        </div>
      </div>

      {/* All-scores breakdown */}
      <div
        className="rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white p-[18px]"
        style={{ boxShadow: 'var(--tf-shadow-sm)' }}
      >
        <div
          className="mb-2.5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Усі категорії
        </div>
        <div className="space-y-2">
          {WASTE_CATEGORIES.map((cat) => {
            const pct = Math.round((result.all_scores[cat] ?? 0) * 100);
            const isTop = cat === topCategory;
            const catCol = categoryStyle[cat].color;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      isTop
                        ? 'font-semibold text-[color:var(--ink)]'
                        : 'text-[color:var(--ink-mute)]'
                    }
                  >
                    <span
                      aria-hidden
                      className="mr-1.5 inline-block size-[8px] rounded-full align-middle"
                      style={{ background: catCol }}
                    />
                    {WASTE_CATEGORY_LABELS_UA[cat]}
                  </span>
                  <span
                    className={isTop ? 'font-semibold' : 'text-[color:var(--ink-mute)]'}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="mt-1 h-[4px] overflow-hidden rounded-full bg-[rgba(14,58,35,0.06)]">
                  <div
                    className="h-full"
                    style={{
                      width: `${pct}%`,
                      background: isTop ? catCol : 'rgba(14,58,35,0.28)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to prep */}
      <div
        className="rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white p-[18px]"
        style={{ boxShadow: 'var(--tf-shadow-sm)' }}
      >
        <div
          className="mb-2.5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Як підготувати
        </div>
        <ol className="m-0 list-none p-0">
          {prep.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 py-2 text-sm text-[color:var(--ink-soft)]"
              style={{
                borderBottom:
                  i < prep.length - 1 ? '1px dashed rgba(14,58,35,0.1)' : 'none',
              }}
            >
              <span
                className="grid size-[22px] shrink-0 place-items-center rounded-full text-xs font-bold"
                style={{ background: s.bg, color: s.color }}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {result.stub && (
        <p className="flex items-start gap-2 rounded-[14px] bg-[color:var(--green-pale)] p-3 text-xs text-[color:var(--ink-soft)]">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Модель класифікатора ще не завантажена — показуємо приблизний результат.
          Справжні прогнози зʼявляться після завершення тренування.
        </p>
      )}

      {previewUrl && (
        <div
          className="flex items-center gap-3 rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white p-[12px]"
          style={{ boxShadow: 'var(--tf-shadow-sm)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Ваше фото"
            className="size-14 shrink-0 rounded-[12px] object-cover"
          />
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Ваше фото
            </div>
            <div className="mt-0.5 text-sm font-semibold text-[color:var(--green-deep)]">
              Збережено локально
            </div>
          </div>
        </div>
      )}

      <Link
        href={{ pathname: '/points', query: { category: topCategory } }}
        className="flex w-full items-center justify-center gap-2.5 rounded-[22px] bg-[color:var(--green-deep)] px-[22px] py-[15px] text-[15px] font-semibold tracking-[-0.01em] text-white"
      >
        <MapPin className="size-[18px]" strokeWidth={2} />
        Знайти найближчу точку
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
