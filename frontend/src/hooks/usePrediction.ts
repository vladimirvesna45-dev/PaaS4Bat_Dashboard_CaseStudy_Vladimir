import { useMutation } from '@tanstack/react-query'
import { predictFromFile } from '@/lib/apiClient'

export function usePredictFromFile() {
  return useMutation({
    mutationFn: ({ file, batteryLabel }: { file: File; batteryLabel?: string }) =>
      predictFromFile(file, batteryLabel),
  })
}

