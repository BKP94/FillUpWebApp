import type { FuelRecord } from '../models'
import { monthKey } from '../utils/format'

export interface EconomyInterval {
  recordId: string
  date: string
  distance: number
  liters: number
  kmPerLiter: number
}
export const chronological = (records: FuelRecord[]) =>
  [...records].sort(
    (a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer || a.id.localeCompare(b.id),
  )

/** Invalid data breaks an interval. The next valid full fill is a fresh baseline. */
export function economyIntervals(records: FuelRecord[]): EconomyInterval[] {
  const results: EconomyInterval[] = []
  const vehicleIds = new Set(records.map((record) => record.vehicleId))
  for (const vehicleId of vehicleIds) {
    let anchor: FuelRecord | undefined
    let previousOdometer: number | undefined
    let liters = 0
    for (const record of chronological(records.filter((item) => item.vehicleId === vehicleId))) {
      const valid =
        Number.isFinite(record.odometer) &&
        record.odometer >= 0 &&
        Number.isFinite(record.liters) &&
        record.liters > 0 &&
        Number.isFinite(Date.parse(record.date))
      if (!valid) {
        anchor = undefined
        previousOdometer = undefined
        liters = 0
        continue
      }
      if (previousOdometer !== undefined && record.odometer < previousOdometer) {
        anchor = undefined
        liters = 0
      }
      if (anchor) liters += record.liters
      if (record.isFullTank) {
        if (anchor && record.odometer > anchor.odometer && liters > 0 && Number.isFinite(liters)) {
          const distance = record.odometer - anchor.odometer
          results.push({
            recordId: record.id,
            date: record.date,
            distance,
            liters,
            kmPerLiter: distance / liters,
          })
        }
        anchor = record
        liters = 0
      }
      previousOdometer = record.odometer
    }
  }
  return results.sort((a, b) => a.date.localeCompare(b.date))
}

export function statistics(records: FuelRecord[], month = monthKey(new Date().toISOString())) {
  const ordered = chronological(records)
  const intervals = economyIntervals(ordered)
  const consumed = intervals.reduce((sum, item) => sum + item.liters, 0)
  const measuredDistance = intervals.reduce((sum, item) => sum + item.distance, 0)
  const totalCost = ordered.reduce((sum, record) => sum + record.totalCost, 0)
  const totalLiters = ordered.reduce((sum, record) => sum + record.liters, 0)
  let distance = 0
  let monthlyDistance = 0
  const previous = new Map<string, FuelRecord>()
  for (const record of ordered) {
    const prev = previous.get(record.vehicleId)
    const delta = prev ? Math.max(0, record.odometer - prev.odometer) : 0
    distance += delta
    if (monthKey(record.date) === month) monthlyDistance += delta
    previous.set(record.vehicleId, record)
  }
  const monthlyRecords = ordered.filter((record) => monthKey(record.date) === month)
  const monthlySpending = new Map<string, number>()
  for (const record of ordered) {
    const key = monthKey(record.date)
    monthlySpending.set(key, (monthlySpending.get(key) ?? 0) + record.totalCost)
  }
  return {
    intervals,
    average: consumed ? measuredDistance / consumed : null,
    latest: intervals.at(-1)?.kmPerLiter ?? null,
    best: intervals.length ? Math.max(...intervals.map((item) => item.kmPerLiter)) : null,
    worst: intervals.length ? Math.min(...intervals.map((item) => item.kmPerLiter)) : null,
    totalCost,
    totalLiters,
    distance,
    averagePrice: totalLiters ? totalCost / totalLiters : null,
    costPerKm: distance ? totalCost / distance : null,
    monthlyCost: monthlyRecords.reduce((sum, record) => sum + record.totalCost, 0),
    monthlyLiters: monthlyRecords.reduce((sum, record) => sum + record.liters, 0),
    monthlyDistance,
    monthlyCount: monthlyRecords.length,
    monthlySpending: [...monthlySpending].map(([month, amount]) => ({ month, amount })),
  }
}
