import csv
import io
from typing import Any

REQUIRED_COLUMNS = {"cycle", "capacity_ah"}
OPTIONAL_COLUMNS = {"voltage_avg", "temperature_c", "coulomb_efficiency"}
MAX_ROWS = 50_000
MAX_FILE_BYTES = 5 * 1024 * 1024


def _parse_float(value: str, field: str, row_num: int) -> float:
    try:
        num = float(value.strip())
    except ValueError as exc:
        raise ValueError(f"Row {row_num}: '{field}' must be a number") from exc
    if num <= 0 and field in ("cycle", "capacity_ah"):
        raise ValueError(f"Row {row_num}: '{field}' must be positive")
    return num


def parse_csv_text(text: str) -> list[dict[str, Any]]:
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("CSV is empty or missing a header row")

    headers = {h.strip().lower() for h in reader.fieldnames if h}
    missing = REQUIRED_COLUMNS - headers
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")

    rows: list[dict[str, Any]] = []
    prev_cycle: float | None = None

    for i, raw in enumerate(reader, start=2):
        if i > MAX_ROWS + 1:
            raise ValueError(f"CSV exceeds maximum of {MAX_ROWS} rows")

        row = {k.strip().lower(): (v.strip() if v else "") for k, v in raw.items() if k}
        cycle = _parse_float(row.get("cycle", ""), "cycle", i)
        capacity_ah = _parse_float(row.get("capacity_ah", ""), "capacity_ah", i)

        if prev_cycle is not None and cycle < prev_cycle:
            raise ValueError(f"Row {i}: cycle values must be monotonically increasing")
        prev_cycle = cycle

        parsed: dict[str, Any] = {"cycle": cycle, "capacity_ah": capacity_ah}
        for col in OPTIONAL_COLUMNS:
            if col in row and row[col]:
                parsed[col] = _parse_float(row[col], col, i)
        rows.append(parsed)

    if not rows:
        raise ValueError("CSV contains no data rows")

    return rows


def parse_csv_bytes(data: bytes) -> list[dict[str, Any]]:
    if len(data) > MAX_FILE_BYTES:
        raise ValueError("File exceeds 5 MB limit")
    try:
        text = data.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise ValueError("File must be UTF-8 encoded text") from exc
    return parse_csv_text(text)
