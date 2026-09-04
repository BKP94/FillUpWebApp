export const fuelTypes = [
  'แก๊สโซฮอล์ 91',
  'แก๊สโซฮอล์ 95',
  'E20',
  'E85',
  'เบนซิน 95',
  'ดีเซล',
  'พรีเมียมดีเซล',
  'อื่น ๆ',
] as const
export type FuelType = (typeof fuelTypes)[number]
export interface Vehicle {
  id: string
  name: string
  brand: string
  model: string
  year: number
  licensePlate: string
  fuelType: FuelType
  initialOdometer: number
  createdAt: string
  updatedAt: string
}
export interface FuelRecord {
  id: string
  vehicleId: string
  date: string
  odometer: number
  liters: number
  pricePerLiter: number
  totalCost: number
  isFullTank: boolean
  fuelType: FuelType
  station: string
  notes: string
  createdAt: string
  updatedAt: string
}
export interface AppSettings {
  activeVehicleId: string | null
  theme: 'system' | 'light' | 'dark'
  dismissedInstallHint: boolean
  schemaVersion: 1
}
export interface AppData {
  vehicles: Vehicle[]
  records: FuelRecord[]
  settings: AppSettings
}
export const defaultSettings: AppSettings = {
  activeVehicleId: null,
  theme: 'system',
  dismissedInstallHint: false,
  schemaVersion: 1,
}
