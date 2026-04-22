"""YOLOv8 classifier wrapper with stub fallback."""

from __future__ import annotations

import io
import logging
from typing import TYPE_CHECKING

from PIL import Image

from .config import settings
from .schemas import WASTE_CATEGORIES, ClassifyResponse, WasteCategory

if TYPE_CHECKING:
    from ultralytics import YOLO

logger = logging.getLogger(__name__)


class Classifier:
    """Lazy-loaded YOLOv8 wrapper. Single global instance."""

    def __init__(self) -> None:
        self._model: YOLO | None = None
        self._version: str = "stub"
        self._loaded: bool = False

    def load(self) -> None:
        """Load weights from disk, fetching them from ML_WEIGHTS_URL first if absent."""
        if self._loaded:
            return

        if not settings.model_path.exists() and settings.weights_url is not None:
            self._fetch_weights()

        if not settings.model_path.exists():
            if not settings.allow_stub:
                raise FileNotFoundError(f"Weights not found at {settings.model_path}")
            logger.warning(
                "Model weights missing at %s — running in stub mode.", settings.model_path
            )
            self._version = "stub"
            self._loaded = True
            return

        from ultralytics import YOLO  # noqa: PLC0415 — heavy import, keep lazy

        logger.info("Loading YOLOv8 weights from %s", settings.model_path)
        self._model = YOLO(str(settings.model_path))
        self._version = settings.model_path.stem
        self._loaded = True

    @staticmethod
    def _fetch_weights() -> None:
        """Download weights from settings.weights_url to settings.model_path.

        Falls back to leaving the file absent (so stub mode kicks in) if the
        download fails — we never want a flaky network to kill the service.
        """
        import urllib.request  # noqa: PLC0415 — stdlib, no startup cost worth hoisting
        import shutil
        from tempfile import NamedTemporaryFile

        url = str(settings.weights_url)
        target = settings.model_path
        target.parent.mkdir(parents=True, exist_ok=True)

        logger.info("Downloading weights from %s", url)
        try:
            with urllib.request.urlopen(url, timeout=60) as response:  # noqa: S310 — URL is config-provided
                with NamedTemporaryFile(dir=target.parent, delete=False) as tmp:
                    shutil.copyfileobj(response, tmp)
                    tmp_path = tmp.name
            shutil.move(tmp_path, target)
            logger.info(
                "Weights cached at %s (%d bytes)", target, target.stat().st_size
            )
        except Exception as err:  # noqa: BLE001 — we intentionally swallow to allow stub fallback
            logger.error("Failed to download weights: %s", err)

    @property
    def is_stub(self) -> bool:
        return self._model is None

    @property
    def version(self) -> str:
        return self._version

    @property
    def loaded(self) -> bool:
        return self._loaded

    def classify(self, image_bytes: bytes) -> ClassifyResponse:
        """Run inference on raw image bytes and return a typed response."""
        if not self._loaded:
            self.load()

        image = self._preprocess(image_bytes)

        if self._model is None:
            return self._stub_response()

        results = self._model.predict(
            source=image,
            imgsz=settings.max_image_size,
            conf=settings.confidence_threshold,
            verbose=False,
        )

        scores = self._extract_scores(results)
        category, confidence = max(scores.items(), key=lambda kv: kv[1])
        return ClassifyResponse(
            category=category,
            confidence=round(confidence, 4),
            all_scores={k: round(v, 4) for k, v in scores.items()},
            model_version=self._version,
            stub=False,
        )

    @staticmethod
    def _preprocess(image_bytes: bytes) -> Image.Image:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image.thumbnail((settings.max_image_size, settings.max_image_size))
        return image

    @staticmethod
    def _stub_response() -> ClassifyResponse:
        # Uniform-ish distribution with a slight bias toward plastic (the most common class)
        # so the frontend can still demo the UI flow without real weights.
        stub_scores: dict[WasteCategory, float] = {
            "plastic": 0.35,
            "paper": 0.20,
            "glass": 0.15,
            "metal": 0.15,
            "hazardous": 0.15,
        }
        return ClassifyResponse(
            category="plastic",
            confidence=0.35,
            all_scores=stub_scores,
            model_version="stub",
            stub=True,
        )

    @staticmethod
    def _extract_scores(results: object) -> dict[WasteCategory, float]:
        """Map YOLOv8 raw outputs to our 5-class schema.

        YOLOv8 `classify` task returns `probs` per class in the order the model was trained on.
        We trust the model's class ordering matches WASTE_CATEGORIES — fine-tune scripts must
        enforce this.
        """
        # results is a list with one Results object per image
        first = results[0] if isinstance(results, list) else results  # type: ignore[index]
        probs = getattr(first, "probs", None)
        if probs is None:
            return {cat: 1.0 / len(WASTE_CATEGORIES) for cat in WASTE_CATEGORIES}

        raw = probs.data.tolist() if hasattr(probs, "data") else list(probs)
        if len(raw) != len(WASTE_CATEGORIES):
            logger.warning(
                "Model returned %d classes, expected %d — padding with zeros.",
                len(raw),
                len(WASTE_CATEGORIES),
            )
            raw = (raw + [0.0] * len(WASTE_CATEGORIES))[: len(WASTE_CATEGORIES)]

        return dict(zip(WASTE_CATEGORIES, raw, strict=True))


classifier = Classifier()
