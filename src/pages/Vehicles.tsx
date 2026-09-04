import { CarFront, Check, Pencil, Plus, Trash2 } from 'lucide-react'
import type { FuelRecord, Vehicle } from '../models'
import { number } from '../utils/format'
import { chronological } from '../services/calculations'

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
      <div className="page-heading">
        <div>
          <div className="eyebrow">เพื่อนร่วมทางของคุณ</div>
          <h1>
            รถของฉัน<span className="heading-dot">.</span>
          </h1>
          <p>จัดการรถและเลือกคันที่ต้องการบันทึก</p>
        </div>
        <button className="button primary" onClick={add}>
          <Plus size={18} /> เพิ่มรถ
        </button>
      </div>
      <div className="vehicle-grid">
        {vehicles.map((vehicle) => {
          const fills = records.filter((record) => record.vehicleId === vehicle.id)
          const active = vehicle.id === activeId
          return (
            <section className={`card vehicle-card ${active ? 'selected' : ''}`} key={vehicle.id}>
              <div className="vehicle-card-top">
                <span className="vehicle-card-icon">
                  <CarFront size={30} strokeWidth={1.5} />
                </span>
                {active && (
                  <span className="badge green">
                    <Check size={13} /> กำลังใช้งาน
                  </span>
                )}
              </div>
              <h2>{vehicle.name}</h2>
              <p>
                {vehicle.brand} {vehicle.model} · {vehicle.year}
              </p>
              {vehicle.licensePlate && <span className="plate">{vehicle.licensePlate}</span>}
              <div className="vehicle-details">
                <div>
                  <span>เลขไมล์ปัจจุบัน</span>
                  <strong>
                    {number(chronological(fills).at(-1)?.odometer ?? vehicle.initialOdometer)} km
                  </strong>
                </div>
                <div>
                  <span>ประเภทน้ำมัน</span>
                  <strong>{vehicle.fuelType}</strong>
                </div>
                <div>
                  <span>ประวัติการเติม</span>
                  <strong>{fills.length} ครั้ง</strong>
                </div>
              </div>
              <div className="vehicle-actions">
                <button
                  className={`button ${active ? 'soft' : 'secondary'}`}
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
                  <Pencil size={18} />
                </button>
                <button
                  className="icon-button danger-text"
                  aria-label={`ลบ ${vehicle.name}`}
                  onClick={() => remove(vehicle)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </section>
          )
        })}
        <button className="add-vehicle-card" onClick={add}>
          <span>
            <Plus size={26} />
          </span>
          <strong>เพิ่มเพื่อนร่วมทาง</strong>
          <small>แยกบันทึกสำหรับรถอีกคัน</small>
        </button>
      </div>
    </>
  )
}
