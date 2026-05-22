import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { Line } from 'react-chartjs-2'
import type { CapacityPoint } from '@/types/prediction'
import { useAppStore } from '@/stores/useAppStore'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin,
)

interface Series {
  label: string
  curve: CapacityPoint[]
  color: string
  showCi?: boolean
}

interface CapacityChartProps {
  series: Series[]
  cycleLife?: number
  height?: number
}

function ciFillColor(hexColor: string): string {
  return `${hexColor}12`
}

export function CapacityChart({ series, cycleLife, height = 360 }: CapacityChartProps) {
  const darkMode = useAppStore((s) => s.darkMode)
  const textColor = darkMode ? '#94a3b8' : '#64748b'
  const gridColor = darkMode ? '#334155' : '#e2e8f0'

  const maxCycle = cycleLife ?? Math.max(...series.flatMap((s) => s.curve.map((p) => p.cycle)), 1000)
  const showCiOnChart = series.some((s) => s.showCi !== false)

  const datasets = series.flatMap((s) => {
    const showCi = s.showCi !== false

    if (!showCi) {
      return [
        {
          label: s.label,
          data: s.curve.map((p) => ({ x: p.cycle, y: p.capacity })),
          borderColor: s.color,
          backgroundColor: s.color,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,
          tension: 0.3,
          order: 1,
        },
      ]
    }

    return [
      {
        label: `${s.label} (upper CI)`,
        data: s.curve.map((p) => ({ x: p.cycle, y: p.upper })),
        borderColor: 'transparent',
        backgroundColor: ciFillColor(s.color),
        pointRadius: 0,
        fill: '+1' as const,
        tension: 0.3,
        order: 3,
        pointHoverRadius: 0,
        hoverRadius: 0,
        hitRadius: 0,
      },
      {
        label: `${s.label} (lower CI)`,
        data: s.curve.map((p) => ({ x: p.cycle, y: p.lower })),
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        pointRadius: 0,
        fill: false,
        tension: 0.3,
        order: 2,
      },
      {
        label: s.label,
        data: s.curve.map((p) => ({ x: p.cycle, y: p.capacity })),
        borderColor: s.color,
        backgroundColor: s.color,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
        tension: 0.3,
        order: 1,
      },
    ]
  })

  const eolPlugin = {
    id: 'eolLine',
    afterDraw: (chart: ChartJS) => {
      const { ctx, chartArea, scales } = chart
      const y = scales.y.getPixelForValue(80)
      if (y < chartArea.top || y > chartArea.bottom) return
      ctx.save()
      ctx.strokeStyle = darkMode ? '#f87171' : '#dc2626'
      ctx.setLineDash([6, 4])
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(chartArea.left, y)
      ctx.lineTo(chartArea.right, y)
      ctx.stroke()
      ctx.fillStyle = darkMode ? '#f87171' : '#dc2626'
      ctx.font = '11px sans-serif'
      ctx.fillText('80% EOL', chartArea.left + 4, y - 6)
      ctx.restore()
    },
  }

  return (
    <div style={{ height }} className="min-w-0 md:py-4 py-8">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        {showCiOnChart && (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-5 rounded-sm border border-slate-200 dark:border-slate-600"
              style={{ backgroundColor: 'rgba(37, 99, 235, 0.08)' }}
            />
            Shaded area = confidence interval (upper–lower bounds)
          </span>
        )}
        <span>Scroll to zoom · Drag to pan · Double-click to reset</span>
      </div>
      <Line
        plugins={[eolPlugin]}
        data={{ datasets }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: {
                color: textColor,
                filter: (item) => !String(item.text).includes('CI'),
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const label = ctx.dataset.label ?? ''
                  if (label.includes('CI')) return ''
                  const y = ctx.parsed.y
                  const x = ctx.parsed.x
                  if (y == null || x == null) return ''
                  const row = series.find((s) => label === s.label)
                  const curvePoint = row?.curve.find((p) => p.cycle === Math.round(x))
                  if (curvePoint && row?.showCi !== false) {
                    return [
                      `${label}: ${y.toFixed(1)}% @ cycle ${Math.round(x)}`,
                      `CI: ${curvePoint.lower.toFixed(1)}% – ${curvePoint.upper.toFixed(1)}%`,
                    ]
                  }
                  return `${label}: ${y.toFixed(1)}% @ cycle ${Math.round(x)}`
                },
              },
            },
            zoom: {
              pan: { enabled: true, mode: 'xy' },
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'xy',
              },
              limits: {
                x: { min: 0, max: maxCycle },
                y: { min: 75, max: 100 },
              },
            },
          },
          scales: {
            x: {
              type: 'linear',
              min: 0,
              max: maxCycle,
              title: { display: true, text: 'Cycles', color: textColor },
              ticks: { color: textColor },
              grid: { color: gridColor },
            },
            y: {
              min: 75,
              max: 100,
              title: { display: true, text: 'Capacity (%)', color: textColor },
              ticks: { color: textColor, stepSize: 5 },
              grid: { color: gridColor },
            },
          },
        }}
      />
    </div>
  )
}
