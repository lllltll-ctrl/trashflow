import { describe, expect, it } from 'vitest';
import { sniffImageMime } from '../image-magic';

const u8 = (...bytes: number[]) => new Uint8Array(bytes);

describe('sniffImageMime', () => {
  it('detects JPEG by FF D8 FF magic bytes', () => {
    expect(sniffImageMime(u8(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10))).toBe('image/jpeg');
  });

  it('detects PNG by full 8-byte signature', () => {
    expect(sniffImageMime(u8(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00))).toBe(
      'image/png',
    );
  });

  it('detects WEBP by RIFF + WEBP at offset 8', () => {
    expect(
      sniffImageMime(
        u8(
          0x52,
          0x49,
          0x46,
          0x46,
          0x00,
          0x00,
          0x00,
          0x00,
          0x57,
          0x45,
          0x42,
          0x50,
          0x56,
          0x50,
          0x38,
          0x4c,
        ),
      ),
    ).toBe('image/webp');
  });

  it('returns null for an executable disguised as image (PE header)', () => {
    expect(sniffImageMime(u8(0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00))).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(sniffImageMime(u8())).toBeNull();
  });

  it('returns null for buffer too short to confirm any signature', () => {
    expect(sniffImageMime(u8(0xff, 0xd8))).toBeNull();
    expect(sniffImageMime(u8(0x89, 0x50, 0x4e))).toBeNull();
    expect(sniffImageMime(u8(0x52, 0x49, 0x46, 0x46, 0x00))).toBeNull();
  });

  it('returns null for RIFF without WEBP fourcc (could be WAV/AVI)', () => {
    // RIFF + AVI fourcc — must not be classified as an image.
    expect(
      sniffImageMime(
        u8(
          0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x41, 0x56, 0x49, 0x20, 0x4c, 0x49, 0x53,
          0x54,
        ),
      ),
    ).toBeNull();
  });

  it('rejects PNG header with corrupted final byte (defense against partial spoofs)', () => {
    expect(sniffImageMime(u8(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0xff, 0x00, 0x00))).toBeNull();
  });
});
