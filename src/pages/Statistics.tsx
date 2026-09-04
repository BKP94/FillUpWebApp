import { Banknote, Droplets, Gauge, Medal, Route, TrendingDown } from 'lucide-react'
import type { FuelRecord } from '../models'
import { statistics, chronological } from '../services/calculations'
import { baht, dateLabel, monthLabel, number } from '../utils/format'
import { Metric } from '../components/Common'
import { Chart } from '../components/Chart'

export function Statistics({ records }: { records: FuelRecord[] }) {
  const stats = statistics(records)
  const economy = (value: number | null) => (value === null ? '—' : number(value, 1))
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">เข้าใจรถ ผ่านตัวเลข</div>
          <h1>
            สถิติการเดินทาง<span className="heading-dot">.</span>
          </h1>
          <p>ภาพรวมทั้งหมดของรถที่เลือก · {records.length} รายการ</p>
        </div>
        <span className="month-chip">ตั้งแต่เริ่มบันทึก</span>
      </div>
      <div className="stats-primary">
        <Metric label="อัตราสิ้นเปลืองเฉลี่ย" value={economy(stats.average)} unit="km/L" icon={Gauge} />
        <Metric label="ประหยัดที่สุด" value={economy(stats.best)} unit="km/L" icon={Medal} />
        <Metric label="สิ้นเปลืองที่สุด" value={economy(stats.worst)} unit="km/L" icon={TrendingDown} />
      </div>
      {stats.average === null && (
        <p className="info-note">
          ยังมีข้อมูลไม่เพียงพอ — ต้องมีการเติมเต็มถังอย่างน้อย 2 ครั้งเพื่อคำนวณ km/L
        </p>
      )}
      <section className="card chart-panel">
        <div className="section-heading inside">
          <div>
            <h2>อัตราสิ้นเปลืองแต่ละครั้ง</h2>
            <p>30 ช่วงเติมเต็มถังล่าสุด · km/L</p>
          </div>
          <span className="badge green">วิธีเต็มถัง</span>
        </div>
        <Chart
          unit="km/L"
          label="อัตราสิ้นเปลืองแต่ละครั้ง"
          points={stats.intervals
            .slice(-30)
            .map((item) => ({ label: dateLabel(item.date), value: item.kmPerLiter }))}
        />
      </section>
      <div className="stats-secondary">
        <Metric label="ค่าใช้จ่ายทั้งหมด" value={baht(stats.totalCost)} icon={Banknote} />
        <Metric label="น้ำมันทั้งหมด" value={number(stats.totalLiters, 2)} unit="L" icon={Droplets} />
        <Metric label="ระยะทางที่บันทึก" value={number(stats.distance)} unit="km" icon={Route} />
        <Metric
          label="ราคาน้ำมันเฉลี่ย"
          value={stats.averagePrice === null ? '—' : number(stats.averagePrice, 2)}
          unit="฿/L"
        />
        <Metric
          label="ค่าใช้จ่ายต่อกิโลเมตร"
          value={stats.costPerKm === null ? '—' : number(stats.costPerKm, 2)}
          unit="฿/km"
        />
        <Metric label="จำนวนครั้งที่เติม" value={number(records.length)} unit="ครั้ง" />
      </div>
      <div className="two-column">
        <section className="card chart-panel">
          <div className="section-heading inside">
            <div>
              <h2>ค่าใช้จ่ายรายเดือน</h2>
              <p>12 เดือนที่มีการเติมล่าสุด · บาท</p>
            </div>
          </div>
          <Chart
            label="ค่าใช้จ่ายรายเดือน"
            unit="บาท"
            bars
            points={stats.monthlySpending
              .slice(-12)
              .map((item) => ({ label: monthLabel(item.month), value: item.amount }))}
          />
        </section>
        <section className="card chart-panel">
          <div className="section-heading inside">
            <div>
              <h2>ราคาน้ำมันตามเวลา</h2>
              <p>30 รายการล่าสุด · บาทต่อลิตร</p>
            </div>
          </div>
          <Chart
            label="ราคาน้ำมันตามเวลา"
            unit="฿/L"
            points={chronological(records)
              .slice(-30)
              .map((item) => ({ label: dateLabel(item.date), value: item.pricePerLiter }))}
          />
        </section>
      </div>
      <details className="calculation-note card">
        <summary>ตัวเลขเหล่านี้คำนวณอย่างไร?</summary>
        <p>
          km/L = ระยะทางระหว่างการเติมเต็มถัง ÷ น้ำมันทุกครั้งหลังเต็มถังก่อนหน้า
          รวมการเติมบางส่วนจนถึงเต็มถังครั้งนี้ ค่าเฉลี่ยใช้ระยะทางรวม ÷ น้ำมันรวมของช่วงที่คำนวณได้
        </p>
        <p>
          ระยะทางเริ่มนับจากรายการเติมครั้งแรก ระยะทางรายเดือนนับส่วนต่างเลขไมล์ที่สิ้นสุดในเดือนนั้น
          หากเลขไมล์ลดลงจะไม่นับช่วงนั้น ค่าใช้จ่ายต่อกิโลเมตรคือยอดซื้อทั้งหมด ÷ ระยะทางที่บันทึก
          จึงอาจคลาดเคลื่อนจากต้นทุนการใช้น้ำมันจริง โดยเฉพาะช่วงเริ่มต้น
        </p>
        <p>ราคาน้ำมันเฉลี่ย = ค่าใช้จ่ายทั้งหมด ÷ จำนวนลิตรทั้งหมด เดือนและวันที่แสดงตามเขตเวลาของอุปกรณ์</p>
      </details>
    </>
  )
}
