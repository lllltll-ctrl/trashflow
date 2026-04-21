"""Smoke tests for /classify. Runs in stub mode when weights are absent."""

from __future__ import annotations

import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def _make_png(size: tuple[int, int] = (64, 64), color: str = "red") -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format="PNG")
    return buf.getvalue()


def test_healthz(client: TestClient) -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "version" in body
    assert "model_version" in body


def test_classify_stub_returns_valid_shape(client: TestClient) -> None:
    png = _make_png()
    response = client.post(
        "/classify",
        files={"file": ("test.png", png, "image/png")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["category"] in {"plastic", "paper", "glass", "metal", "hazardous"}
    assert 0.0 <= body["confidence"] <= 1.0
    assert set(body["all_scores"]) == {"plastic", "paper", "glass", "metal", "hazardous"}
    assert abs(sum(body["all_scores"].values()) - 1.0) < 0.01


def test_classify_rejects_bad_mime(client: TestClient) -> None:
    response = client.post(
        "/classify",
        files={"file": ("test.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 415


def test_classify_rejects_empty(client: TestClient) -> None:
    response = client.post(
        "/classify",
        files={"file": ("empty.png", b"", "image/png")},
    )
    assert response.status_code == 400
