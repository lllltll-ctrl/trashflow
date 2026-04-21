# @trashflow/ml

FastAPI service exposing a fine-tuned YOLOv8s model for 5 waste classes
(`plastic`, `paper`, `glass`, `metal`, `hazardous`).

## Run locally

```bash
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

If weights are missing in `app/models/`, the classifier falls back to a stub
response with low confidence so the rest of the stack can still boot.

## Endpoints

- `GET  /healthz`    — liveness + model version
- `POST /classify`   — multipart `file` → `{category, confidence, all_scores}`

## Fine-tune

See [docs/ML_TRAINING.md](../../docs/ML_TRAINING.md) (Day 2 plan).
