import type { PredictionResponse } from '@/types/prediction'
import { Card, CardContent } from '@/components/ui/Card'

interface MetricsCardsProps {
  prediction: PredictionResponse
}

const metrics: { label: string; value: (p: PredictionResponse) => string }[] = [
  { label: 'Cycle Life (EOL @ 80%)', value: (p) => p.cycle_life.toLocaleString() },
    {
    label: 'Confidence interval',
    value: (p) => `${p.confidence_interval[0]}% – ${p.confidence_interval[1]}%`,
  },
  { label: 'Capacity @ 500 cycles', value: (p) => `${p.capacity_at_500}%` },
  { label: 'Capacity @ 1000 cycles', value: (p) => `${p.capacity_at_1000}%` },
]

export function MetricsCards({ prediction }: MetricsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => {
        const value = m.value(prediction)
        return (
          <Card key={m.label}>
            <CardContent className="py-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {m.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
