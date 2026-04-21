import { NextResponse } from 'next/server';
import { classifyViaMl } from '@/lib/ml-proxy';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.startsWith('multipart/form-data')) {
    return NextResponse.json(
      { error: 'expected multipart/form-data' },
      { status: 415 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'malformed form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'missing file field' }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `unsupported mime: ${file.type}` },
      { status: 415 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: 'empty upload' }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `file exceeds ${MAX_UPLOAD_BYTES} bytes` },
      { status: 413 },
    );
  }

  const result = await classifyViaMl(file);
  return NextResponse.json(result);
}
