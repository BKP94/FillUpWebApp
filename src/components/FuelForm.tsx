import { useState, type FormEvent } from 'react'
import { Check, Fuel, TriangleAlert } from 'lucide-react'
import { fuelTypes, type FuelRecord, type Vehicle } from '../models'
import { inputDate, baht, roundMoney } from '../utils/format'
import { recordWarnings, validateRecord } from '../services/validation'
import { errorMessage } from '../hooks/useAppData'
import { chronological } from '../services/calculations'

export function FuelForm({
  vehicle,
  records,
  record,
  onSave,
}: {
  vehicle: Vehicle
  records: FuelRecord[]
  record?: FuelRecord
  onSave: (record: FuelRecord) => Promise<void>
}) {
  const latest = chronological(records).at(-1)
  const [liters, setLiters] = useState(record ? String(record.liters) : '')
  const [price, setPrice] = useState(
    record ? String(record.pricePerLiter) : latest ? String(latest.pricePerLiter) : '',
  )
  const [total, setTotal] = useState(record ? String(record.totalCost) : '')
  const [basis, setBasis] = useState<'price' | 'total'>('price')
  const [full, setFull] = useState(record?.isFullTank ?? true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<{ record: FuelRecord; warnings: string[] } | null>(null)
  const update = (field: 'liters' | 'price' | 'total', value: string) => {
    setPending(null)
    const l = field === 'liters' ? value : liters
    const p = field === 'price' ? value : price
    const t = field === 'total' ? value : total
    const mode = field === 'liters' ? basis : field
    setBasis(mode)
    if (field === 'liters') setLiters(value)
    if (field === 'price') setPrice(value)
    if (field === 'total') setTotal(value)
    if (mode === 'price')
      setTotal(
        Number(l) > 0 && Number(p) > 0 && Number.isFinite(Number(l) * Number(p))
          ? String(roundMoney(Number(l) * Number(p)))
          : '',
      )
    else
      setPrice(
        Number(l) > 0 && Number(t) > 0 && Number.isFinite(Number(t) / Number(l))
          ? (Number(t) / Number(l)).toFixed(4)
          : '',
      )
  }
  const save = async (next: FuelRecord) => {
    setBusy(true)
    setError('')
    try {
      await onSave(next)
    } catch (error) {
      setError(errorMessage(error))
      setBusy(false)
      setPending(null)
    }
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const fields = new FormData(event.currentTarget)
    const date = new Date(String(fields.get('date')))
    if (!Number.isFinite(date.getTime())) {
      setError('กรุณาระบุวันที่และเวลาให้ถูกต้อง')
      return
    }
    const now = new Date().toISOString()
    const next: FuelRecord = {
      id: record?.id ?? crypto.randomUUID(),
      vehicleId: vehicle.id,
      date: date.toISOString(),
      odometer: Number(fields.get('odometer')),
      liters: Number(liters),
      pricePerLiter: Number(price),
      totalCost: roundMoney(Number(total)),
      isFullTank: full,
      fuelType: fields.get('fuelType') as FuelRecord['fuelType'],
      station: String(fields.get('station') ?? '').trim(),
      notes: String(fields.get('notes') ?? '').trim(),
      createdAt: record?.createdAt ?? now,
      updatedAt: now,
    }
    const invalid = validateRecord(next)
    if (invalid) {
      setError(invalid)
      return
    }
    const warnings = recordWarnings(next, records, vehicle)
    if (warnings.length) {
      setPending({ record: next, warnings })
      setError('')
      return
    }
    await save(next)
  }
  return (
    <form
      onSubmit={(event) => {
        void submit(event)
      }}
      onChange={() => {
        if (pending) setPending(null)
      }}
    >
      <div className="modal-body form-content">
        <div className="form-intro">
          <span className="small-icon">
            <Fuel size={21} />
          </span>
          <p>
            {vehicle.name}
            <span>
              {vehicle.brand} {vehicle.model}
            </span>
          </p>
        </div>
        <label>
          วันที่และเวลา
          <input
            name="date"
            type="datetime-local"
            defaultValue={inputDate(record ? new Date(record.date) : new Date())}
            required
          />
        </label>
        <label>
          เลขไมล์ (km)
          <input
            name="odometer"
            aria-label="เลขไมล์ (km)"
            type="number"
            inputMode="decimal"
            min="0"
            max="10000000"
            step="0.1"
            defaultValue={record?.odometer ?? ''}
            placeholder={String(latest?.odometer ?? vehicle.initialOdometer)}
            required
          />
          <span className="field-hint">เลขไมล์ล่าสุด {latest?.odometer ?? vehicle.initialOdometer} km</span>
        </label>
        <div className="form-grid">
          <label>
            ปริมาณน้ำมัน (L)
            <input
              name="liters"
              type="number"
              inputMode="decimal"
              min="0.001"
              max="100000"
              step="0.001"
              value={liters}
              onChange={(event) => update('liters', event.target.value)}
              placeholder="0.00"
              required
            />
          </label>
          <label>
            ราคาต่อลิตร (฿/L)
            <input
              name="price"
              type="number"
              inputMode="decimal"
              min="0.001"
              max="100000"
              step="0.0001"
              value={price}
              onChange={(event) => update('price', event.target.value)}
              placeholder="0.00"
              required
            />
          </label>
        </div>
        <label>
          ยอดรวม (฿)
          <input
            name="total"
            aria-label="ยอดรวม (฿)"
            className="total-input"
            type="number"
            inputMode="decimal"
            min="0.01"
            max="1000000000"
            step="0.01"
            value={total}
            onChange={(event) => update('total', event.target.value)}
            placeholder="0.00"
            required
          />
          <span className="field-hint">คำนวณให้อัตโนมัติ หรือกรอกยอดรวมจากใบเสร็จ</span>
        </label>
        <label className="toggle-row">
          <span>
            <strong>เติมเต็มถัง</strong>
            <small>ใช้คำนวณอัตราสิ้นเปลืองที่แม่นยำ</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={full}
            onChange={(event) => setFull(event.target.checked)}
          />
          <span className="toggle-track" aria-hidden="true">
            <Check size={14} />
          </span>
        </label>
        <label>
          ประเภทน้ำมัน
          <select name="fuelType" defaultValue={record?.fuelType ?? vehicle.fuelType}>
            {fuelTypes.map((fuel) => (
              <option key={fuel}>{fuel}</option>
            ))}
          </select>
        </label>
        <label>
          สถานีบริการ <span className="optional">ไม่บังคับ</span>
          <input
            name="station"
            maxLength={120}
            defaultValue={record?.station}
            placeholder="ชื่อปั๊มหรือสาขา"
          />
        </label>
        <label>
          หมายเหตุ <span className="optional">ไม่บังคับ</span>
          <textarea
            name="notes"
            maxLength={2000}
            rows={2}
            defaultValue={record?.notes}
            placeholder="จดอะไรไว้สักนิด…"
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {pending && (
          <div className="warning" role="alert">
            <strong>
              <TriangleAlert size={17} /> ตรวจสอบก่อนบันทึก
            </strong>
            {pending.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
            <button
              type="button"
              className="button secondary full-width"
              disabled={busy}
              onClick={() => {
                void save(pending.record)
              }}
            >
              ตรวจสอบแล้ว ยืนยันบันทึก
            </button>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <div className="form-total">
          <span>ยอดเติมน้ำมัน</span>
          <strong>{baht(Number(total) || 0)}</strong>
        </div>
        <button className="button primary" disabled={busy || !!pending} type="submit">
          {busy ? 'กำลังบันทึก…' : 'บันทึกการเติม'}
        </button>
      </div>
    </form>
  )
}
