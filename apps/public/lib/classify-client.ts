'use client';

import type { WasteCategoryId } from '@trashflow/db';

export type ClassifyResult = {
  category: WasteCategoryId;
  confidence: number;
  all_scores: Record<WasteCategoryId, number>;
  model_version: string;
  stub: boolean;
};

export async function classify(file: File): Promise<ClassifyResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/classify', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Сервер повернув ${response.status}`);
  }

  return response.json();
}
