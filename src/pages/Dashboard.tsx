import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Droplets,
  Fuel,
  Gauge,
  Plus,
  Route,
  Leaf,
  ShieldCheck,
} from 'lucide-react'
import type { FuelRecord, Vehicle } from '../models'
import { statistics, chronological } from '../services/calculations'
import { baht, dateLabel, monthKey, monthLabel, number } from '../utils/format'
import { EmptyState, Metric, RecordRow } from '../components/Common'
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
      <div className="page-heading">
        <div>
          <div className="eyebrow">ทุกการเดินทาง เริ่มที่ความเข้าใจ</div>
          <h1>
            ภาพรวมของคุณ<span className="heading-dot">.</span>
          </h1>
          <p>บันทึกวันนี้ เพื่อการเดินทางที่คุ้มค่ากว่า</p>
        </div>
        <button className="button primary desktop-action" onClick={addFuel}>
          <Plus size={19} /> เติมน้ำมัน
        </button>
      </div>
      <div className="dashboard-top">
        <section className="vehicle-hero">
          <div className="hero-top">
            <span className="hero-tag">
              <span /> รถที่กำลังใช้งาน
            </span>
            <span className="hero-fuel">{vehicle.fuelType}</span>
          </div>
          <h2>{vehicle.name}</h2>
          <p>
            {vehicle.brand} {vehicle.model} <span>·</span> {vehicle.year}
          </p>
          <div className="hero-odometer">
            <span>เลขไมล์ปัจจุบัน</span>
            <strong>
              {number(latestOdometer, latestOdometer % 1 ? 1 : 0)}
              <small>km</small>
            </strong>
          </div>
          <div className="hero-road" aria-hidden="true">
            <div />
            <div />
            <div />
          </div>
          <Gauge className="hero-gauge" size={155} strokeWidth={0.65} />
          <div className="hero-footer">
            <span>
              <ShieldCheck size={15} /> ข้อมูลอยู่บนอุปกรณ์ของคุณ
            </span>
            <ArrowUpRight size={19} />
          </div>
        </section>
        <div className="economy-metrics">
          <Metric
            label="อัตราสิ้นเปลืองเฉลี่ย"
            value={stats.average === null ? '—' : number(stats.average, 1)}
            unit="km/L"
            icon={Leaf}
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
            icon={Gauge}
            note={stats.latest === null ? 'บันทึกเต็มถัง 2 ครั้งเพื่อเริ่มคำนวณ' : 'คำนวณด้วยวิธีเติมเต็มถัง'}
          />
        </div>
      </div>
      <div className="section-heading">
        <h2>เดือนนี้เป็นอย่างไร</h2>
        <span className="month-chip">{monthLabel(monthKey(new Date().toISOString()))}</span>
      </div>
      <div className="monthly-grid">
        <Metric label="ค่าใช้จ่าย" value={baht(stats.monthlyCost)} icon={Banknote} />
        <Metric label="น้ำมันที่เติม" value={number(stats.monthlyLiters, 2)} unit="L" icon={Droplets} />
        <Metric label="ระยะทางที่บันทึก" value={number(stats.monthlyDistance)} unit="km" icon={Route} />
        <Metric label="จำนวนครั้งที่เติม" value={number(stats.monthlyCount)} unit="ครั้ง" icon={Fuel} />
      </div>
      <div className="dashboard-bottom">
        <section className="card chart-panel">
          <div className="section-heading inside">
            <div>
              <h2>ทุกถัง บอกอะไรได้มากกว่า</h2>
              <p>อัตราสิ้นเปลือง 12 ช่วงล่าสุด · km/L</p>
            </div>
            <button
              className="icon-button"
              onClick={() => navigate('statistics')}
              aria-label="ดูสถิติทั้งหมด"
            >
              <ArrowUpRight size={21} />
            </button>
          </div>
          <Chart
            label="อัตราสิ้นเปลืองล่าสุด"
            unit="km/L"
            points={stats.intervals
              .slice(-12)
              .map((item) => ({ label: dateLabel(item.date, { year: undefined }), value: item.kmPerLiter }))}
          />
          <div className="chart-footnote">
            <span className="legend-dot" />
            ยิ่ง km/L สูง ยิ่งเดินทางได้ไกลต่อลิตร
          </div>
        </section>
        <section className="card recent-panel">
          <div className="section-heading inside">
            <h2>เติมน้ำมันล่าสุด</h2>
            <button className="text-button" onClick={() => navigate('history')}>
              ดูทั้งหมด <ArrowRight size={15} />
            </button>
          </div>
          {recent.length ? (
            <div>
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
      </div>
      <div className="tip-card">
        <span className="small-icon">
          <Leaf size={21} />
        </span>
        <div>
          <strong>เคล็ดลับเล็ก ๆ เพื่อข้อมูลที่แม่นยำ</strong>
          <p>เติมเต็มถังและบันทึกเลขไมล์ทุกครั้ง หากเติมไม่เต็มถัง ก็ยังบันทึกได้ตามปกติ</p>
        </div>
      </div>
      <button className="button primary mobile-add" onClick={addFuel}>
        <Plus size={22} /> เติมน้ำมัน
      </button>
    </>
  )
}
