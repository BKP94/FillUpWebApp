import { ArrowRight, Info, Plus } from 'lucide-react'
import type { FuelRecord, Vehicle } from '../models'
import { statistics, chronological } from '../services/calculations'
import { baht, dateLabel, monthKey, monthLabel, number } from '../utils/format'
import { EmptyState, Metric, Odometer, PageHeading, ReceiptRow, RecordRow } from '../components/Common'
import { Chart } from '../components/Chart'

export function Dashboard({
  vehicle,
  records,
  addFuel,
  openRecord,
  navigate,
}: {
  vehicle: Vehicle
  records: FuelRecord[]
  addFuel: () => void
  openRecord: (record: FuelRecord) => void
  navigate: (page: 'history' | 'statistics') => void
}) {
  const stats = statistics(records)
  const recent = chronological(records).reverse().slice(0, 3)
  const economies = new Map(stats.intervals.map((item) => [item.recordId, item.kmPerLiter]))
  const latestOdometer = chronological(records).at(-1)?.odometer ?? vehicle.initialOdometer
  return (
    <>
      <PageHeading
        title="ภาพรวมของคุณ"
        description="บันทึกวันนี้ เพื่อการเดินทางที่คุ้มค่ากว่า"
      >
        <button className="button signal desktop-action" onClick={addFuel}>
          <Plus size={19} aria-hidden="true" /> เติมน้ำมัน
        </button>
      </PageHeading>
      <section className="cluster" aria-label="หน้าปัดเลขไมล์และอัตราสิ้นเปลือง">
        <div className="vehicle-hero">
          <div className="hero-top">
            <span className="hero-tag">รถที่กำลังใช้งาน</span>
            <span className="hero-fuel">{vehicle.fuelType}</span>
          </div>
          <h2>{vehicle.name}</h2>
          <p>
            {vehicle.brand} {vehicle.model} · {vehicle.year}
            {vehicle.licensePlate && <span className="plate">{vehicle.licensePlate}</span>}
          </p>
          <div className="hero-odometer">
            <span>เลขไมล์ปัจจุบัน</span>
            <Odometer value={latestOdometer} />
          </div>
        </div>
        <div className="economy-metrics">
          <Metric
            size="l"
            label="อัตราสิ้นเปลืองเฉลี่ย"
            value={stats.average === null ? '—' : number(stats.average, 1)}
            unit="km/L"
            note={
              stats.average === null
                ? 'ยังมีข้อมูลไม่เพียงพอ'
                : `จาก ${stats.intervals.length} ช่วงเติมเต็มถัง`
            }
          />
          <Metric
            label="อัตราสิ้นเปลืองล่าสุด"
            value={stats.latest === null ? '—' : number(stats.latest, 1)}
            unit="km/L"
            note={stats.latest === null ? 'บันทึกเต็มถัง 2 ครั้งเพื่อเริ่มคำนวณ' : 'คำนวณด้วยวิธีเติมเต็มถัง'}
          />
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel month-receipt" aria-labelledby="month-heading">
          <div className="panel-heading">
            <h2 id="month-heading">เดือนนี้เป็นอย่างไร</h2>
            <span className="chip">{monthLabel(monthKey(new Date().toISOString()))}</span>
          </div>
          <dl className="receipt-rows">
            <ReceiptRow label="น้ำมันที่เติม" value={number(stats.monthlyLiters, 2)} unit="L" />
            <ReceiptRow label="ระยะทางที่บันทึก" value={number(stats.monthlyDistance)} unit="km" />
            <ReceiptRow label="จำนวนครั้งที่เติม" value={number(stats.monthlyCount)} unit="ครั้ง" />
          </dl>
          <div className="receipt-total">
            <span>ค่าใช้จ่าย</span>
            <strong>{baht(stats.monthlyCost)}</strong>
          </div>
        </section>
        <section className="panel recent-panel" aria-labelledby="recent-heading">
          <div className="panel-heading">
            <h2 id="recent-heading">เติมน้ำมันล่าสุด</h2>
            <button className="text-button" onClick={() => navigate('history')}>
              ดูทั้งหมด <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          {recent.length ? (
            <div className="ledger">
              {recent.map((record) => (
                <RecordRow
                  key={record.id}
                  record={record}
                  economy={economies.get(record.id)}
                  onClick={() => openRecord(record)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="ถังแรกของเรื่องราว"
              description="เริ่มบันทึกการเติมน้ำมัน แล้วให้ FillUp ช่วยดูแลตัวเลขให้คุณ"
              action={addFuel}
            />
          )}
        </section>
        <section className="panel chart-panel wide" aria-labelledby="trend-heading">
          <div className="panel-heading">
            <div>
              <h2 id="trend-heading">ทุกถัง บอกอะไรได้มากกว่า</h2>
              <p>อัตราสิ้นเปลือง 12 ช่วงล่าสุด · km/L</p>
            </div>
            <button className="text-button" onClick={() => navigate('statistics')}>
              ดูสถิติทั้งหมด <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          <Chart
            label="อัตราสิ้นเปลืองล่าสุด"
            unit="km/L"
            points={stats.intervals
              .slice(-12)
              .map((item) => ({ label: dateLabel(item.date, { year: undefined }), value: item.kmPerLiter }))}
          />
          <p className="chart-footnote">ยิ่ง km/L สูง ยิ่งเดินทางได้ไกลต่อลิตร</p>
        </section>
      </div>
      <p className="tip-line">
        <Info size={18} aria-hidden="true" />
        <span>
          <strong>เคล็ดลับ:</strong> เติมเต็มถังและบันทึกเลขไมล์ทุกครั้ง หากเติมไม่เต็มถัง ก็ยังบันทึกได้ตามปกติ
        </span>
      </p>
      <button className="button signal mobile-add" onClick={addFuel}>
        <Plus size={22} aria-hidden="true" /> เติมน้ำมัน
      </button>
    </>
  )
}
