import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CapacityChart } from '@/components/charts/CapacityChart'
import {
  BatteryComparePanel,
  BatteryComparePlaceholder,
} from '@/components/compare/BatteryComparePanel'
import { DataInputBar } from '@/components/upload/DataInputBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/stores/useAppStore'
import { usePredictFromFile } from '@/hooks/usePrediction'
import { validateCsvUpload } from '@/lib/validateFile'

export function ComparePage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    predictionA,
    predictionB,
    batteryLabel,
    batteryLabelB,
    setBatteryLabelB,
    setPredictionB,
  } = useAppStore()

  const fileMutation = usePredictFromFile()

  if (!predictionA) {
    return <Navigate to="/dashboard" replace />
  }

  const isLoading = fileMutation.isPending

  async function addBatteryB(file: File) {
    setError(null)

    try {
      validateCsvUpload(file)

      const prediction = await fileMutation.mutateAsync({
        file,
        batteryLabel: batteryLabelB,
      })

      setPredictionB(prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison upload failed')
    }
  }

  async function loadSampleB() {
    setError(null)

    try {
      const label = 'Battery B'
      const res = await fetch('/sample/sample_battery_b.csv')

      if (!res.ok) {
        throw new Error('Could not load sample B')
      }

      const blob = await res.blob()
      const file = new File([blob], 'sample_battery_b.csv', {
        type: 'text/csv',
      })

      setBatteryLabelB(label)

      const prediction = await fileMutation.mutateAsync({
        file,
        batteryLabel: label,
      })

      setPredictionB(prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample B')
    }
  }

  const series = [
    {
      label: batteryLabel,
      curve: predictionA.capacity_curve,
      color: '#2563eb',
      showCi: false,
    },
    ...(predictionB
      ? [
          {
            label: batteryLabelB,
            curve: predictionB!.capacity_curve,
            color: '#dc2626',
            showCi: false,
          },
        ]
      : []),
  ]

  const maxCycle = Math.max(predictionA.cycle_life, predictionB?.cycle_life ?? 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Battery Comparison</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Compare degradation trajectories and key metrics side-by-side.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overlay: Capacity vs Cycles</CardTitle>
        </CardHeader>
        <CardContent>
          <CapacityChart series={series} cycleLife={maxCycle} />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Metrics Comparison</h3>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <BatteryComparePanel label={batteryLabel} prediction={predictionA} variant="primary" />

          {predictionB ? (
            <BatteryComparePanel
              label={batteryLabelB}
              prediction={predictionB}
              variant="secondary"
            />
          ) : (
            <BatteryComparePlaceholder />
          )}
        </div>
      </section>

      {!predictionB && (
        <Card>
          <CardHeader>
            <CardTitle>Add Second Battery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataInputBar
              batteryLabel={batteryLabelB}
              onBatteryLabelChange={setBatteryLabelB}
              onFileSelect={addBatteryB}
              onSample={loadSampleB}
              disabled={isLoading}
              error={error}
              loadingMessage={isLoading ? 'Running prediction…' : undefined}
            />
          </CardContent>
        </Card>
      )}

      <Button variant="outline" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </div>
  )
}
