import Papa from 'papaparse';
import type { CsvRow } from '@/types/prediction'

const REQUIRED = ['cycle', 'capacity_ah']
const MAX_ROWS = 50_000
const MAX_BYTES = 5 * 1024 * 1024

function parseNumber(value: unknown, field: string, rowNumber: number): number {
  const raw = String(value ?? '').trim()

  if (!raw) {
    throw new Error(`Row ${rowNumber}: ${field} is required`)
  }

  const parsed = Number(raw)

  if (!Number.isFinite(parsed)) {
    throw new Error(`Row ${rowNumber}: ${field} must be a valid number`)
  }

  return parsed
}

export function validateAndParseCsv(text: string): CsvRow[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
    transform: (value) => value.trim(),
  })

  if (result.errors.length > 0) {
    const firstError = result.errors[0]
    throw new Error(
      `CSV parse error at row ${firstError.row ?? 'unknown'}: ${firstError.message}`,
    )
  }

  const rowsFromCsv = result.data

  if (!rowsFromCsv.length) {
    throw new Error('CSV must include a header row and at least one data row')
  }

  const headers = result.meta.fields ?? []
  const missing = REQUIRED.filter((column) => !headers.includes(column))

  if (missing.length) {
    throw new Error(`Missing required columns: ${missing.join(', ')}`)
  }

  if (rowsFromCsv.length > MAX_ROWS) {
    throw new Error(`CSV exceeds maximum of ${MAX_ROWS} rows`)
  }

  const rows: CsvRow[] = []
  let prevCycle: number | null = null

  rowsFromCsv.forEach((record, index) => {
    const rowNumber = index + 2

    const cycle = parseNumber(record.cycle, 'cycle', rowNumber)
    const capacity_ah = parseNumber(record.capacity_ah, 'capacity_ah', rowNumber)

    if (cycle <= 0) {
      throw new Error(`Row ${rowNumber}: cycle must be greater than 0`)
    }

    if (capacity_ah <= 0) {
      throw new Error(`Row ${rowNumber}: capacity_ah must be greater than 0`)
    }

    if (prevCycle !== null && cycle < prevCycle) {
      throw new Error(`Row ${rowNumber}: cycle values must be monotonically increasing`)
    }

    prevCycle = cycle

    const row: CsvRow = {
      cycle,
      capacity_ah,
    }

    if (record.voltage_avg) {
      row.voltage_avg = parseNumber(record.voltage_avg, 'voltage_avg', rowNumber)
    }

    if (record.temperature_c) {
      row.temperature_c = parseNumber(record.temperature_c, 'temperature_c', rowNumber)
    }

    if (record.coulomb_efficiency) {
      row.coulomb_efficiency = parseNumber(
        record.coulomb_efficiency,
        'coulomb_efficiency',
        rowNumber,
      )
    }

    rows.push(row)
  })

  return rows
}

export async function parseCsvFile(file: File): Promise<CsvRow[]> {
  if (file.size > MAX_BYTES) throw new Error('File exceeds 5 MB limit')
  const text = await file.text()
  return validateAndParseCsv(text)
}
