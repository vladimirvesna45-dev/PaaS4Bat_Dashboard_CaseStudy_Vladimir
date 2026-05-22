import pytest

from app.services.csv_parser import parse_csv_text


def test_parse_valid_csv():
    text = "cycle,capacity_ah\n1,2.5\n2,2.48\n3,2.47\n"
    rows = parse_csv_text(text)
    assert len(rows) == 3
    assert rows[0]["cycle"] == 1.0


def test_missing_column():
    with pytest.raises(ValueError, match="Missing required columns"):
        parse_csv_text("cycle\n1\n")


def test_non_monotonic_cycle():
    text = "cycle,capacity_ah\n1,2.5\n3,2.4\n2,2.3\n"
    with pytest.raises(ValueError, match="monotonically"):
        parse_csv_text(text)
