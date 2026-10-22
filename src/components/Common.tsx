import type { ReactNode } from 'react'
import { Fuel, ChevronRight, type LucideIcon } from 'lucide-react'
import type { FuelRecord } from '../models'
import { baht, number } from '../utils/format'

export function PageHeading({
  title,
  description,
  children,
}: {
  title: string
  description?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>
          {title}
          <span className="heading-dot">.</span>
        </h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  )
}
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
      <span className="empty-icon" aria-hidden="true">
        <Icon size={26} strokeWidth={1.6} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="button secondary" onClick={action}>
          {label}
        </button>
      )}
    </div>
  )
}
export function Metric({
  label,
  value,
  unit,
  note,
  size = 'm',
}: {
  label: string
  value: string
  unit?: string
  note?: string
  size?: 'm' | 'l'
}) {
  return (
    <div className={`metric metric-${size}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value}
        {unit && <span>{unit}</span>}
      </div>
      {note && <div className="metric-note">{note}</div>}
    </div>
  )
}
export function ReceiptRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="receipt-row">
      <dt>{label}</dt>
      <dd>
        {value}
        {unit && <span>{unit}</span>}
      </dd>
    </div>
  )
}
export function Odometer({ value }: { value: number }) {
  const text = number(value, value % 1 ? 1 : 0)
  return (
    <strong className="odometer">
      <span className="sr-only">{text} km</span>
      {[...text].map((char, index) =>
        /\d/.test(char) ? (
          <span key={index} className="odometer-digit" aria-hidden="true">
            {char}
          </span>
        ) : (
          <span key={index} className="odometer-sep" aria-hidden="true">
            {char}
          </span>
        ),
      )}
      <small aria-hidden="true">km</small>
    </strong>
  )
}
const dayFormat = new Intl.DateTimeFormat('th-TH', { day: 'numeric' })
const monthFormat = new Intl.DateTimeFormat('th-TH', { month: 'short' })
export function RecordRow({
  record,
  economy,
  onClick,
}: {
  record: FuelRecord
  economy?: number
  onClick: () => void
}) {
  const date = new Date(record.date)
  return (
    <button className="record-row" onClick={onClick}>
      <span className="record-date">
        <strong>{dayFormat.format(date)}</strong>
        <span>{monthFormat.format(date)}</span>
      </span>
      <span className="record-main">
        <strong>
          {number(record.liters, 2)} L
          <span className={`badge ${record.isFullTank ? 'full' : ''}`}>
            {record.isFullTank ? 'เต็มถัง' : 'ไม่เต็มถัง'}
          </span>
        </strong>
        <span>
          {number(record.odometer)} km · {number(record.pricePerLiter, 2)} ฿/L
          {economy !== undefined && <span className="record-economy"> · {number(economy, 1)} km/L</span>}
        </span>
      </span>
      <span className="record-price">
        <strong>{baht(record.totalCost)}</strong>
        <span>{record.station || record.fuelType}</span>
      </span>
      <ChevronRight className="row-chevron" size={18} aria-hidden="true" />
    </button>
  )
}
