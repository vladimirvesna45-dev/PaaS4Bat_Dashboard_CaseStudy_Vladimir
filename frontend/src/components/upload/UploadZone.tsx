import { useCallback, useState } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  error?: string | null
}

export function UploadZone({ onFileSelect, disabled, error }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled) return
      const file = e.dataTransfer.files[0]
      if (file) onFileSelect(file)
    },
    [disabled, onFileSelect],
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={[
        'rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
        dragOver
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
          : 'border-slate-300 dark:border-slate-600',
        disabled ? 'opacity-60' : 'cursor-pointer',
      ].join(' ')}
    >
      <Upload className="mx-auto h-10 w-10 text-slate-400" />
      <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
        Drag and drop your CSV here
      </p>
      <p className="mt-1 text-sm text-slate-500">Required columns: cycle, capacity_ah</p>
      <label className="mt-4 inline-block">
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFileSelect(file)
            e.target.value = ''
          }}
        />
        <span
          className={[
            'inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white',
            'transition-all duration-150 hover:bg-brand-700 active:scale-[0.98]',
            disabled ? 'pointer-events-none opacity-50' : '',
          ].join(' ')}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Browse files
        </span>
      </label>
      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface UploadActionsProps {
  onSample: () => void
  disabled?: boolean
}

export function UploadActions({ onSample, disabled }: UploadActionsProps) {
  return (
    <Button variant="outline" onClick={onSample} disabled={disabled}>
      Use Sample Data
    </Button>
  )
}
