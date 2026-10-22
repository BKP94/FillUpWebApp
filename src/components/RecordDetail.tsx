import { Pencil, Trash2 } from 'lucide-react'
import type { FuelRecord } from '../models'
import { baht, dateLabel, number } from '../utils/format'
import { ReceiptRow } from './Common'

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
        <div className="receipt">
          <div className="receipt-head">
            <span>{dateLabel(record.date, { hour: '2-digit', minute: '2-digit' })}</span>
            <span className={`badge ${record.isFullTank ? 'full' : ''}`}>
              {record.isFullTank ? 'เต็มถัง' : 'ไม่เต็มถัง'}
            </span>
          </div>
          <dl className="receipt-rows">
            <ReceiptRow label="เลขไมล์" value={number(record.odometer, record.odometer % 1 ? 1 : 0)} unit="km" />
            <ReceiptRow label="ปริมาณน้ำมัน" value={number(record.liters, 3)} unit="L" />
            <ReceiptRow label="ราคาต่อลิตร" value={number(record.pricePerLiter, 2)} unit="฿/L" />
            <ReceiptRow
              label="อัตราสิ้นเปลือง"
              value={economy === undefined ? 'ยังมีข้อมูลไม่เพียงพอ' : number(economy, 1)}
              unit={economy === undefined ? undefined : 'km/L'}
            />
            <ReceiptRow label="ประเภทน้ำมัน" value={record.fuelType} />
            <ReceiptRow label="สถานีบริการ" value={record.station || 'ไม่ได้ระบุ'} />
          </dl>
          <div className="receipt-total">
            <span>ยอดรวม</span>
            <strong>{baht(record.totalCost)}</strong>
          </div>
        </div>
        {record.notes && (
          <div className="detail-notes">
            <h3>หมายเหตุ</h3>
            <p>{record.notes}</p>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="button danger" onClick={remove}>
          <Trash2 size={17} aria-hidden="true" /> ลบรายการ
        </button>
        <button className="button primary" onClick={edit}>
          <Pencil size={17} aria-hidden="true" /> แก้ไขรายการ
        </button>
      </div>
    </>
  )
}
