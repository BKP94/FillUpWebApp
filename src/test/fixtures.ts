import { defaultSettings, type AppData, type FuelRecord, type Vehicle } from '../models'

export const vehicle: Vehicle = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'รถของฉัน',
  brand: 'Honda',
  model: 'ADV 350',
  year: 2025,
  licensePlate: '',
  fuelType: 'E20',
  initialOdometer: 10000,
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
}
export const sampleData = (): AppData => ({
  vehicles: [{ ...vehicle }],
  records: [],
  settings: { ...defaultSettings, activeVehicleId: vehicle.id },
})
export const record = (
  odometer: number,
  liters: number,
  full: boolean,
  day: number,
  extra: Partial<FuelRecord> = {},
): FuelRecord => ({
  id: `00000000-0000-4000-8000-${String(day).padStart(12, '0')}`,
  vehicleId: vehicle.id,
  date: `2026-09-${String(day).padStart(2, '0')}T12:00:00.000Z`,
  odometer,
  liters,
  isFullTank: full,
  pricePerLiter: 35,
  totalCost: liters * 35,
  fuelType: 'E20',
  station: '',
  notes: '',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
  ...extra,
})
