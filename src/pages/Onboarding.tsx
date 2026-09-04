import { ArrowUpRight, Check, Fuel, ShieldCheck } from 'lucide-react'
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
        <span className="eyebrow">บันทึกง่าย เข้าใจทุกถัง</span>
        <h1>
          ยินดีต้อนรับสู่
          <br />
          <span>FillUp.</span>
        </h1>
        <p>
          เพื่อนร่วมทางที่ช่วยให้คุณเข้าใจ
          <br />
          การใช้น้ำมันและค่าใช้จ่ายของรถ
        </p>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-orbit" />
          <Fuel size={86} strokeWidth={1.2} />
          <span className="art-check">
            <Check size={25} />
          </span>
          <span className="art-leaf">km/L</span>
        </div>
        <div className="welcome-benefits">
          <span>
            <Check size={16} /> ใช้งานออฟไลน์ได้
          </span>
          <span>
            <Check size={16} /> ไม่มีค่าใช้จ่าย
          </span>
          <span>
            <Check size={16} /> ไม่ต้องสมัครสมาชิก
          </span>
        </div>
        <p className="welcome-privacy">
          <ShieldCheck size={17} /> ข้อมูลทั้งหมดอยู่บนอุปกรณ์ของคุณ
        </p>
      </div>
      <div className="card onboarding-form">
        <div className="onboarding-title">
          <span className="step-label">เริ่มต้นในขั้นตอนเดียว</span>
          <h2>เพิ่มรถคันแรกของคุณ</h2>
          <p>แล้วให้เราช่วยดูแลเรื่องตัวเลข</p>
        </div>
        <VehicleForm onSave={saveVehicle} onboarding />
        <button className="text-button restore-first" onClick={onRestore}>
          มีข้อมูลเดิมอยู่แล้ว? นำเข้าไฟล์สำรอง <ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  )
}
