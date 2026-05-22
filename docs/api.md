# PaaS4Bat API

Base URL (local dev): `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

## Endpoints

### `GET /api/health`

Returns `{ "status": "ok" }`.

### `POST /api/predict`

Multipart form upload.

| Field | Type | Required |
|-------|------|----------|
| `file` | CSV file | Yes |
| `battery_label` | string | No |


## Response

```json
{
  "prediction_id": "pred_a1b2c3d4",
  "cycle_life": 1842,
  "capacity_at_500": 91.2,
  "capacity_at_1000": 84.5,
  "confidence_interval": [81.0, 87.5],
  "degradation_breakdown": {
    "electrical": 22,
    "mechanical": 28,
    "chemical": 38,
    "coulombic": 12
  },
  "capacity_curve": [
    { "cycle": 0, "capacity": 100, "lower": 99, "upper": 101 }
  ]
}
```

## Errors

| Status | Meaning |
|--------|---------|
| 415 | Only .csv files are accepted
| 400 | Invalid JSON body
