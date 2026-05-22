import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { UploadZone, UploadActions } from '@/components/upload/UploadZone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { predictFromFile } from '@/lib/apiClient'
import { validateCsvUpload } from '@/lib/validateFile'
import { useAppStore } from '@/stores/useAppStore'

export function UploadPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const {
    batteryLabel,
    setBatteryLabel,
    setPredictionA,
    beginUploadSession,
  } = useAppStore()


  async function runPrediction(file: File) {
    setError(null)
    setIsLoading(true)
    try {
      validateCsvUpload(file)
      const prediction = await predictFromFile(file)
      setPredictionA(prediction)
      navigate('/dashboard')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

async function loadSample() {
  setError(null)
  setIsLoading(true)
  try {
    const label = 'Battery A'
    const res = await fetch('/sample/sample_battery.csv')
    if (!res.ok) {
      throw new Error('Could not load sample data')
    }
    const blob = await res.blob()
    const file = new File([blob], 'sample_battery.csv', {
      type: 'text/csv',
    })
    setBatteryLabel(label)
    beginUploadSession()
    const prediction = await predictFromFile(file, label)
    setPredictionA(prediction)
    navigate('/dashboard')
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load sample data')
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Battery Data</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Upload early-cycle CSV data (cycles 1–100) to predict capacity fade and remaining useful
          life.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Battery Identifier</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            value={batteryLabel}
            onChange={(e) => setBatteryLabel(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            placeholder="e.g. Cell_001_LFP"
          />
        </CardContent>
      </Card>

      <UploadZone onFileSelect={runPrediction} disabled={isLoading} error={error} />

      <div className="flex flex-wrap gap-3">
        <UploadActions onSample={loadSample} disabled={isLoading} />
        {isLoading && (
          <Button disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            Running prediction…
          </Button>
        )}
      </div>
    </div>
  )
}
