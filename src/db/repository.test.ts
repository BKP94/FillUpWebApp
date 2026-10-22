import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Repository } from './repository'
import { sampleData, vehicle, record } from '../test/fixtures'
import { createBackup, createCsv, parseBackup } from '../services/backup'

describe('IndexedDB repository', () => {
  let repo: Repository
  beforeEach(() => {
    repo = new Repository(`test-${crypto.randomUUID()}`)
  })
  afterEach(async () => {
    await repo.close()
  })
  it('persists vehicle and records across reopen; edits and deletes', async () => {
    await repo.saveVehicle(vehicle)
    const fill = record(10000, 5, true, 1)
    await repo.saveRecord(fill)
    await repo.close()
    expect((await repo.read()).records).toEqual([fill])
    await repo.saveRecord({ ...fill, notes: 'แก้ไข', updatedAt: '2026-09-02T12:00:00.000Z' }, fill.updatedAt)
    expect((await repo.read()).records[0]?.notes).toBe('แก้ไข')
    await expect(repo.saveRecord(fill, fill.updatedAt)).rejects.toThrow('อีกหน้าต่าง')
    await repo.deleteRecord(fill.id, '2026-09-02T12:00:00.000Z')
    expect((await repo.read()).records).toEqual([])
  })
  it('cascades vehicle deletion and selects remaining vehicle', async () => {
    await repo.saveVehicle(vehicle)
    await repo.saveVehicle({ ...vehicle, id: '22222222-2222-4222-8222-222222222222' })
    await repo.saveRecord(record(10000, 5, true, 1))
    await repo.deleteVehicle(vehicle.id, {
      updatedAt: vehicle.updatedAt,
      records: (await repo.read()).records,
    })
    const data = await repo.read()
    expect(data.records).toEqual([])
    expect(data.settings.activeVehicleId).toBe(data.vehicles[0]?.id)
  })
  it.each(['add', 'edit', 'replace', 'vehicle edit'] as const)(
    'rejects stale vehicle deletion after another connection performs %s',
    async (change) => {
      const name = `concurrent-${crypto.randomUUID()}`
      const first = new Repository(name)
      const second = new Repository(name)
      try {
        await first.saveVehicle(vehicle)
        const fill = record(10000, 5, true, 1)
        await first.saveRecord(fill)
        const snapshot = { updatedAt: vehicle.updatedAt, records: [fill] }
        if (change === 'vehicle edit') {
          await second.saveVehicle(
            { ...vehicle, name: 'ชื่อรถใหม่', updatedAt: '2026-09-02T12:00:00.000Z' },
            vehicle.updatedAt,
          )
        } else if (change === 'edit') {
          await second.saveRecord(
            { ...fill, notes: 'แก้จากอีกแท็บ', updatedAt: '2026-09-02T12:00:00.000Z' },
            fill.updatedAt,
          )
        } else {
          if (change === 'replace') await second.deleteRecord(fill.id, fill.updatedAt)
          await second.saveRecord(record(10300, 10, true, 2))
        }
        const current = await second.read()
        await expect(first.deleteVehicle(vehicle.id, snapshot)).rejects.toThrow('เปลี่ยนแปลง')
        expect(await first.read()).toEqual(current)
        await first.deleteVehicle(vehicle.id, {
          updatedAt: current.vehicles[0]!.updatedAt,
          records: current.records,
        })
        expect((await first.read()).vehicles).toEqual([])
        expect((await first.read()).records).toEqual([])
      } finally {
        await first.close()
        await second.close()
      }
    },
  )
  it('does not allow an edited refill to change its vehicle', async () => {
    await repo.saveVehicle(vehicle)
    const other = { ...vehicle, id: '22222222-2222-4222-8222-222222222222' }
    await repo.saveVehicle(other)
    const fill = record(10000, 5, true, 1)
    await repo.saveRecord(fill)
    await expect(repo.saveRecord({ ...fill, vehicleId: other.id }, fill.updatedAt)).rejects.toThrow(
      'ย้ายประวัติ',
    )
    expect((await repo.read()).records[0]?.vehicleId).toBe(vehicle.id)
  })
  it('rejects invalid restoration without changing stored data', async () => {
    await repo.replaceAll(sampleData())
    const broken = sampleData()
    broken.records = [record(10000, 5, true, 1, { vehicleId: '22222222-2222-4222-8222-222222222222' })]
    await expect(repo.replaceAll(broken)).rejects.toThrow()
    expect(await repo.read()).toEqual(sampleData())
  })
  it('roundtrips full backup and escapes spreadsheet formulas', async () => {
    const data = sampleData()
    data.records = [record(10000, 5, true, 1, { notes: '=HYPERLINK("bad")', station: 'ปั๊ม, ไทย' })]
    await repo.replaceAll(parseBackup(createBackup(data)))
    expect(await repo.read()).toEqual(data)
    expect(createCsv(data)).toContain('"\'=HYPERLINK(""bad"")"')
    expect(createCsv(data)).toContain('"ปั๊ม, ไทย"')
  })
})
