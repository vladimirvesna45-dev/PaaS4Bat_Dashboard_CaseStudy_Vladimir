export interface CsvRow {
  cycle: number
  capacity_ah: number
  voltage_avg?: number
  temperature_c?: number
  coulomb_efficiency?: number
}

export interface CapacityPoint {
  cycle: number
  capacity: number
  lower: number
  upper: number
}

export interface DegradationBreakdown {
  electrical: number
  mechanical: number
  chemical: number
  coulombic: number
}

export interface PredictionResponse {
  prediction_id: string
  cycle_life: number
  capacity_at_500: number
  capacity_at_1000: number
  confidence_interval: [number, number]
  degradation_breakdown: DegradationBreakdown
  capacity_curve: CapacityPoint[]
}
