import type { PredictionResponse } from '@/types/prediction'

interface BatteryComparePanelProps {
  label: string
  prediction: PredictionResponse
  variant: 'primary' | 'secondary'
}

const headerStyles = {
  primary: 'bg-brand-600 text-white',
  secondary: 'bg-red-600 text-white',
}

export function BatteryComparePanel({ label, prediction, variant }: BatteryComparePanelProps) {
  const [ciLow, ciHigh] = prediction.confidence_interval
  const metrics = [
    { label: 'Cycle life (EOL)', value: prediction.cycle_life.toLocaleString() },
    { label: 'Confidence interval', value: `${ciLow}% – ${ciHigh}%` },
    { label: 'Capacity @ 500', value: `${prediction.capacity_at_500}%` },
    { label: 'Capacity @ 1000', value: `${prediction.capacity_at_1000}%` },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className={`px-4 py-3 ${headerStyles[variant]}`}>
        <p className="font-semibold">{label}</p>
        <p className="text-xs opacity-80">ID: {prediction.prediction_id}</p>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-px bg-slate-200 dark:bg-slate-700">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col justify-center bg-white p-4 dark:bg-slate-900"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {m.label}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BatteryComparePlaceholder() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Upload or load sample data for battery B to compare metrics
      </p>
    </div>
  )
}
