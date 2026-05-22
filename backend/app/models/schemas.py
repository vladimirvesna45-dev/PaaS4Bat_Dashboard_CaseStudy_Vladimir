from pydantic import BaseModel, Field


class CsvRow(BaseModel):
    cycle: float
    capacity_ah: float
    voltage_avg: float | None = None
    temperature_c: float | None = None
    coulomb_efficiency: float | None = None


class PredictJsonRequest(BaseModel):
    rows: list[CsvRow]
    battery_label: str | None = None


class CapacityPoint(BaseModel):
    cycle: int
    capacity: float
    lower: float
    upper: float


class DegradationBreakdown(BaseModel):
    electrical: int
    mechanical: int
    chemical: int
    coulombic: int


class PredictionResponse(BaseModel):
    prediction_id: str
    cycle_life: int
    capacity_at_500: float
    capacity_at_1000: float
    confidence_interval: tuple[float, float] = Field(..., min_length=2, max_length=2)
    degradation_breakdown: DegradationBreakdown
    capacity_curve: list[CapacityPoint]
