from app.services.mock_predictor import generate_prediction


def test_prediction_shape():
    rows = [{"cycle": float(i), "capacity_ah": 2.5 - i * 0.001} for i in range(1, 101)]
    result = generate_prediction(rows, "Test_Cell")
    assert result["prediction_id"].startswith("pred_")
    assert 300 <= result["cycle_life"] <= 3000
    assert len(result["capacity_curve"]) >= 2
    assert result["degradation_breakdown"]["electrical"] >= 0
    breakdown_sum = sum(result["degradation_breakdown"].values())
    assert breakdown_sum == 100
