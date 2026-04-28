import { NextResponse } from 'next/server';
import { classifyViaMl } from '@/lib/ml-proxy';
import { sniffImageMime } from '@/lib/image-magic';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

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

  if (file.size === 0) {
    return NextResponse.json({ error: 'empty upload' }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `file exceeds ${MAX_UPLOAD_BYTES} bytes` },
      { status: 413 },
    );
  }

  // Magic-byte sniff: never trust `file.type` from the client.
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const sniffed = sniffImageMime(head);
  if (!sniffed) {
    return NextResponse.json(
      { error: 'file is not a supported image (jpeg/png/webp)' },
      { status: 415 },
    );
  }

  const result = await classifyViaMl(file);
  return NextResponse.json(result);
}
