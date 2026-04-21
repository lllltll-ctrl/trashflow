"""Request/response schemas."""

from typing import Literal

from pydantic import BaseModel, Field

WasteCategory = Literal["plastic", "paper", "glass", "metal", "hazardous"]

WASTE_CATEGORIES: tuple[WasteCategory, ...] = (
    "plastic",
    "paper",
    "glass",
    "metal",
    "hazardous",
)


class ClassifyResponse(BaseModel):
    """YOLOv8 classification response."""

    category: WasteCategory = Field(..., description="Top-1 predicted waste category.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Top-1 confidence in [0, 1].")
    all_scores: dict[WasteCategory, float] = Field(
        ..., description="Softmax-normalized scores across all classes."
    )
    model_version: str = Field(..., description="Loaded model weights identifier.")
    stub: bool = Field(default=False, description="True when weights are missing and stub is used.")


class HealthResponse(BaseModel):
    """Service health + model status."""

    status: Literal["ok"] = "ok"
    version: str
    model_loaded: bool
    model_version: str
