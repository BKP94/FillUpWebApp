import { ArrowRight, Check, ShieldCheck } from 'lucide-react'
import type { Vehicle } from '../models'
import { VehicleForm } from '../components/VehicleForm'
export function Onboarding({
  saveVehicle,
  onRestore,
}: {
  saveVehicle: (vehicle: Vehicle) => Promise<void>
  onRestore: () => void
}) {
  return (
    <section className="onboarding">
      <div className="onboarding-story">
        <h1>
          ยินดีต้อนรับสู่ <span className="brand-word">FillUp<span className="brand-dot">.</span></span>
        </h1>
        <p>เพื่อนร่วมทางที่ช่วยให้คุณเข้าใจการใช้น้ำมันและค่าใช้จ่ายของรถ</p>
        <dl className="receipt-rows welcome-benefits">
          <div className="receipt-row">
            <dt>ใช้งานออฟไลน์ได้</dt>
            <dd>
              <Check size={18} role="img" aria-label="รองรับ" />
            </dd>
          </div>
          <div className="receipt-row">
            <dt>ไม่มีค่าใช้จ่าย</dt>
            <dd>
              <Check size={18} role="img" aria-label="รองรับ" />
            </dd>
          </div>
          <div className="receipt-row">
            <dt>ไม่ต้องสมัครสมาชิก</dt>
            <dd>
              <Check size={18} role="img" aria-label="รองรับ" />
            </dd>
          </div>
        </dl>
        <p className="welcome-privacy">
          <ShieldCheck size={17} aria-hidden="true" /> ข้อมูลทั้งหมดอยู่บนอุปกรณ์ของคุณ
        </p>
      </div>
      <div className="panel onboarding-form">
        <div className="onboarding-title">
          <span className="step-label">เริ่มต้นในขั้นตอนเดียว</span>
          <h2>เพิ่มรถคันแรกของคุณ</h2>
          <p>แล้วให้เราช่วยดูแลเรื่องตัวเลข</p>
        </div>
        <VehicleForm onSave={saveVehicle} onboarding />
        <button className="text-button restore-first" onClick={onRestore}>
          มีข้อมูลเดิมอยู่แล้ว? นำเข้าไฟล์สำรอง <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
