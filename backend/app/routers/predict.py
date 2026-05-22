from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.schemas import PredictJsonRequest, PredictionResponse
from app.services.csv_parser import parse_csv_bytes
from app.services.mock_predictor import generate_prediction

router = APIRouter(prefix="/api", tags=["predict"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/predict", response_model=PredictionResponse)
async def predict_file(
    file: UploadFile = File(...),
    battery_label: str | None = Form(default=None),
) -> PredictionResponse:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=415, detail="Only .csv files are accepted")

    data = await file.read()
    try:
        rows = parse_csv_bytes(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    result = generate_prediction(rows, battery_label)
    return PredictionResponse(**result)

