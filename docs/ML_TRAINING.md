# ML training — YOLOv8 on TACO

## Goal

Fine-tune `yolov8s.pt` on TACO (remapped to our 5 classes) to ship a classifier with:
- mAP@50 ≥ 0.55 on TACO val split.
- p95 inference ≤ 800 ms on Railway free tier (CPU, 512 MB).
- Model file ≤ 30 MB (fits inside the Docker image comfortably).

## Class mapping

| Our class   | TACO super-categories                                      |
|-------------|------------------------------------------------------------|
| `plastic`   | `Plastic bag & wrapper`, `Plastic container`, `PET bottle`, `Other plastic` |
| `paper`     | `Paper`, `Carton`                                          |
| `glass`     | `Glass bottle`, `Glass jar`, `Broken glass`                |
| `metal`     | `Aluminium foil`, `Metal bottle cap`, `Metal container`    |
| `hazardous` | `Battery`, `Cigarette`, `Electronics`                      |

Anything outside these maps → drop (or label as `other` during training and discard at export).

## Colab notebook

```python
!pip install -q ultralytics roboflow

from ultralytics import YOLO
from roboflow import Roboflow

rf = Roboflow(api_key="…")
dataset = rf.workspace().project("taco-trash").version(1).download("yolov8")

model = YOLO("yolov8s.pt")
results = model.train(
    data=f"{dataset.location}/data.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    patience=10,
    project="trashflow",
    name="yolov8s_taco_5class",
    augment=True,
    mixup=0.1,
    copy_paste=0.1,
)
model.export(format="onnx", optimize=True)
```

Expected runtime: ~30 minutes on Colab T4.

## Deliverables

- `trash_yolov8s.pt` — PyTorch weights (committed via Railway volume, NOT git).
- `trash_yolov8s.onnx` — optimized ONNX (fallback for CPU inference).
- `metrics.json` — per-class precision/recall + mAP@50.

## Deploying to Railway

Railway doesn't persist the workspace between deploys. Two options:

1. **S3 fetch on startup** (recommended) — upload weights to Supabase Storage (public bucket `ml-artifacts`), modify `classifier.py` to download on first load.
2. **Railway Volume** — attach a volume to `/data`, set `ML_MODEL_PATH=/data/trash_yolov8s.pt`, upload once via `railway run rsync`.

Pre-build decision: option 1 (S3 via Supabase Storage). Simpler, works in CI, and Supabase bandwidth is generous on free tier.

## Fallback behavior

If weights are missing and `ML_ALLOW_STUB=true`, the service returns a uniform-ish response marked `stub: true`. The PWA detects this flag and shows a discreet "учимо модель" hint instead of a confident category. This is crucial for the first 12 hours of the hackathon before we swap in the fine-tuned weights.
