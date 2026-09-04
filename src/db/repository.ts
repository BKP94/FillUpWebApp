import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { defaultSettings, type AppData, type AppSettings, type FuelRecord, type Vehicle } from '../models'
import { validateRecord, validateVehicle } from '../services/validation'
import { validateData } from '../services/backup'
import { MAX_RECORDS, MAX_VEHICLES } from '../models/limits'

interface FillUpDB extends DBSchema {
  vehicles: { key: string; value: Vehicle }
  records: { key: string; value: FuelRecord; indexes: { 'by-vehicle': string } }
  settings: { key: string; value: AppSettings }
}
const stores = ['vehicles', 'records', 'settings'] as const
const conflict = () =>
  new Error('ข้อมูลถูกเปลี่ยนจากอีกหน้าต่างแล้ว กรุณาปิดแบบฟอร์มและเปิดใหม่เพื่อใช้ข้อมูลล่าสุด')

export class Repository {
  private database?: Promise<IDBPDatabase<FillUpDB>>
  constructor(
    private name = 'fillup',
    private onChange: () => void = () => {},
  ) {}
  private open() {
    if (!this.database)
      this.database = openDB<FillUpDB>(this.name, 1, {
        upgrade(db) {
          db.createObjectStore('vehicles', { keyPath: 'id' })
          db.createObjectStore('records', { keyPath: 'id' }).createIndex('by-vehicle', 'vehicleId')
          db.createObjectStore('settings')
        },
        blocking: () => {
          void this.close()
        },
        terminated: () => {
          this.database = undefined
        },
      }).catch((error) => {
        this.database = undefined
        throw error
      })
    return this.database
  }
  async close() {
    ;(await this.database)?.close()
    this.database = undefined
  }
  async read(): Promise<AppData> {
    const tx = (await this.open()).transaction(stores, 'readonly')
    const [vehicles, records, settings] = await Promise.all([
      tx.objectStore('vehicles').getAll(),
      tx.objectStore('records').getAll(),
      tx.objectStore('settings').get('app'),
    ])
    await tx.done
    return { vehicles, records, settings: settings ?? { ...defaultSettings } }
  }
  async saveVehicle(vehicle: Vehicle, expected?: string) {
    const error = validateVehicle(vehicle)
    if (error) throw new Error(error)
    const tx = (await this.open()).transaction(['vehicles', 'settings'], 'readwrite')
    const current = await tx.objectStore('vehicles').get(vehicle.id)
    if ((expected && current?.updatedAt !== expected) || (!expected && current)) {
      await tx.done
      throw conflict()
    }
    if (!current && (await tx.objectStore('vehicles').count()) >= MAX_VEHICLES) {
      await tx.done
      throw new Error('รองรับรถสูงสุด 1,000 คัน กรุณาสำรองข้อมูลก่อนจัดการรถเก่า')
    }
    await tx.objectStore('vehicles').put(vehicle)
    const settings = (await tx.objectStore('settings').get('app')) ?? { ...defaultSettings }
    if (!settings.activeVehicleId)
      await tx.objectStore('settings').put({ ...settings, activeVehicleId: vehicle.id }, 'app')
    await tx.done
    this.onChange()
  }
  async saveRecord(record: FuelRecord, expected?: string) {
    const error = validateRecord(record)
    if (error) throw new Error(error)
    const tx = (await this.open()).transaction(['vehicles', 'records'], 'readwrite')
    if (!(await tx.objectStore('vehicles').get(record.vehicleId))) {
      await tx.done
      throw new Error('ไม่พบรถคันนี้ กรุณาโหลดข้อมูลใหม่')
    }
    const current = await tx.objectStore('records').get(record.id)
    if ((expected && current?.updatedAt !== expected) || (!expected && current)) {
      await tx.done
      throw conflict()
    }
    if (current && current.vehicleId !== record.vehicleId) {
      await tx.done
      throw new Error('ไม่สามารถย้ายประวัติไปยังรถคันอื่นได้')
    }
    if (!current && (await tx.objectStore('records').count()) >= MAX_RECORDS) {
      await tx.done
      throw new Error('รองรับประวัติสูงสุด 10,000 รายการ กรุณาสำรองข้อมูลก่อนจัดการรายการเก่า')
    }
    await tx.objectStore('records').put(record)
    await tx.done
    this.onChange()
  }
  async deleteRecord(id: string, expected: string) {
    const tx = (await this.open()).transaction('records', 'readwrite')
    if ((await tx.store.get(id))?.updatedAt !== expected) {
      await tx.done
      throw conflict()
    }
    await tx.store.delete(id)
    await tx.done
    this.onChange()
  }
  async deleteVehicle(id: string) {
    const tx = (await this.open()).transaction(stores, 'readwrite')
    const records = await tx.objectStore('records').index('by-vehicle').getAllKeys(id)
    for (const key of records) await tx.objectStore('records').delete(key)
    await tx.objectStore('vehicles').delete(id)
    const settings = (await tx.objectStore('settings').get('app')) ?? { ...defaultSettings }
    if (settings.activeVehicleId === id) {
      const vehicles = await tx.objectStore('vehicles').getAllKeys()
      await tx.objectStore('settings').put({ ...settings, activeVehicleId: vehicles[0] ?? null }, 'app')
    }
    await tx.done
    this.onChange()
  }
  async updateSettings(patch: Partial<Omit<AppSettings, 'schemaVersion'>>) {
    const tx = (await this.open()).transaction(['settings', 'vehicles'], 'readwrite')
    const current = (await tx.objectStore('settings').get('app')) ?? { ...defaultSettings }
    if (patch.activeVehicleId && !(await tx.objectStore('vehicles').get(patch.activeVehicleId))) {
      await tx.done
      throw new Error('ไม่พบรถที่ต้องการเลือก')
    }
    await tx.objectStore('settings').put({ ...current, ...patch }, 'app')
    await tx.done
    this.onChange()
  }
  async replaceAll(data: AppData) {
    const safe = validateData(data)
    const tx = (await this.open()).transaction(stores, 'readwrite')
    await Promise.all(stores.map((store) => tx.objectStore(store).clear()))
    for (const vehicle of safe.vehicles) await tx.objectStore('vehicles').put(vehicle)
    for (const record of safe.records) await tx.objectStore('records').put(record)
    await tx.objectStore('settings').put(safe.settings, 'app')
    await tx.done
    this.onChange()
  }
}

const channel =
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('fillup-changes')
    : undefined
export const repository = new Repository('fillup', () => {
  channel?.postMessage('changed')
  window.dispatchEvent(new Event('fillup-changed'))
})
if (channel) channel.onmessage = () => window.dispatchEvent(new Event('fillup-changed'))
