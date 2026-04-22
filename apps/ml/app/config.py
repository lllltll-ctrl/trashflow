"""Environment-driven config for the ML service."""

from pathlib import Path

from pydantic import Field, HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings. Values come from environment or a .env file."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="ML_", extra="ignore")

    model_path: Path = Field(
        default=Path("app/models/trash_yolov8s.pt"),
        description="Local path where fine-tuned YOLOv8 weights are cached.",
    )
    weights_url: HttpUrl | None = Field(
        default=None,
        description=(
            "Optional HTTPS URL to download weights from on startup if the local file is "
            "absent. Typically a Supabase Storage public URL to trash_yolov8s.pt."
        ),
    )
    allow_stub: bool = Field(
        default=True,
        description="If weights are missing, return stub predictions instead of crashing.",
    )
    max_image_size: int = Field(default=640, description="Max side length after resize.")
    confidence_threshold: float = Field(default=0.25, ge=0.0, le=1.0)
    api_key: str | None = Field(default=None, description="Optional shared secret for /classify.")
    sentry_dsn: str | None = None
    environment: str = Field(default="development")


settings = Settings()
