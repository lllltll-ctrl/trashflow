"""File-signature ("magic bytes") sniffing for accepted image MIME types.

Used at the API boundary so we don't trust the client-supplied
``Content-Type`` header — an attacker can label any payload ``image/jpeg``.
"""

from __future__ import annotations

from typing import Final, Literal

AllowedImageMime = Literal["image/jpeg", "image/png", "image/webp"]

ALLOWED_IMAGE_MIMES: Final[frozenset[AllowedImageMime]] = frozenset(
    {"image/jpeg", "image/png", "image/webp"}
)


def sniff_image_mime(buf: bytes) -> AllowedImageMime | None:
    """Return the detected image MIME, or ``None`` if not a supported format."""
    if len(buf) >= 3 and buf[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if len(buf) >= 8 and buf[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if len(buf) >= 12 and buf[:4] == b"RIFF" and buf[8:12] == b"WEBP":
        return "image/webp"
    return None
