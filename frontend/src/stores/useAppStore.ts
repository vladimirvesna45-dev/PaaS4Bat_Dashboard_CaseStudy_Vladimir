import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CsvRow, PredictionResponse } from '@/types/prediction'

interface AppState {
  batteryLabel: string
  csvRows: CsvRow[]
  predictionA: PredictionResponse | null
  predictionB: PredictionResponse | null
  batteryLabelB: string
  uploadSessionId: number
  darkMode: boolean
  isAuthenticated: boolean
  setBatteryLabel: (label: string) => void
  setCsvRows: (rows: CsvRow[]) => void
  setPredictionA: (p: PredictionResponse | null) => void
  setPredictionB: (p: PredictionResponse | null) => void
  setBatteryLabelB: (label: string) => void
  beginUploadSession: () => void
  toggleDarkMode: () => void
  setAuthenticated: (v: boolean) => void
  resetCompare: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      batteryLabel: 'Battery A',
      csvRows: [],
      predictionA: null,
      predictionB: null,
      batteryLabelB: 'Battery B',
      uploadSessionId: 0,
      darkMode: false,
      isAuthenticated: false,
      setBatteryLabel: (batteryLabel) => set({ batteryLabel }),
      setCsvRows: (csvRows) => set({ csvRows }),
      setPredictionA: (predictionA) => set({ predictionA }),
      setPredictionB: (predictionB) => set({ predictionB }),
      setBatteryLabelB: (batteryLabelB) => set({ batteryLabelB }),
      beginUploadSession: () =>
        set((s) => ({
          uploadSessionId: s.uploadSessionId + 1,
          predictionA: null,
          predictionB: null,
        })),
      toggleDarkMode: () =>
        set((s) => {
          const next = !s.darkMode
          document.documentElement.classList.toggle('dark', next)
          return { darkMode: next }
        }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      resetCompare: () => set({ predictionB: null, batteryLabelB: 'Battery B' }),
    }),
    {
      name: 'paas4bat-store',
      partialize: (s) => ({
        batteryLabel: s.batteryLabel,
        batteryLabelB: s.batteryLabelB,
        csvRows: s.csvRows,
        predictionA: s.predictionA,
        predictionB: s.predictionB,
        uploadSessionId: s.uploadSessionId,
        darkMode: s.darkMode,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark')
        }
      },
    },
  ),
)
