import { useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface DataInputBarProps {
  batteryLabel: string
  onBatteryLabelChange: (label: string) => void
  onFileSelect: (file: File) => void
  onSample: () => void
  disabled?: boolean
  error?: string | null
  loadingMessage?: string
}

export function DataInputBar({
  batteryLabel,
  onBatteryLabelChange,
  onFileSelect,
  onSample,
  disabled,
  error,
  loadingMessage,
}: DataInputBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Battery label
        </label>
        <input
          type="text"
          value={batteryLabel}
          onChange={(e) => onBatteryLabelChange(e.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFileSelect(file)
            e.target.value = ''
          }}
        />
        <Button variant="primary" disabled={disabled} onClick={() => inputRef.current?.click()}>
          {disabled && loadingMessage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload CSV
        </Button>
        <Button variant="outline" disabled={disabled} onClick={onSample}>
          Load sample B
        </Button>
      </div>
      {loadingMessage && (
        <p className="text-sm text-slate-500" role="status">
          {loadingMessage}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
