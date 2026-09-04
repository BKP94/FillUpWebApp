import { Pencil, Trash2 } from 'lucide-react'
import type { FuelRecord } from '../models'
import { baht, dateLabel, number } from '../utils/format'

export function RecordDetail({
  record,
  economy,
  edit,
  remove,
}: {
  record: FuelRecord
  economy?: number
  edit: () => void
  remove: () => void
}) {
  return (
    <>
      <div className="modal-body">
        <div className="detail-amount">
          <span className={`badge ${record.isFullTank ? 'green' : ''}`}>
            {record.isFullTank ? 'เต็มถัง' : 'ไม่เต็มถัง'}
          </span>
          <strong>{baht(record.totalCost)}</strong>
          <span>{dateLabel(record.date, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <dl className="detail-list">
          <div>
            <dt>เลขไมล์</dt>
            <dd>{number(record.odometer, record.odometer % 1 ? 1 : 0)} km</dd>
          </div>
          <div>
            <dt>ปริมาณน้ำมัน</dt>
            <dd>{number(record.liters, 3)} L</dd>
          </div>
          <div>
            <dt>ราคาต่อลิตร</dt>
            <dd>{number(record.pricePerLiter, 2)} ฿/L</dd>
          </div>
          <div>
            <dt>อัตราสิ้นเปลือง</dt>
            <dd>{economy === undefined ? 'ยังมีข้อมูลไม่เพียงพอ' : `${number(economy, 1)} km/L`}</dd>
          </div>
          <div>
            <dt>ประเภทน้ำมัน</dt>
            <dd>{record.fuelType}</dd>
          </div>
          <div>
            <dt>สถานีบริการ</dt>
            <dd>{record.station || 'ไม่ได้ระบุ'}</dd>
          </div>
        </dl>
        {record.notes && (
          <div className="detail-notes">
            <h3>หมายเหตุ</h3>
            <p>{record.notes}</p>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="button secondary danger-text" onClick={remove}>
          <Trash2 size={17} /> ลบรายการ
        </button>
        <button className="button primary" onClick={edit}>
          <Pencil size={17} /> แก้ไขรายการ
        </button>
      </div>
    </>
  )
}
