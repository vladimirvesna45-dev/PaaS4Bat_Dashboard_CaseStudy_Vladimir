# Testing Guide

## Automated Tests

### Backend

```bash
cd backend
python -m pytest -q
```

Expected result: all backend tests pass.

### Frontend

```bash
cd frontend
npm run build
npm run lint
```

Expected result: frontend build and lint complete successfully.

## Manual Test Cases

| ID | Test | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| T-01 | Upload valid CSV | Upload `sample_battery.csv` from `frontend/public/sample/` | Prediction dashboard displays chart, metrics, confidence interval, and degradation breakdown | Dashboard displayed prediction results correctly | Pass |
| T-02 | Upload invalid file | Upload a `.png` or `.jpg` file | User-friendly validation error is shown | Error message was shown and prediction was not submitted | Pass |
| T-03 | Upload CSV with missing columns | Upload a CSV missing `capacity_ah` or `cycle` | Graceful validation error is shown | Missing column error was shown | Pass |
| T-04 | Use Sample Data | Click `Use Sample Data` | Dashboard populates with mock sample prediction | Dashboard loaded sample battery prediction | Pass |
| T-05 | Responsive on tablet | Open app at 768px width using browser DevTools | Layout adapts with no horizontal scrolling | Layout adapted correctly with no horizontal scroll | Pass |
| T-06 | Loading state | Submit a CSV and observe UI while API request is running | Spinner or skeleton is shown during prediction | Loading state was visible before results loaded | Pass |
| T-07 | API error handling | Stop backend API, then submit a valid CSV | User-friendly API error or fallback behavior is shown | Client fallback/mock prediction handled the failure gracefully | Pass |
| T-08 | Deployed URL accessible | Open the public Scaleway deployment URL | Anyone with the link can access and use the dashboard | Public Scaleway deployment URL loaded successfully and the dashboard was accessible from the browser | Pass |
| T-09 | Chart interactivity | Hover over chart points and use zoom/pan if enabled | Tooltip values display correctly; zoom works if implemented | Tooltips displayed values correctly | Pass |
| T-10 | Export functionality | Click `Export CSV` and `Export PDF` | CSV and PDF reports download correctly | CSV and PDF files downloaded correctly | Pass |