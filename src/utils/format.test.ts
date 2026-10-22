import { describe, expect, it } from 'vitest'
import { monthKey, monthLabel } from './format'

describe('local calendar month formatting', () => {
  it.each([0, 1, 99, 206, 999, 2026, 9999])('formats year %i without crashing', (year) => {
    const date = new Date(0)
    date.setFullYear(year, 8, 4)
    date.setHours(12, 0, 0, 0)
    const key = monthKey(date.toISOString())
    expect(key).toBe(`${String(year).padStart(4, '0')}-09`)
    expect(monthLabel(key)).toBe(
      new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(date),
    )
  })
})
