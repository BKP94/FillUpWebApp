import { useState, type FormEvent } from 'react'
import { CarFront, ArrowRight } from 'lucide-react'
import { fuelTypes, type Vehicle } from '../models'
import { validateVehicle } from '../services/validation'
import { errorMessage } from '../hooks/useAppData'

export function VehicleForm({
  vehicle,
  onSave,
  onboarding = false,
}: {
  vehicle?: Vehicle
  onSave: (vehicle: Vehicle) => Promise<void>
  onboarding?: boolean
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const fields = new FormData(event.currentTarget)
    const now = new Date().toISOString()
    const next: Vehicle = {
      id: vehicle?.id ?? crypto.randomUUID(),
      createdAt: vehicle?.createdAt ?? now,
      updatedAt: now,
      name: String(fields.get('name')).trim(),
      brand: String(fields.get('brand')).trim(),
      model: String(fields.get('model')).trim(),
      year: Number(fields.get('year')),
      licensePlate: String(fields.get('licensePlate') ?? '').trim(),
      fuelType: fields.get('fuelType') as Vehicle['fuelType'],
      initialOdometer: Number(fields.get('initialOdometer')),
    }
    const invalid = validateVehicle(next)
    if (invalid) {
      setError(invalid)
      return
    }
    setBusy(true)
    setError('')
    try {
      await onSave(next)
    } catch (error) {
      setError(errorMessage(error))
      setBusy(false)
    }
  }
  return (
    <form
      onSubmit={(event) => {
        void submit(event)
      }}
    >
      <div className={onboarding ? 'form-content' : 'modal-body form-content'}>
        {!onboarding && (
          <div className="form-intro">
            <span className="small-icon">
              <CarFront size={21} />
            </span>
            <p>
              รายละเอียดรถของคุณ<span>แยกประวัติและค่าใช้จ่ายสำหรับรถแต่ละคัน</span>
            </p>
          </div>
        )}
        <label>
          ชื่อรถ
          <input
            name="name"
            defaultValue={vehicle?.name}
            required
            maxLength={80}
            placeholder="เช่น รถคู่ใจ"
            autoComplete="off"
          />
        </label>
        <div className="form-grid">
          <label>
            ยี่ห้อ
            <input
              name="brand"
              defaultValue={vehicle?.brand}
              required
              maxLength={60}
              placeholder="เช่น Honda"
            />
          </label>
          <label>
            รุ่น
            <input
              name="model"
              defaultValue={vehicle?.model}
              required
              maxLength={80}
              placeholder="เช่น ADV 350"
            />
          </label>
        </div>
        <div className="form-grid">
          <label>
            ปีรถ (ค.ศ.)
            <input
              name="year"
              type="number"
              inputMode="numeric"
              defaultValue={vehicle?.year ?? new Date().getFullYear()}
              min="1900"
              max={new Date().getFullYear() + 2}
              step="1"
              required
            />
          </label>
          <label>
            ประเภทน้ำมัน
            <select name="fuelType" defaultValue={vehicle?.fuelType ?? 'แก๊สโซฮอล์ 95'}>
              {fuelTypes.map((fuel) => (
                <option key={fuel}>{fuel}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          {vehicle ? 'เลขไมล์เริ่มต้น' : 'เลขไมล์ปัจจุบัน'} (km)
          <input
            name="initialOdometer"
            type="number"
            inputMode="decimal"
            min="0"
            max="10000000"
            step="0.1"
            defaultValue={vehicle?.initialOdometer ?? ''}
            placeholder="0"
            required
          />
          <span className="field-hint">
            {vehicle ? 'เลขไมล์ ณ วันที่เริ่มใช้ FillUp' : 'เลขไมล์บนหน้าปัดรถตอนนี้'}
          </span>
        </label>
        <label>
          ทะเบียนรถ <span className="optional">ไม่บังคับ</span>
          <input
            name="licensePlate"
            defaultValue={vehicle?.licensePlate}
            maxLength={30}
            placeholder="เช่น 1กข 1234"
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className={onboarding ? 'onboarding-submit' : 'modal-footer'}>
        <button className="button primary full-width" disabled={busy} type="submit">
          {busy ? 'กำลังบันทึก…' : onboarding ? 'เริ่มต้นใช้งาน' : 'บันทึกข้อมูลรถ'}
          {!busy && <ArrowRight size={18} />}
        </button>
      </div>
    </form>
  )
}
