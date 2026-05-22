import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { PredictionResponse } from '@/types/prediction'

export function exportPredictionCsv(prediction: PredictionResponse, batteryLabel: string): void {
  const headers = ['cycle', 'capacity_percent', 'lower_bound_percent', 'upper_bound_percent']
  const lines = [
    headers.join(','),
    ...prediction.capacity_curve.map((p) =>
      [p.cycle, p.capacity, p.lower, p.upper].join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `paas4bat_${batteryLabel}_${prediction.prediction_id}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportDashboardPdf(elementId: string, filename: string): Promise<void> {
  const el = document.getElementById(elementId)
  if (!el) throw new Error('Export section not found')

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const imgWidth = pageWidth - margin * 2
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = margin

  pdf.addImage(img, 'PNG', margin, position, imgWidth, imgHeight)
  heightLeft -= pageHeight - margin * 2

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + margin
    pdf.addPage()
    pdf.addImage(img, 'PNG', margin, position, imgWidth, imgHeight)
    heightLeft -= pageHeight - margin * 2
  }

  pdf.save(filename)
}
