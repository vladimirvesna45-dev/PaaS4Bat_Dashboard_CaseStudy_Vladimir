import { parseCsvFile } from '@/lib/csvParser'
import { generateMockPrediction } from '@/lib/mockPredictor'
import type { PredictionResponse } from '@/types/prediction'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const REQUEST_TIMEOUT_MS = 1_500

function isApiUnreachable(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.name === 'AbortError' ||
      err.message.includes('Failed to fetch') ||
      err.message.includes('NetworkError') ||
      err.message.includes('timed out')
    )
  }
  return false
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Prediction request timed out. Is the backend running on port 8000?', {
        cause: err,
      })
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

function formatApiError(res: Response, fallback: string): Promise<never> {
  return res.json().catch(() => ({ detail: res.statusText })).then((err) => {
    const detail = err?.detail
    if (typeof detail === 'string') {
      throw new Error(detail)
    }
    if (Array.isArray(detail)) {
      throw new Error(detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(', ') || fallback)
    }
    if (res.status === 503 || res.status >= 500) {
      throw new Error('Prediction service is temporarily unavailable. Please try again.')
    }
    if (res.status === 400) {
      throw new Error('Invalid data sent to the server. Check your CSV format.')
    }
    throw new Error(fallback)
  })
}


export async function predictFromFile(
  file: File,
  batteryLabel?: string,
): Promise<PredictionResponse> {
  const form = new FormData()
  form.append('file', file)
  if (batteryLabel) {
    form.append('battery_label', batteryLabel)
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/predict`, {
      method: 'POST',
      body: form,
    })

    if (!res.ok) {
      return formatApiError(res, 'Prediction failed')
    }

    return res.json()
  } catch (err) {
    if (isApiUnreachable(err)) {
      const rows = await parseCsvFile(file)
      console.warn('[PaaS4Bat] API unreachable — using client-side mock predictor.', err)
      return generateMockPrediction(rows, batteryLabel)
    }
    throw err instanceof Error ? err : new Error('Prediction failed')
  }
}


export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/health`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}
