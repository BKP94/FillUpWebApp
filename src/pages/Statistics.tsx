import type { FuelRecord } from '../models'
import { statistics, chronological } from '../services/calculations'
import { baht, dateLabel, monthLabel, number } from '../utils/format'
import { Metric, PageHeading, ReceiptRow } from '../components/Common'
import { Chart } from '../components/Chart'

export function Statistics({ records }: { records: FuelRecord[] }) {
  const stats = statistics(records)
  const economy = (value: number | null) => (value === null ? '—' : number(value, 1))
  return (
    <>
      <PageHeading
        title="สถิติการเดินทาง"
        description={`ภาพรวมทั้งหมดของรถที่เลือก · ${records.length} รายการ`}
      >
        <span className="chip">ตั้งแต่เริ่มบันทึก</span>
      </PageHeading>
      <section className="cluster stats-primary" aria-label="อัตราสิ้นเปลือง">
        <Metric size="l" label="อัตราสิ้นเปลืองเฉลี่ย" value={economy(stats.average)} unit="km/L" />
        <Metric label="ประหยัดที่สุด" value={economy(stats.best)} unit="km/L" />
        <Metric label="สิ้นเปลืองที่สุด" value={economy(stats.worst)} unit="km/L" />
      </section>
      {stats.average === null && (
        <p className="info-note">
          ยังมีข้อมูลไม่เพียงพอ — ต้องมีการเติมเต็มถังอย่างน้อย 2 ครั้งเพื่อคำนวณ km/L
        </p>
      )}
      <section className="panel chart-panel">
        <div className="panel-heading">
          <div>
            <h2>อัตราสิ้นเปลืองแต่ละครั้ง</h2>
            <p>30 ช่วงเติมเต็มถังล่าสุด · km/L</p>
          </div>
          <span className="badge full">วิธีเต็มถัง</span>
        </div>
        <Chart
          unit="km/L"
          label="อัตราสิ้นเปลืองแต่ละครั้ง"
          points={stats.intervals
            .slice(-30)
            .map((item) => ({ label: dateLabel(item.date), value: item.kmPerLiter }))}
        />
      </section>
      <section className="panel stats-secondary" aria-labelledby="totals-heading">
        <div className="panel-heading">
          <h2 id="totals-heading">ยอดรวมตั้งแต่เริ่มบันทึก</h2>
        </div>
        <dl className="receipt-rows two-up">
          <ReceiptRow label="ค่าใช้จ่ายทั้งหมด" value={baht(stats.totalCost)} />
          <ReceiptRow label="น้ำมันทั้งหมด" value={number(stats.totalLiters, 2)} unit="L" />
          <ReceiptRow label="ระยะทางที่บันทึก" value={number(stats.distance)} unit="km" />
          <ReceiptRow
            label="ราคาน้ำมันเฉลี่ย"
            value={stats.averagePrice === null ? '—' : number(stats.averagePrice, 2)}
            unit="฿/L"
          />
          <ReceiptRow
            label="ค่าใช้จ่ายต่อกิโลเมตร"
            value={stats.costPerKm === null ? '—' : number(stats.costPerKm, 2)}
            unit="฿/km"
          />
          <ReceiptRow label="จำนวนครั้งที่เติม" value={number(records.length)} unit="ครั้ง" />
        </dl>
      </section>
      <div className="two-column">
        <section className="panel chart-panel">
          <div className="panel-heading">
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
        <section className="panel chart-panel">
          <div className="panel-heading">
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
      <details className="calculation-note panel">
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
