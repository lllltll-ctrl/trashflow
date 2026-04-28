"""Unit tests for the magic-bytes sniffer.

Pure-function tests — no FastAPI client, no model load, no network.
"""

from __future__ import annotations

import pytest

from app.image_magic import ALLOWED_IMAGE_MIMES, sniff_image_mime

PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
JPEG_MAGIC = b"\xff\xd8\xff\xe0"
WEBP_RIFF = b"RIFF\x00\x00\x00\x00WEBPVP8L"
RIFF_AVI = b"RIFF\x00\x00\x00\x00AVI LIST"
PE_EXE = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00"


@pytest.mark.unit
def test_jpeg_detected_from_three_byte_magic() -> None:
    assert sniff_image_mime(JPEG_MAGIC + b"more bytes here") == "image/jpeg"


@pytest.mark.unit
def test_png_detected_from_eight_byte_signature() -> None:
    assert sniff_image_mime(PNG_MAGIC + b"IHDR" + b"\x00" * 16) == "image/png"


@pytest.mark.unit
def test_webp_detected_from_riff_plus_webp_fourcc() -> None:
    assert sniff_image_mime(WEBP_RIFF) == "image/webp"


@pytest.mark.unit
def test_pe_executable_disguised_as_image_returns_none() -> None:
    assert sniff_image_mime(PE_EXE) is None


@pytest.mark.unit
def test_riff_without_webp_fourcc_returns_none() -> None:
    # AVI/WAV both use the RIFF container — they must NOT be classified as image.
    assert sniff_image_mime(RIFF_AVI) is None


@pytest.mark.unit
def test_empty_bytes_returns_none() -> None:
    assert sniff_image_mime(b"") is None


@pytest.mark.unit
def test_truncated_signatures_return_none() -> None:
    assert sniff_image_mime(JPEG_MAGIC[:2]) is None
    assert sniff_image_mime(PNG_MAGIC[:7]) is None
    assert sniff_image_mime(WEBP_RIFF[:11]) is None


@pytest.mark.unit
def test_allowed_mimes_set_matches_supported_types() -> None:
    assert ALLOWED_IMAGE_MIMES == frozenset({"image/jpeg", "image/png", "image/webp"})


@pytest.mark.unit
def test_corrupted_png_signature_rejected() -> None:
    bad_png = bytearray(PNG_MAGIC)
    bad_png[7] = 0xFF  # Last byte should be 0x0A — flip it.
    assert sniff_image_mime(bytes(bad_png) + b"IHDR") is None
