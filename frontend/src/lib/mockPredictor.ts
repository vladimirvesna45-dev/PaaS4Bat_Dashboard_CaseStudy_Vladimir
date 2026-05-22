import type { CapacityPoint, CsvRow, PredictionResponse } from '@/types/prediction'

function extractFeatures(rows: CsvRow[]) {
  const capacity = rows.map((r) => r.capacity_ah)
  const early = capacity.slice(0, 50).reduce((a, b) => a + b, 0) / Math.min(50, capacity.length)
  const rate = (capacity[0] - capacity[capacity.length - 1]) / capacity.length
  return { early, rate, initial: capacity[0] }
}

function normalizeBreakdown(e: number, m: number, c: number, q: number) {
  const total = e + m + c + q
  if (total === 0) return { electrical: 25, mechanical: 30, chemical: 35, coulombic: 10 }
  const scaled = {
    electrical: Math.round((e * 100) / total),
    mechanical: Math.round((m * 100) / total),
    chemical: Math.round((c * 100) / total),
    coulombic: Math.round((q * 100) / total),
  }
  scaled.chemical += 100 - (scaled.electrical + scaled.mechanical + scaled.chemical + scaled.coulombic)
  return scaled
}

function interpolate(anchors: [number, number][], target: number) {
  if (target <= anchors[0][0]) return anchors[0][1]
  if (target >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1]
  for (let i = 0; i < anchors.length - 1; i++) {
    const [c0, v0] = anchors[i]
    const [c1, v1] = anchors[i + 1]
    if (c0 <= target && target <= c1) {
      const span = c1 - c0
      return span === 0 ? v0 : v0 + ((target - c0) / span) * (v1 - v0)
    }
  }
  return anchors[anchors.length - 1][1]
}

function buildCurve(cycleLife: number, cap500: number, cap1000: number): CapacityPoint[] {
  const anchors: [number, number][] = [[0, 100]]
  if (cycleLife >= 500) anchors.push([500, cap500])
  if (cycleLife >= 1000) anchors.push([1000, cap1000])
  if (anchors[anchors.length - 1][0] !== cycleLife) {
    anchors.push([cycleLife, Math.max(75, cap1000 - 5)])
  }

  const step = Math.max(50, Math.floor(cycleLife / 25))
  const curve: CapacityPoint[] = []
  for (let cycle = 0; cycle <= cycleLife; cycle += step) {
    const capacity = interpolate(anchors, cycle)
    const band = 1 + (cycle / Math.max(cycleLife, 1)) * 2
    curve.push({
      cycle,
      capacity: Math.round(capacity * 100) / 100,
      lower: Math.round(Math.max(75, capacity - band) * 100) / 100,
      upper: Math.round(Math.min(100, capacity + band) * 100) / 100,
    })
  }
  if (curve[curve.length - 1].cycle !== cycleLife) {
    const capacity = interpolate(anchors, cycleLife)
    curve.push({
      cycle: cycleLife,
      capacity: Math.round(capacity * 100) / 100,
      lower: Math.round(Math.max(75, capacity - 3) * 100) / 100,
      upper: Math.round(Math.min(100, capacity + 3) * 100) / 100,
    })
  }
  return curve
}

async function hashPredictionId(seed: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed))
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `pred_${hex.slice(0, 8)}`
}

/** Client-side mock when the FastAPI service is unreachable (same logic as backend). */
export async function generateMockPrediction(
  rows: CsvRow[],
  batteryLabel?: string,
): Promise<PredictionResponse> {
  await new Promise((r) => setTimeout(r, 1200))

  const { early, rate, initial } = extractFeatures(rows)
  let cycleLife = Math.round(800 + early * 200 - rate * 5000)
  cycleLife = Math.max(300, Math.min(3000, cycleLife))

  const norm = initial > 0 ? 100 / initial : 1
  const capacity_at_500 = Math.round(early * 0.92 * norm * 10) / 10
  const capacity_at_1000 = Math.round(early * 0.85 * norm * 10) / 10
  const ci_low = Math.round(early * 0.82 * norm * 10) / 10
  const ci_high = Math.round(early * 0.88 * norm * 10) / 10

  const degradation_breakdown = normalizeBreakdown(
    20 + Math.floor(Math.random() * 11),
    25 + Math.floor(Math.random() * 11),
    30 + Math.floor(Math.random() * 11),
    5 + Math.floor(Math.random() * 11),
  )

  const seed = JSON.stringify(rows.slice(0, 5)) + (batteryLabel ?? '')
  const prediction_id = await hashPredictionId(seed)

  return {
    prediction_id,
    cycle_life: cycleLife,
    capacity_at_500,
    capacity_at_1000,
    confidence_interval: [ci_low, ci_high],
    degradation_breakdown,
    capacity_curve: buildCurve(cycleLife, capacity_at_500, capacity_at_1000),
  }
}
