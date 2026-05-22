import hashlib
import random
import time
from typing import Any


def _extract_features(rows: list[dict[str, Any]]) -> tuple[float, float, float]:
    capacity = [float(r["capacity_ah"]) for r in rows]
    early = sum(capacity[:50]) / min(50, len(capacity))
    rate = (capacity[0] - capacity[-1]) / len(capacity)
    return early, rate, capacity[0]


def _normalize_breakdown(e: int, m: int, c: int, q: int) -> dict[str, int]:
    total = e + m + c + q
    if total == 0:
        return {"electrical": 25, "mechanical": 30, "chemical": 35, "coulombic": 10}
    scaled = {
        "electrical": round(e * 100 / total),
        "mechanical": round(m * 100 / total),
        "chemical": round(c * 100 / total),
        "coulombic": round(q * 100 / total),
    }
    scaled["chemical"] += 100 - sum(scaled.values())
    return scaled


def _interpolate(anchors: list[tuple[float, float]], target: float) -> float:
    if target <= anchors[0][0]:
        return anchors[0][1]
    if target >= anchors[-1][0]:
        return anchors[-1][1]
    for (c0, v0), (c1, v1) in zip(anchors, anchors[1:]):
        if c0 <= target <= c1:
            span = c1 - c0
            return v0 if span == 0 else v0 + ((target - c0) / span) * (v1 - v0)
    return anchors[-1][1]


def _build_curve(cycle_life: int, cap500: float, cap1000: float) -> list[dict[str, float]]:
    anchors: list[tuple[float, float]] = [(0, 100.0)]
    if cycle_life >= 500:
        anchors.append((500, cap500))
    if cycle_life >= 1000:
        anchors.append((1000, cap1000))
    if anchors[-1][0] != cycle_life:
        anchors.append((cycle_life, max(75.0, cap1000 - 5)))

    step = max(50, cycle_life // 25)
    curve: list[dict[str, float]] = []
    for cycle in range(0, cycle_life + 1, step):
        capacity = _interpolate(anchors, cycle)
        band = 1 + (cycle / max(cycle_life, 1)) * 2
        curve.append(
            {
                "cycle": cycle,
                "capacity": round(capacity, 2),
                "lower": round(max(75, capacity - band), 2),
                "upper": round(min(100, capacity + band), 2),
            }
        )
    if curve[-1]["cycle"] != cycle_life:
        capacity = _interpolate(anchors, cycle_life)
        curve.append(
            {
                "cycle": cycle_life,
                "capacity": round(capacity, 2),
                "lower": round(max(75, capacity - 3), 2),
                "upper": round(min(100, capacity + 3), 2),
            }
        )
    return curve


def generate_prediction(rows: list[dict[str, Any]], battery_label: str | None = None) -> dict[str, Any]:
    time.sleep(1.2)

    early, rate, initial = _extract_features(rows)
    cycle_life = round(800 + early * 200 - rate * 5000)
    cycle_life = max(300, min(3000, cycle_life))

    norm = 100 / initial if initial > 0 else 1
    capacity_at_500 = round(early * 0.92 * norm, 1)
    capacity_at_1000 = round(early * 0.85 * norm, 1)
    ci_low = round(early * 0.82 * norm, 1)
    ci_high = round(early * 0.88 * norm, 1)

    rng = random.Random(hash(str(rows[:5]) + (battery_label or "")))
    degradation_breakdown = _normalize_breakdown(
        20 + rng.randint(0, 10),
        25 + rng.randint(0, 10),
        30 + rng.randint(0, 10),
        5 + rng.randint(0, 10),
    )

    seed = str(rows[:5]) + (battery_label or "")
    prediction_id = "pred_" + hashlib.sha256(seed.encode()).hexdigest()[:8]

    return {
        "prediction_id": prediction_id,
        "cycle_life": cycle_life,
        "capacity_at_500": capacity_at_500,
        "capacity_at_1000": capacity_at_1000,
        "confidence_interval": (ci_low, ci_high),
        "degradation_breakdown": degradation_breakdown,
        "capacity_curve": _build_curve(cycle_life, capacity_at_500, capacity_at_1000),
    }
