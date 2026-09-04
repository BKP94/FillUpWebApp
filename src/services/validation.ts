import { fuelTypes, type FuelRecord, type Vehicle } from '../models'

const finiteRange = (value: unknown, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
export const validDate = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 19) === value.slice(0, 19)
export const validId = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
const text = (value: unknown, max: number, required = false) =>
  typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0)

export function validateVehicle(vehicle: Vehicle): string | null {
  if (!validId(vehicle.id) || !validDate(vehicle.createdAt) || !validDate(vehicle.updatedAt))
    return 'ข้อมูลระบุรถไม่ถูกต้อง'
  if (!text(vehicle.name, 80, true) || !text(vehicle.brand, 60, true) || !text(vehicle.model, 80, true))
    return 'กรุณากรอกชื่อรถ ยี่ห้อ และรุ่นให้ครบ'
  if (!Number.isInteger(vehicle.year) || !finiteRange(vehicle.year, 1900, new Date().getFullYear() + 2))
    return 'กรุณาระบุปีรถเป็น ค.ศ. ให้ถูกต้อง'
  if (!finiteRange(vehicle.initialOdometer, 0, 10_000_000))
    return 'เลขไมล์ต้องอยู่ระหว่าง 0 ถึง 10,000,000 km'
  if (!fuelTypes.includes(vehicle.fuelType) || !text(vehicle.licensePlate, 30))
    return 'ข้อมูลประเภทรถหรือทะเบียนไม่ถูกต้อง'
  return null
}
export function validateRecord(record: FuelRecord): string | null {
  if (
    !validId(record.id) ||
    !validId(record.vehicleId) ||
    !validDate(record.date) ||
    !validDate(record.createdAt) ||
    !validDate(record.updatedAt)
  )
    return 'วันที่หรือข้อมูลระบุรายการไม่ถูกต้อง'
  if (!finiteRange(record.odometer, 0, 10_000_000)) return 'เลขไมล์ต้องอยู่ระหว่าง 0 ถึง 10,000,000 km'
  if (!finiteRange(record.liters, 0.001, 100_000)) return 'ปริมาณน้ำมันต้องมากกว่า 0 และไม่เกิน 100,000 ลิตร'
  if (
    !finiteRange(record.pricePerLiter, 0.001, 100_000) ||
    !finiteRange(record.totalCost, 0.01, 1_000_000_000)
  )
    return 'ราคาน้ำมันและยอดรวมต้องมากกว่า 0 และอยู่ในช่วงที่รองรับ'
  if (
    Math.abs(record.liters * record.pricePerLiter - record.totalCost) >
    Math.max(0.06, record.liters * 0.000051)
  )
    return 'ยอดรวมไม่สอดคล้องกับปริมาณและราคาต่อลิตร'
  if (
    typeof record.isFullTank !== 'boolean' ||
    !fuelTypes.includes(record.fuelType) ||
    !text(record.station, 120) ||
    !text(record.notes, 2000)
  )
    return 'ข้อมูลการเติมน้ำมันไม่ถูกต้อง'
  return null
}
export function recordWarnings(record: FuelRecord, records: FuelRecord[], vehicle: Vehicle): string[] {
  const others = records.filter((item) => item.vehicleId === record.vehicleId && item.id !== record.id)
  const before = others
    .filter((item) => item.date <= record.date)
    .sort((a, b) => b.date.localeCompare(a.date) || b.odometer - a.odometer)[0]
  const after = others
    .filter((item) => item.date > record.date)
    .sort((a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer)[0]
  const warnings: string[] = []
  if (
    record.odometer < (before?.odometer ?? vehicle.initialOdometer) ||
    (after && record.odometer > after.odometer)
  )
    warnings.push(
      'เลขไมล์ไม่เรียงตามเวลา อาจเกิดจากการเปลี่ยนเรือนไมล์ ช่วงที่เลขไมล์ลดลงจะไม่ถูกนำมาคำนวณ km/L',
    )
  if (record.liters > 150 || record.pricePerLiter > 100 || record.pricePerLiter < 10)
    warnings.push('ปริมาณน้ำมันหรือราคาต่อลิตรสูงหรือต่ำกว่าปกติ กรุณาตรวจสอบอีกครั้ง')
  if (before && record.odometer - before.odometer > 3000)
    warnings.push('ระยะทางจากรายการก่อนหน้ามากกว่า 3,000 km กรุณาตรวจสอบเลขไมล์')
  if (Date.parse(record.date) > Date.now() + 5 * 60_000) warnings.push('วันที่เติมน้ำมันอยู่ในอนาคต')
  return warnings
}
