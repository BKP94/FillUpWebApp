import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, Fuel, LoaderCircle, ShieldCheck, Smartphone, X } from 'lucide-react'
import { useAppData, errorMessage } from './hooks/useAppData'
import { usePwa } from './hooks/usePwa'
import { repository } from './db/repository'
import type { FuelRecord, Vehicle } from './models'
import { emptyData } from './services/backup'
import { statistics } from './services/calculations'
import { Modal, ConfirmDialog, type Confirmation } from './components/Modal'
import { VehicleForm } from './components/VehicleForm'
import { FuelForm } from './components/FuelForm'
import { RecordDetail } from './components/RecordDetail'
import { Dashboard } from './pages/Dashboard'
import { History } from './pages/History'
import { Statistics } from './pages/Statistics'
import { Vehicles } from './pages/Vehicles'
import { Settings } from './pages/Settings'
import { Onboarding } from './pages/Onboarding'
import { Sidebar, Topbar, BottomNav, PageFooter, type Page } from './components/AppLayout'

type Editor =
  | { type: 'vehicle'; vehicle?: Vehicle }
  | { type: 'fuel'; vehicleId: string; record?: FuelRecord }
  | { type: 'detail'; record: FuelRecord }
  | null

export default function App() {
  const { data, loading, error, refresh, mutate } = useAppData()
  const [page, setPage] = useState<Page>('dashboard')
  const [editor, setEditor] = useState<Editor>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [toast, setToast] = useState('')
  const [actionError, setActionError] = useState('')
  const main = useRef<HTMLElement>(null)
  const pwa = usePwa()
  const active =
    data.vehicles.find((vehicle) => vehicle.id === data.settings.activeVehicleId) ?? data.vehicles[0]
  const records = data.records.filter((record) => record.vehicleId === active?.id)
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone
  const isIOS =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      document.documentElement.dataset.theme =
        data.settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : data.settings.theme
    }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [data.settings.theme])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 4500)
    return () => window.clearTimeout(timer)
  }, [toast])
  const navigate = (next: Page) => {
    setPage(next)
    window.scrollTo({ top: 0 })
    main.current?.focus()
  }
  const run = async (action: () => Promise<void>, message?: string) => {
    try {
      await mutate(action)
      if (message) setToast(message)
    } catch (error) {
      setActionError(errorMessage(error))
    }
  }
  const addFuel = () => {
    if (active) setEditor({ type: 'fuel', vehicleId: active.id })
  }
  const saveVehicle = async (vehicle: Vehicle) => {
    await mutate(() =>
      repository.saveVehicle(vehicle, editor?.type === 'vehicle' ? editor.vehicle?.updatedAt : undefined),
    )
    setEditor(null)
    if (!active) navigate('dashboard')
    setToast('บันทึกข้อมูลรถแล้ว')
  }
  const removeVehicle = (vehicle: Vehicle) =>
    setConfirmation({
      title: `ลบ ${vehicle.name}?`,
      description: `ประวัติการเติมน้ำมันทั้งหมด ${data.records.filter((record) => record.vehicleId === vehicle.id).length} รายการของรถคันนี้จะถูกลบด้วย ไม่สามารถย้อนกลับได้`,
      action: async () => {
        await mutate(() => repository.deleteVehicle(vehicle.id))
        setToast('ลบรถและประวัติแล้ว')
      },
    })
  const removeRecord = (record: FuelRecord) => {
    setEditor(null)
    setConfirmation({
      title: 'ลบรายการเติมน้ำมัน?',
      description: 'รายการนี้จะถูกลบถาวร และอัตราสิ้นเปลืองของรายการถัดไปจะคำนวณใหม่',
      action: async () => {
        await mutate(() => repository.deleteRecord(record.id, record.updatedAt))
        setToast('ลบรายการแล้ว')
      },
    })
  }
  const detailRecord =
    editor?.type === 'detail' ? data.records.find((record) => record.id === editor.record.id) : undefined
  const editorVehicle =
    editor?.type === 'fuel' ? data.vehicles.find((vehicle) => vehicle.id === editor.vehicleId) : undefined

  if (loading)
    return (
      <div className="loading-screen">
        <span className="brand-mark">
          <Fuel />
        </span>
        <h1>FillUp</h1>
        <LoaderCircle className="spin" />
        <p>กำลังเปิดสมุดบันทึกของคุณ…</p>
      </div>
    )
  if (error)
    return (
      <div className="loading-screen">
        <ShieldCheck size={40} />
        <h1>เปิดข้อมูลไม่สำเร็จ</h1>
        <p className="error">{error}</p>
        <p>ตรวจสอบสิทธิ์จัดเก็บข้อมูลของเบราว์เซอร์ แล้วลองอีกครั้ง ข้อมูลเดิมจะไม่ถูกลบ</p>
        <button
          className="button primary"
          onClick={() => {
            void refresh()
          }}
        >
          ลองอีกครั้ง
        </button>
      </div>
    )
  return (
    <div className={`app-shell ${!active ? 'first-run' : ''}`}>
      <a className="skip-link" href="#main-content">
        ข้ามไปยังเนื้อหา
      </a>
      <Sidebar page={page} navigate={navigate} />
      <div className="workspace">
        <Topbar
          page={page}
          active={active}
          vehicles={data.vehicles}
          online={pwa.online}
          offlineReady={pwa.offlineReady}
          selectVehicle={(id) => {
            void run(() => repository.updateSettings({ activeVehicleId: id }))
          }}
        />
        <main id="main-content" ref={main} tabIndex={-1}>
          {actionError && (
            <div className="error error-banner" role="alert">
              {actionError}
              <button
                className="icon-button"
                onClick={() => setActionError('')}
                aria-label="ปิดข้อความผิดพลาด"
              >
                <X size={18} />
              </button>
            </div>
          )}
          {pwa.swError && (
            <p className="warning">
              ยังเตรียมการใช้งานออฟไลน์ไม่สำเร็จ กรุณาเปิดผ่าน HTTPS และเชื่อมต่ออินเทอร์เน็ตแล้วลองเปิดใหม่
            </p>
          )}
          {pwa.needRefresh && !editor && (
            <div className="update-banner">
              <span>มี FillUp เวอร์ชันใหม่พร้อมแล้ว</span>
              <button
                className="text-button"
                onClick={() => {
                  void pwa.updateServiceWorker(true).catch((error) => setActionError(errorMessage(error)))
                }}
              >
                อัปเดตตอนนี้ <ArrowUpRight size={17} />
              </button>
            </div>
          )}
          {!active && page !== 'settings' ? (
            <Onboarding saveVehicle={saveVehicle} onRestore={() => navigate('settings')} />
          ) : (
            <>
              {active && page === 'dashboard' && (
                <Dashboard
                  vehicle={active}
                  records={records}
                  addFuel={addFuel}
                  openRecord={(record) => setEditor({ type: 'detail', record })}
                  navigate={navigate}
                />
              )}
              {active && page === 'history' && (
                <History
                  key={active.id}
                  records={records}
                  addFuel={addFuel}
                  openRecord={(record) => setEditor({ type: 'detail', record })}
                />
              )}
              {active && page === 'statistics' && <Statistics records={records} />}
              {page === 'vehicles' && (
                <Vehicles
                  vehicles={data.vehicles}
                  records={data.records}
                  activeId={active?.id}
                  add={() => setEditor({ type: 'vehicle' })}
                  edit={(vehicle) => setEditor({ type: 'vehicle', vehicle })}
                  remove={removeVehicle}
                  select={(id) => {
                    void run(
                      () => repository.updateSettings({ activeVehicleId: id }),
                      'เปลี่ยนรถที่ใช้งานแล้ว',
                    )
                  }}
                />
              )}
              {page === 'settings' && (
                <Settings
                  data={data}
                  offlineReady={pwa.offlineReady}
                  updateSettings={(patch) => {
                    void run(() => repository.updateSettings(patch))
                  }}
                  restore={(next) => mutate(() => repository.replaceAll(next))}
                  clear={async () => {
                    await mutate(() => repository.replaceAll(emptyData()))
                    navigate('dashboard')
                  }}
                  confirm={setConfirmation}
                  notify={setToast}
                />
              )}
            </>
          )}
          {isIOS && isSafari && !standalone && !data.settings.dismissedInstallHint && (
            <div className="install-hint">
              <Smartphone size={26} />
              <div>
                <strong>ติดตั้ง FillUp บน iPhone</strong>
                <p>กด Share → “เพิ่มไปยังหน้าจอโฮม” → “เพิ่ม”</p>
              </div>
              <button
                className="icon-button"
                aria-label="ไม่แสดงคำแนะนำอีก"
                onClick={() => {
                  void run(() => repository.updateSettings({ dismissedInstallHint: true }))
                }}
              >
                <X size={19} />
              </button>
            </div>
          )}
        </main>
        <PageFooter />
      </div>
      <BottomNav page={page} navigate={navigate} />
      {editor?.type === 'vehicle' && (
        <Modal title={editor.vehicle ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถของคุณ'} onClose={() => setEditor(null)}>
          <VehicleForm vehicle={editor.vehicle} onSave={saveVehicle} />
        </Modal>
      )}
      {editor?.type === 'fuel' && (
        <Modal title={editor.record ? 'แก้ไขการเติมน้ำมัน' : 'เติมน้ำมัน'} onClose={() => setEditor(null)}>
          {editorVehicle ? (
            <FuelForm
              vehicle={editorVehicle}
              records={data.records.filter((record) => record.vehicleId === editorVehicle.id)}
              record={editor.record}
              onSave={async (record) => {
                await mutate(() => repository.saveRecord(record, editor.record?.updatedAt))
                setEditor(null)
                setToast('บันทึกการเติมน้ำมันแล้ว')
              }}
            />
          ) : (
            <p className="modal-body">รถคันนี้ถูกลบจากอีกหน้าต่างแล้ว กรุณาปิดแบบฟอร์ม</p>
          )}
        </Modal>
      )}
      {editor?.type === 'detail' && (
        <Modal title="รายละเอียดการเติม" onClose={() => setEditor(null)}>
          {detailRecord ? (
            <RecordDetail
              record={detailRecord}
              economy={
                statistics(
                  data.records.filter((record) => record.vehicleId === detailRecord.vehicleId),
                ).intervals.find((item) => item.recordId === detailRecord.id)?.kmPerLiter
              }
              edit={() =>
                setEditor({ type: 'fuel', vehicleId: detailRecord.vehicleId, record: detailRecord })
              }
              remove={() => removeRecord(detailRecord)}
            />
          ) : (
            <p className="modal-body">รายการนี้ถูกลบจากอีกหน้าต่างแล้ว</p>
          )}
        </Modal>
      )}
      {confirmation && <ConfirmDialog confirmation={confirmation} onClose={() => setConfirmation(null)} />}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
