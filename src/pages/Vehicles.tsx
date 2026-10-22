import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import type { FuelRecord, Vehicle } from '../models'
import { number } from '../utils/format'
import { chronological } from '../services/calculations'
import { PageHeading } from '../components/Common'

export function Vehicles({
  vehicles,
  records,
  activeId,
  add,
  edit,
  remove,
  select,
}: {
  vehicles: Vehicle[]
  records: FuelRecord[]
  activeId?: string
  add: () => void
  edit: (vehicle: Vehicle) => void
  remove: (vehicle: Vehicle) => void
  select: (id: string) => void
}) {
  return (
    <>
      <PageHeading
        title="รถของฉัน"
        description="จัดการรถและเลือกคันที่ต้องการบันทึก"
      >
        <button className="button primary" onClick={add}>
          <Plus size={18} aria-hidden="true" /> เพิ่มรถ
        </button>
      </PageHeading>
      <div className="vehicle-grid">
        {vehicles.map((vehicle, index) => {
          const fills = records.filter((record) => record.vehicleId === vehicle.id)
          const active = vehicle.id === activeId
          return (
            <section className={`panel vehicle-card ${active ? 'selected' : ''}`} key={vehicle.id}>
              <div className="vehicle-card-top">
                <span className="vehicle-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {active && (
                  <span className="badge full">
                    <Check size={13} aria-hidden="true" /> กำลังใช้งาน
                  </span>
                )}
              </div>
              <h2>{vehicle.name}</h2>
              <p>
                {vehicle.brand} {vehicle.model} · {vehicle.year}
                {vehicle.licensePlate && <span className="plate">{vehicle.licensePlate}</span>}
              </p>
              <dl className="receipt-rows">
                <div className="receipt-row">
                  <dt>เลขไมล์ปัจจุบัน</dt>
                  <dd>
                    {number(chronological(fills).at(-1)?.odometer ?? vehicle.initialOdometer)}
                    <span>km</span>
                  </dd>
                </div>
                <div className="receipt-row">
                  <dt>ประเภทน้ำมัน</dt>
                  <dd>{vehicle.fuelType}</dd>
                </div>
                <div className="receipt-row">
                  <dt>ประวัติการเติม</dt>
                  <dd>
                    {fills.length}
                    <span>ครั้ง</span>
                  </dd>
                </div>
              </dl>
              <div className="vehicle-actions">
                <button
                  className={`button ${active ? 'ghost' : 'secondary'}`}
                  disabled={active}
                  onClick={() => select(vehicle.id)}
                >
                  {active ? 'รถที่เลือกอยู่' : 'ใช้รถคันนี้'}
                </button>
                <button
                  className="icon-button"
                  aria-label={`แก้ไข ${vehicle.name}`}
                  onClick={() => edit(vehicle)}
                >
                  <Pencil size={18} aria-hidden="true" />
                </button>
                <button
                  className="icon-button danger-text"
                  aria-label={`ลบ ${vehicle.name}`}
                  onClick={() => remove(vehicle)}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            </section>
          )
        })}
        <button className="add-vehicle-card" onClick={add}>
          <Plus size={22} aria-hidden="true" />
          <strong>เพิ่มเพื่อนร่วมทาง</strong>
          <small>แยกบันทึกสำหรับรถอีกคัน</small>
        </button>
      </div>
    </>
  )
}
