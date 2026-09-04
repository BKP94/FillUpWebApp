import { defaultSettings, type AppData, type AppSettings, type FuelRecord, type Vehicle } from '../models'
import { validateRecord, validateVehicle, validDate } from './validation'
import { MAX_BACKUP_BYTES, MAX_RECORDS, MAX_VEHICLES } from '../models/limits'

const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('รูปแบบไฟล์สำรองไม่ถูกต้อง')
  return value as Record<string, unknown>
}

export function validateData(value: unknown): AppData {
  const data = object(value)
  if (
    !Array.isArray(data.vehicles) ||
    !Array.isArray(data.records) ||
    data.vehicles.length > MAX_VEHICLES ||
    data.records.length > MAX_RECORDS
  )
    throw new Error(
      'รายการรถหรือประวัติไม่ถูกต้อง หรือมีขนาดเกินที่รองรับ (รถ 1,000 คัน / ประวัติ 10,000 รายการ)',
    )
  const vehicles: Vehicle[] = data.vehicles.map((value) => {
    const v = object(value)
    const vehicle = {
      id: v.id,
      name: v.name,
      brand: v.brand,
      model: v.model,
      year: v.year,
      licensePlate: v.licensePlate,
      fuelType: v.fuelType,
      initialOdometer: v.initialOdometer,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    } as Vehicle
    const error = validateVehicle(vehicle)
    if (error) throw new Error(error)
    return vehicle
  })
  const ids = new Set(vehicles.map((vehicle) => vehicle.id))
  if (ids.size !== vehicles.length) throw new Error('พบรหัสรถซ้ำในไฟล์สำรอง')
  const records: FuelRecord[] = data.records.map((value) => {
    const r = object(value)
    const record = {
      id: r.id,
      vehicleId: r.vehicleId,
      date: r.date,
      odometer: r.odometer,
      liters: r.liters,
      pricePerLiter: r.pricePerLiter,
      totalCost: r.totalCost,
      isFullTank: r.isFullTank,
      fuelType: r.fuelType,
      station: r.station,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    } as FuelRecord
    const error = validateRecord(record)
    if (error) throw new Error(error)
    if (!ids.has(record.vehicleId)) throw new Error('พบประวัติที่ไม่เชื่อมโยงกับรถในไฟล์สำรอง')
    return record
  })
  if (new Set(records.map((record) => record.id)).size !== records.length)
    throw new Error('พบรหัสรายการเติมน้ำมันซ้ำ')
  const s = object(data.settings)
  if (
    s.schemaVersion !== 1 ||
    !['system', 'light', 'dark'].includes(s.theme as string) ||
    typeof s.dismissedInstallHint !== 'boolean' ||
    (s.activeVehicleId !== null && !ids.has(s.activeVehicleId as string))
  )
    throw new Error('การตั้งค่าในไฟล์สำรองไม่ถูกต้องหรือเป็นเวอร์ชันที่ยังไม่รองรับ')
  const settings: AppSettings = {
    activeVehicleId: s.activeVehicleId as string | null,
    theme: s.theme as AppSettings['theme'],
    dismissedInstallHint: s.dismissedInstallHint,
    schemaVersion: 1,
  }
  return { vehicles, records, settings }
}

export function parseBackup(raw: string): AppData {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES)
    throw new Error('ไฟล์สำรองต้องมีขนาดไม่เกิน 100 MB')
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    throw new Error('ไฟล์ JSON ไม่สมบูรณ์หรือเสียหาย')
  }
  const backup = object(value)
  if (backup.app !== 'FillUp' || backup.version !== 1 || !validDate(backup.exportedAt))
    throw new Error('ไฟล์นี้ไม่ใช่ข้อมูลสำรอง FillUp เวอร์ชันที่รองรับ')
  return validateData(backup.data)
}

export function createBackup(data: AppData): string {
  return JSON.stringify(
    { app: 'FillUp', version: 1, exportedAt: new Date().toISOString(), data: validateData(data) },
    null,
    2,
  )
}

const csvCell = (value: string | number) => {
  // Prevent spreadsheet formula injection in user-entered text (including whitespace prefixes).
  const raw = String(value)
  const safe = typeof value === 'string' && /^[\s]*[=+\-@\t\r\n]/.test(raw) ? `'${raw}` : raw
  return `"${safe.replaceAll('"', '""')}"`
}
export function createCsv(data: AppData): string {
  const names = new Map(data.vehicles.map((vehicle) => [vehicle.id, vehicle.name]))
  const rows: (string | number)[][] = [
    [
      'ชื่อรถ',
      'วันที่ (ISO 8601 / UTC)',
      'เลขไมล์ (km)',
      'น้ำมัน (L)',
      'ราคาต่อลิตร (บาท)',
      'ยอดรวม (บาท)',
      'เต็มถัง',
      'ประเภทน้ำมัน',
      'สถานีบริการ',
      'หมายเหตุ',
    ],
  ]
  for (const r of [...data.records].sort((a, b) => a.date.localeCompare(b.date)))
    rows.push([
      names.get(r.vehicleId) ?? '',
      r.date,
      r.odometer,
      r.liters,
      r.pricePerLiter,
      r.totalCost,
      r.isFullTank ? 'ใช่' : 'ไม่ใช่',
      r.fuelType,
      r.station,
      r.notes,
    ])
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
}

export function downloadFile(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
export const emptyData = (): AppData => ({ vehicles: [], records: [], settings: { ...defaultSettings } })
