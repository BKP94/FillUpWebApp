import { useRef, useState } from 'react'
import {
  ArrowDownToLine,
  Upload,
  FileSpreadsheet,
  ShieldCheck,
  Trash2,
  Database,
  Smartphone,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  Fuel,
} from 'lucide-react'
import type { AppData, AppSettings } from '../models'
import { createBackup, createCsv, downloadFile, parseBackup } from '../services/backup'
import { errorMessage } from '../hooks/useAppData'
import type { Confirmation } from '../components/Modal'
import { MAX_BACKUP_BYTES } from '../models/limits'

export function Settings({
  data,
  updateSettings,
  restore,
  clear,
  confirm,
  notify,
  offlineReady,
}: {
  data: AppData
  updateSettings: (patch: Partial<AppSettings>) => void
  restore: (data: AppData) => Promise<void>
  clear: () => Promise<void>
  confirm: (confirmation: Confirmation) => void
  notify: (message: string) => void
  offlineReady: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [persistent, setPersistent] = useState(false)
  const [requestingStorage, setRequestingStorage] = useState(false)
  const importFile = async (file: File) => {
    setError('')
    setImporting(true)
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('ไฟล์สำรองต้องมีขนาดไม่เกิน 100 MB')
      const imported = parseBackup(await file.text())
      confirm({
        title: 'กู้คืนข้อมูลจากไฟล์?',
        description: `ไฟล์นี้มีรถ ${imported.vehicles.length} คัน และประวัติ ${imported.records.length} รายการ ข้อมูลรถ ประวัติ และการตั้งค่าปัจจุบันทั้งหมดจะถูกแทนที่ ควรส่งออกไฟล์สำรองปัจจุบันก่อนดำเนินการ`,
        label: 'แทนที่และกู้คืน',
        action: async () => {
          await restore(imported)
          notify('กู้คืนข้อมูลเรียบร้อยแล้ว')
        },
      })
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      setImporting(false)
      if (input.current) input.current.value = ''
    }
  }
  const exportFile = (csv: boolean) => {
    try {
      downloadFile(
        csv ? createCsv(data) : createBackup(data),
        `fillup-${new Date().toISOString().slice(0, 10)}-${Date.now()}.${csv ? 'csv' : 'json'}`,
        csv ? 'text/csv;charset=utf-8' : 'application/json',
      )
      notify('เตรียมไฟล์แล้ว เลือกบันทึกลงอุปกรณ์ของคุณ')
    } catch (error) {
      setError(errorMessage(error))
    }
  }
  const requestStorage = async () => {
    setRequestingStorage(true)
    try {
      const result = await navigator.storage?.persist?.()
      setPersistent(!!result)
      notify(
        result
          ? 'เบราว์เซอร์อนุญาตให้เก็บข้อมูลแบบถาวรแล้ว'
          : 'เบราว์เซอร์ยังไม่อนุญาต กรุณาสำรองข้อมูลเป็นระยะ',
      )
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      setRequestingStorage(false)
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ปรับให้เป็นคุณ</div>
          <h1>
            ตั้งค่า<span className="heading-dot">.</span>
          </h1>
          <p>ข้อมูลของคุณ อยู่ในการดูแลของคุณ</p>
        </div>
      </div>
      <div className="settings-grid">
        <div>
          <section className="card settings-section">
            <h2>การแสดงผล</h2>
            <p>เลือกหน้าตาที่สบายตาสำหรับคุณ</p>
            <div className="theme-options">
              {(
                [
                  { value: 'system', label: 'ตามอุปกรณ์', Icon: Monitor },
                  { value: 'light', label: 'สว่าง', Icon: Sun },
                  { value: 'dark', label: 'มืด', Icon: Moon },
                ] as const
              ).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  className={data.settings.theme === value ? 'selected' : ''}
                  aria-pressed={data.settings.theme === value}
                  onClick={() => updateSettings({ theme: value })}
                >
                  <Icon size={22} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="card settings-section">
            <h2>สำรองและย้ายข้อมูล</h2>
            <p>
              รถ {data.vehicles.length} คัน · ประวัติการเติม {data.records.length} รายการ
            </p>
            <div className="settings-rows">
              <button onClick={() => exportFile(false)}>
                <ArrowDownToLine />
                <span>
                  <strong>ส่งออกไฟล์สำรอง JSON</strong>
                  <small>เก็บข้อมูลครบ พร้อมกู้คืนในภายหลัง</small>
                </span>
                <ChevronRight />
              </button>
              <button disabled={importing} onClick={() => input.current?.click()}>
                <Upload />
                <span>
                  <strong>{importing ? 'กำลังตรวจสอบไฟล์…' : 'นำเข้าไฟล์สำรอง JSON'}</strong>
                  <small>แทนที่ข้อมูลปัจจุบันด้วยไฟล์สำรอง</small>
                </span>
                <ChevronRight />
              </button>
              <button onClick={() => exportFile(true)}>
                <FileSpreadsheet />
                <span>
                  <strong>ส่งออกประวัติ CSV</strong>
                  <small>รถทุกคัน · รองรับภาษาไทยใน Excel</small>
                </span>
                <ChevronRight />
              </button>
            </div>
            <input
              ref={input}
              type="file"
              accept=".json,application/json"
              hidden
              aria-label="ไฟล์สำรอง JSON"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void importFile(file)
              }}
            />
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </section>
          <section className="card settings-section">
            <h2>พื้นที่จัดเก็บ</h2>
            <div className="settings-rows">
              <button
                disabled={persistent || requestingStorage}
                onClick={() => {
                  void requestStorage()
                }}
              >
                <Database />
                <span>
                  <strong>
                    {persistent
                      ? 'อนุญาตพื้นที่จัดเก็บถาวรแล้ว'
                      : requestingStorage
                        ? 'กำลังขอสิทธิ์…'
                        : 'ขอเก็บข้อมูลแบบถาวร'}
                  </strong>
                  <small>ช่วยลดโอกาสที่เบราว์เซอร์จะล้างข้อมูล</small>
                </span>
                <ChevronRight />
              </button>
              <button
                className="danger-text"
                onClick={() =>
                  confirm({
                    title: 'ลบข้อมูลทั้งหมด?',
                    description:
                      'รถทุกคัน ประวัติการเติม และการตั้งค่าจะถูกลบออกจากอุปกรณ์นี้ ไม่สามารถย้อนกลับได้ หากต้องการเก็บข้อมูลไว้ กรุณาส่งออกไฟล์สำรองก่อน',
                    action: async () => {
                      await clear()
                      notify('ลบข้อมูลทั้งหมดแล้ว')
                    },
                  })
                }
              >
                <Trash2 />
                <span>
                  <strong>ลบข้อมูลทั้งหมด</strong>
                  <small>ไม่สามารถกู้คืนได้หากไม่มีไฟล์สำรอง</small>
                </span>
                <ChevronRight />
              </button>
            </div>
          </section>
        </div>
        <div>
          <section className="privacy-card">
            <ShieldCheck size={34} strokeWidth={1.5} />
            <h2>
              เรื่องของรถคุณ
              <br />
              เป็นเรื่องของคุณ
            </h2>
            <p>FillUp ไม่ส่งข้อมูลรถหรือประวัติการเติมน้ำมันออกจากอุปกรณ์ของคุณ</p>
            <ul>
              <li>ไม่มีบัญชีผู้ใช้หรือระบบล็อกอิน</li>
              <li>ไม่มีโฆษณาและการติดตาม</li>
              <li>ใช้งานได้แม้ไม่มีอินเทอร์เน็ต</li>
            </ul>
            <div className="privacy-status">
              <span />
              {offlineReady ? 'พร้อมใช้งานออฟไลน์' : 'เปิดออนไลน์ครั้งแรกเพื่อเตรียมออฟไลน์'}
            </div>
          </section>
          <section className="card settings-section install-guide">
            <Smartphone size={25} />
            <h2>ติดตั้ง FillUp บน iPhone</h2>
            <p>เปิดเว็บไซต์นี้ใน Safari แล้วทำตามนี้</p>
            <ol>
              <li>กดปุ่ม Share (แชร์)</li>
              <li>เลือก “เพิ่มไปยังหน้าจอโฮม”</li>
              <li>กด “เพิ่ม” แล้วเปิด FillUp จากหน้าจอโฮม</li>
            </ol>
            <span className="field-hint">ไม่ต้องใช้ App Store หรือบัญชีนักพัฒนา Apple</span>
          </section>
          <div className="about-line">
            <Fuel size={18} />
            <strong>FillUp</strong>
            <span>เวอร์ชัน 1.0.0 · ทำให้ทุกถังคุ้มค่า</span>
          </div>
        </div>
      </div>
      <p className="storage-note">
        ข้อมูลอยู่ในเบราว์เซอร์ของอุปกรณ์นี้ การล้างข้อมูลเว็บไซต์ ใช้โหมดส่วนตัว
        หรือเปลี่ยนอุปกรณ์อาจทำให้ไม่พบข้อมูลเดิม กรุณาสำรองไฟล์ JSON เป็นระยะ ไฟล์สำรองมีข้อมูลรถของคุณ
        ควรเก็บไว้ในที่ปลอดภัย
      </p>
    </>
  )
}
