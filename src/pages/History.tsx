import { useState } from 'react'
import { Search, Plus, History as HistoryIcon } from 'lucide-react'
import type { FuelRecord } from '../models'
import { statistics, chronological } from '../services/calculations'
import { baht, monthKey, monthLabel } from '../utils/format'
import { EmptyState, PageHeading, RecordRow } from '../components/Common'

export function History({
  records,
  addFuel,
  openRecord,
}: {
  records: FuelRecord[]
  addFuel: () => void
  openRecord: (record: FuelRecord) => void
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const ordered = chronological(records).reverse()
  const months = [...new Set(ordered.map((record) => monthKey(record.date)))]
  const visible = ordered.filter(
    (record) =>
      (filter === 'all' || monthKey(record.date) === filter) &&
      `${record.station} ${record.notes} ${record.fuelType} ${record.odometer}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  const groups = [...new Set(visible.map((record) => monthKey(record.date)))]
  const economies = new Map(statistics(records).intervals.map((item) => [item.recordId, item.kmPerLiter]))
  return (
    <>
      <PageHeading
        title="ประวัติการเติม"
        description={`ทุกรายการ ครบในที่เดียว · ${records.length} ครั้ง`}
      >
        <button className="button signal" onClick={addFuel}>
          <Plus size={18} aria-hidden="true" /> เติมน้ำมัน
        </button>
      </PageHeading>
      {!!records.length && (
        <div className="filter-bar">
          <label className="search-field">
            <Search size={19} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="ค้นหาประวัติ"
              placeholder="ค้นหาปั๊ม หมายเหตุ หรือเลขไมล์"
            />
          </label>
          <select
            aria-label="กรองตามเดือน"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">ทุกเดือน</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {monthLabel(month)}
              </option>
            ))}
          </select>
        </div>
      )}
      {!visible.length ? (
        <section className="panel">
          <EmptyState
            icon={HistoryIcon}
            title={records.length ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีประวัติการเติม'}
            description={
              records.length
                ? 'ลองเปลี่ยนคำค้นหาหรือเลือกเดือนอื่น'
                : 'บันทึกการเติมครั้งแรก แล้วเริ่มรู้จักรถของคุณมากขึ้น'
            }
            action={
              records.length
                ? () => {
                    setQuery('')
                    setFilter('all')
                  }
                : addFuel
            }
            label={records.length ? 'ล้างตัวกรอง' : 'เติมน้ำมันครั้งแรก'}
          />
        </section>
      ) : (
        groups.map((month) => (
          <section key={month} className="history-group" aria-label={monthLabel(month)}>
            <div className="ledger-heading">
              <h2>{monthLabel(month)}</h2>
              <span>
                {visible.filter((record) => monthKey(record.date) === month).length} ครั้ง ·{' '}
                <strong>
                  {baht(
                    visible
                      .filter((record) => monthKey(record.date) === month)
                      .reduce((sum, record) => sum + record.totalCost, 0),
                  )}
                </strong>
              </span>
            </div>
            <div className="panel ledger">
              {visible
                .filter((record) => monthKey(record.date) === month)
                .map((record) => (
                  <RecordRow
                    key={record.id}
                    record={record}
                    economy={economies.get(record.id)}
                    onClick={() => openRecord(record)}
                  />
                ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}
