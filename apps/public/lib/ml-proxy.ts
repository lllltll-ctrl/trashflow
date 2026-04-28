import 'server-only';
import type { WasteCategoryId } from '@trashflow/db';

export type ClassifyResult = {
  category: WasteCategoryId;
  confidence: number;
  all_scores: Record<WasteCategoryId, number>;
  model_version: string;
  stub: boolean;
};

const STUB_RESULT: ClassifyResult = {
  category: 'plastic',
  confidence: 0.35,
  all_scores: {
    plastic: 0.35,
    paper: 0.2,
    glass: 0.15,
    metal: 0.15,
    hazardous: 0.15,
  },
  model_version: 'proxy-stub',
  stub: true,
};

const FETCH_TIMEOUT_MS = 8_000;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

function resolveServiceOrigin(): string {
  const raw = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`ML_SERVICE_URL is not a valid URL: ${raw}`);
  }
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(
      `ML_SERVICE_URL must use http(s); got "${parsed.protocol}" in ${raw}`,
    );
  }
  return parsed.origin;
}

export async function classifyViaMl(file: File): Promise<ClassifyResult> {
  let origin: string;
  try {
    origin = resolveServiceOrigin();
  } catch (error) {
    console.error('[ml-proxy] invalid ML_SERVICE_URL — refusing to call:', String(error));
    return STUB_RESULT;
  }
  const apiKey = process.env.ML_SERVICE_API_KEY;

  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${origin}/classify`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: apiKey ? { 'X-API-Key': apiKey } : undefined,
    });

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }

    const payload = (await response.json()) as ClassifyResult;
    return payload;
  } catch (error) {
    console.warn('[ml-proxy] ML service unreachable — returning stub:', String(error));
    return STUB_RESULT;
  } finally {
    clearTimeout(timeout);
  }
}
