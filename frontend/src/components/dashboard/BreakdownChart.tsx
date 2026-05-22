import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import type { DegradationBreakdown } from '@/types/prediction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAppStore } from '@/stores/useAppStore'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706']
const LABELS = ['Electrical', 'Mechanical', 'Chemical', 'Coulombic']

interface BreakdownChartProps {
  breakdown: DegradationBreakdown
}

export function BreakdownChart({ breakdown }: BreakdownChartProps) {
  const darkMode = useAppStore((s) => s.darkMode)
  const textColor = darkMode ? '#94a3b8' : '#64748b'

  const values = [
    breakdown.electrical,
    breakdown.mechanical,
    breakdown.chemical,
    breakdown.coulombic,
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Degradation Mechanism Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mx-auto h-64 max-w-xs">
          <Doughnut
            data={{
              labels: LABELS,
              datasets: [
                {
                  data: values,
                  backgroundColor: COLORS,
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: textColor, padding: 16 },
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
