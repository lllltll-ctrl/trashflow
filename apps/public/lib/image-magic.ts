/**
 * File-signature ("magic bytes") sniffing for the three image MIME types we
 * accept. Used at the API boundary so we don't trust the client-supplied
 * `Content-Type` header — an attacker can label any payload `image/jpeg`.
 *
 * Returns the detected MIME, or null if the bytes don't match any allowed
 * format.
 */
export type AllowedImageMime = 'image/jpeg' | 'image/png' | 'image/webp';

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function sniffImageMime(buf: Uint8Array): AllowedImageMime | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
  if (buf.length >= 8 && PNG_MAGIC.every((b, i) => buf[i] === b)) {
    return 'image/png';
  }
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}
