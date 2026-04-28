import { describe, expect, it } from 'vitest';
import { safePhotoExtension } from '../complaints-client';

describe('safePhotoExtension', () => {
  it('keeps lowercase jpg', () => {
    expect(safePhotoExtension('photo.jpg')).toBe('jpg');
  });

  it('lowercases JPEG → jpeg', () => {
    expect(safePhotoExtension('IMG_001.JPEG')).toBe('jpeg');
  });

  it('keeps png and webp', () => {
    expect(safePhotoExtension('shot.png')).toBe('png');
    expect(safePhotoExtension('shot.webp')).toBe('webp');
  });

  it('falls back to jpg for unknown extensions', () => {
    expect(safePhotoExtension('animation.gif')).toBe('jpg');
    expect(safePhotoExtension('doc.pdf')).toBe('jpg');
  });

  it('blocks the double-extension trick (.php.jpg)', () => {
    // The last segment is ".jpg" → must NOT yield 'php'.
    expect(safePhotoExtension('exploit.php.jpg')).toBe('jpg');
  });

  it('strips path-traversal noise from filename', () => {
    expect(safePhotoExtension('../../etc/passwd.png')).toBe('png');
  });

  it('falls back to jpg when extension missing', () => {
    expect(safePhotoExtension('no-extension')).toBe('jpg');
    expect(safePhotoExtension('')).toBe('jpg');
  });

  it('strips non-alphanumeric chars before whitelist lookup', () => {
    // ".p-n*g" → "png" after sanitization → allowed.
    expect(safePhotoExtension('weird.p-n*g')).toBe('png');
  });
});
