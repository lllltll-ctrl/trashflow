"""FastAPI entrypoint for the TrashFlow CV service."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Annotated, AsyncIterator

import sentry_sdk
from fastapi import Depends, FastAPI, Header, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .classifier import classifier
from .config import settings
from .image_magic import ALLOWED_IMAGE_MIMES, sniff_image_mime
from .schemas import ClassifyResponse, HealthResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("trashflow.ml")

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        traces_sample_rate=0.1,
    )

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    classifier.load()
    logger.info("ML service ready — model_version=%s stub=%s", classifier.version, classifier.is_stub)
    yield


app = FastAPI(
    title="TrashFlow ML",
    version=__version__,
    description="YOLOv8 waste classifier — 5 classes",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


async def verify_api_key(x_api_key: Annotated[str | None, Header()] = None) -> None:
    if settings.api_key and x_api_key != settings.api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid api key")


@app.get("/healthz", response_model=HealthResponse, tags=["health"])
async def healthz() -> HealthResponse:
    return HealthResponse(
        version=__version__,
        model_loaded=classifier.loaded,
        model_version=classifier.version,
    )


@app.post(
    "/classify",
    response_model=ClassifyResponse,
    dependencies=[Depends(verify_api_key)],
    tags=["inference"],
)
async def classify(file: UploadFile) -> ClassifyResponse:
    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="empty upload"
        )
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"file exceeds {MAX_UPLOAD_BYTES} bytes",
        )
    sniffed = sniff_image_mime(contents[:16])
    if sniffed is None or sniffed not in ALLOWED_IMAGE_MIMES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="file is not a supported image (jpeg/png/webp)",
        )

    return classifier.classify(contents)
