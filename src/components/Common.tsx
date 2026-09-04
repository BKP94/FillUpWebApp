import { Fuel, ArrowUpRight, ChevronRight, type LucideIcon } from 'lucide-react'
import type { FuelRecord } from '../models'
import { baht, dateLabel, number } from '../utils/format'

export function EmptyState({
  title,
  description,
  action,
  label = 'เติมน้ำมันครั้งแรก',
  icon: Icon = Fuel,
}: {
  title: string
  description: string
  action?: () => void
  label?: string
  icon?: LucideIcon
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={30} strokeWidth={1.6} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="button primary" onClick={action}>
          {label}
          <ArrowUpRight size={17} />
        </button>
      )}
    </div>
  )
}
export function Metric({
  label,
  value,
  unit,
  icon: Icon,
  note,
}: {
  label: string
  value: string
  unit?: string
  icon?: LucideIcon
  note?: string
}) {
  return (
    <div className="metric card">
      <div className="metric-label">
        {label}
        {Icon && <Icon size={19} />}
      </div>
      <div className="metric-value">
        {value}
        <span>{unit}</span>
      </div>
      {note && <div className="metric-note">{note}</div>}
    </div>
  )
}
export function RecordRow({
  record,
  economy,
  onClick,
}: {
  record: FuelRecord
  economy?: number
  onClick: () => void
}) {
  return (
    <button className="record-row" onClick={onClick}>
      <span className={`record-icon ${record.isFullTank ? '' : 'partial'}`}>
        <Fuel size={21} />
      </span>
      <span className="record-main">
        <strong>
          {dateLabel(record.date, { year: undefined })}
          <span className={`badge ${record.isFullTank ? 'green' : ''}`}>
            {record.isFullTank ? 'เต็มถัง' : 'ไม่เต็มถัง'}
          </span>
        </strong>
        <span>
          {number(record.odometer)} km <i>·</i> {number(record.liters, 2)} L
        </span>
        <span className="record-extra">
          {number(record.pricePerLiter, 2)} ฿/L{economy !== undefined && ` · ${number(economy, 1)} km/L`}
        </span>
      </span>
      <span className="record-price">
        <strong>{baht(record.totalCost)}</strong>
        <span>{record.station || record.fuelType}</span>
      </span>
      <ChevronRight className="row-chevron" size={17} />
    </button>
  )
}
