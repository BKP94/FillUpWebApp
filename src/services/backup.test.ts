import { describe, expect, it } from 'vitest'
import { createBackup, createCsv, emptyData, parseBackup } from './backup'
import { sampleData, vehicle, record } from '../test/fixtures'
import { MAX_BACKUP_BYTES, MAX_RECORDS } from '../models/limits'
describe('backup validation', () => {
  it('roundtrips Thai text and empty data', () => {
    expect(parseBackup(createBackup(sampleData()))).toEqual(sampleData())
    expect(parseBackup(createBackup(emptyData()))).toEqual(emptyData())
  })
  it('rejects malformed, unsupported, invalid and duplicate data', () => {
    expect(() => parseBackup('{broken')).toThrow()
    expect(() => parseBackup(createBackup(sampleData()).replace('"version": 1', '"version": 2'))).toThrow()
    const duplicate = sampleData()
    duplicate.vehicles.push(vehicle)
    expect(() => createBackup(duplicate)).toThrow('ซ้ำ')
    const invalid = sampleData()
    invalid.vehicles[0]!.initialOdometer = NaN
    expect(() => createBackup(invalid)).toThrow()
  })
  it('exports BOM for Excel', () => expect(createCsv(sampleData()).startsWith('\uFEFF"ชื่อรถ"')).toBe(true))
  it('roundtrips maximum record count with maximum Thai notes, beyond the old 25 MB limit', () => {
    const data = sampleData()
    data.records = Array.from({ length: MAX_RECORDS }, (_, index) =>
      record(10000 + index, 5, true, 1, {
        id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
        notes: 'ก'.repeat(2000),
        station: 'ข'.repeat(120),
      }),
    )
    const backup = createBackup(data)
    const bytes = new TextEncoder().encode(backup).length
    expect(bytes).toBeGreaterThan(25 * 1024 * 1024)
    expect(bytes).toBeLessThan(MAX_BACKUP_BYTES)
    const restored = parseBackup(backup)
    expect(restored.records).toHaveLength(MAX_RECORDS)
    expect(restored.records.at(-1)?.notes).toBe('ก'.repeat(2000))
  })
})
