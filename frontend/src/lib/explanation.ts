import type { PredictionResponse } from '@/types/prediction'

export function buildExplanation(prediction: PredictionResponse, batteryLabel: string): string {
  const [ciLow, ciHigh] = prediction.confidence_interval
  const { electrical, mechanical, chemical, coulombic } = prediction.degradation_breakdown
  const dominant =
    chemical >= electrical && chemical >= mechanical && chemical >= coulombic
      ? 'chemical degradation'
      : mechanical >= electrical && mechanical >= coulombic
        ? 'mechanical stress'
        : electrical >= coulombic
          ? 'electrical impedance growth'
          : 'coulombic inefficiency'

  return (
    `For ${batteryLabel}, the mock model estimates ${prediction.cycle_life.toLocaleString()} cycles to 80% capacity (EOL). ` +
    `Early-cycle features suggest capacity of ${prediction.capacity_at_500}% at cycle 500 and ${prediction.capacity_at_1000}% at cycle 1000. ` +
    `The reference confidence band spans ${ciLow}%–${ciHigh}% based on early capacity spread. ` +
    `Dominant degradation mechanism: ${dominant} (${chemical}% chemical, ${mechanical}% mechanical, ${electrical}% electrical, ${coulombic}% coulombic). ` +
    `This is a demonstration predictor — connect a production ML endpoint for lab-grade accuracy.`
  )
}
