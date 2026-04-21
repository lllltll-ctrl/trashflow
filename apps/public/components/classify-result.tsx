'use client';

import Link from 'next/link';
import { MapPin, Info } from 'lucide-react';
import {
  Badge,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@trashflow/ui';
import {
  WASTE_CATEGORIES,
  WASTE_CATEGORY_ICONS,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import type { ClassifyResult as Result } from '@/lib/classify-client';

const CONFIDENCE_THRESHOLD = 0.5;

export function ClassifyResult({ result }: { result: Result }) {
  const topCategory = result.category;
  const confidencePct = Math.round(result.confidence * 100);
  const lowConfidence = result.confidence < CONFIDENCE_THRESHOLD;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div
          className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-3xl"
          aria-hidden
        >
          {WASTE_CATEGORY_ICONS[topCategory]}
        </div>
        <div className="flex-1 space-y-1">
          <CardTitle className="flex items-center gap-2">
            {WASTE_CATEGORY_LABELS_UA[topCategory]}
            {result.stub && (
              <Badge variant="outline" className="text-[10px] font-normal">
                модель вчиться
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Впевненість: <strong>{confidencePct}%</strong>
            {lowConfidence && !result.stub && ' — фото неоднозначне'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {WASTE_CATEGORIES.map((cat) => (
            <ScoreBar
              key={cat}
              category={cat}
              score={result.all_scores[cat] ?? 0}
              highlighted={cat === topCategory}
            />
          ))}
        </div>

        {result.stub && (
          <p className="flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Модель класифікатора ще не завантажена — показуємо приблизний результат.
            Справжні прогнози з’являться після завершення тренування моделі.
          </p>
        )}

        <Link
          href={{ pathname: '/points', query: { category: topCategory } }}
          className={buttonVariants({ size: 'lg', className: 'w-full' })}
        >
          <MapPin className="size-4" aria-hidden />
          Знайти найближчу точку
        </Link>
      </CardContent>
    </Card>
  );
}

function ScoreBar({
  category,
  score,
  highlighted,
}: {
  category: WasteCategoryId;
  score: number;
  highlighted: boolean;
}) {
  const pct = Math.round(score * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={highlighted ? 'font-semibold' : 'text-muted-foreground'}>
          {WASTE_CATEGORY_ICONS[category]} {WASTE_CATEGORY_LABELS_UA[category]}
        </span>
        <span className={highlighted ? 'font-semibold' : 'text-muted-foreground'}>{pct}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={highlighted ? 'h-full bg-primary' : 'h-full bg-muted-foreground/40'}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
