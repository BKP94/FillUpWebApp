import { describe, expect, it } from 'vitest'
import { economyIntervals, statistics } from './calculations'
import { record } from '../test/fixtures'
describe('full-tank economy', () => {
  it('excludes the opening fill and calculates a normal interval', () => {
    expect(economyIntervals([record(10000, 8, true, 1), record(10300, 10, true, 2)])[0]?.kmPerLiter).toBe(30)
  })
  it('includes multiple partial fills and the closing fill', () => {
    const result = economyIntervals([
      record(10000, 9, true, 1),
      record(10100, 2, false, 2),
      record(10150, 3, false, 3),
      record(10300, 5, true, 4),
    ])
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ distance: 300, liters: 10, kmPerLiter: 30 })
  })
  it('does not infer consumption without a previous full tank', () => {
    expect(economyIntervals([record(10000, 3, false, 1), record(10300, 7, true, 2)])).toEqual([])
    expect(statistics([]).average).toBeNull()
  })
  it.each([-1, NaN, Infinity, 9900])('breaks the interval at invalid/reset odometer %s', (odometer) => {
    expect(
      economyIntervals([record(10000, 7, true, 1), record(odometer, 3, false, 2), record(10300, 7, true, 3)]),
    ).toEqual([])
  })
  it('rejects zero liters and starts fresh after an invalid interval', () => {
    const data = [
      record(10000, 7, true, 1),
      record(10100, 0, false, 2),
      record(10300, 7, true, 3),
      record(10600, 10, true, 4),
    ]
    expect(economyIntervals(data).map((item) => item.kmPerLiter)).toEqual([30])
  })
  it('recalculates after editing an old partial fill without mutating input', () => {
    const data = [record(10300, 7, true, 3), record(10000, 8, true, 1), record(10150, 3, false, 2)]
    expect(economyIntervals(data)[0]?.kmPerLiter).toBe(30)
    const edited = data.map((item) => (item.isFullTank ? item : { ...item, liters: 5 }))
    expect(economyIntervals(edited)[0]?.kmPerLiter).toBe(25)
    expect(data[0]?.odometer).toBe(10300)
  })
  it('uses total distance / total fuel instead of averaging ratios', () => {
    const data = [record(10000, 8, true, 1), record(10300, 10, true, 2), record(10700, 20, true, 3)]
    expect(statistics(data).average).toBeCloseTo(700 / 30)
  })
  it('keeps vehicles isolated and assigns distance to the interval end month', () => {
    const data = [
      record(10000, 8, true, 1, { date: '2026-08-31T12:00:00.000Z' }),
      record(10300, 10, true, 2),
      record(5000, 6, true, 3, { vehicleId: 'other' }),
    ]
    expect(economyIntervals(data)).toHaveLength(1)
    expect(statistics(data, '2026-09').monthlyDistance).toBe(300)
  })
  it('does not calculate a zero-distance interval', () =>
    expect(economyIntervals([record(100, 3, true, 1), record(100, 4, true, 2)])).toEqual([]))
})
