import {
  CarFront,
  ChartNoAxesCombined,
  ChevronDown,
  Fuel,
  History as HistoryIcon,
  House,
  Settings as SettingsIcon,
  ShieldCheck,
  WifiOff,
} from 'lucide-react'
import type { Vehicle } from '../models'
const navigation = [
  { id: 'dashboard', label: 'หน้าหลัก', icon: House },
  { id: 'history', label: 'ประวัติ', icon: HistoryIcon },
  { id: 'statistics', label: 'สถิติ', icon: ChartNoAxesCombined },
  { id: 'vehicles', label: 'รถของฉัน', icon: CarFront },
  { id: 'settings', label: 'ตั้งค่า', icon: SettingsIcon },
] as const
export type Page = (typeof navigation)[number]['id']
export const pageLabel = (page: Page) => navigation.find((item) => item.id === page)?.label ?? ''
interface NavigationProps {
  page: Page
  navigate: (page: Page) => void
}
function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <>
      <span className="brand-mark" aria-hidden="true">
        <Fuel size={size} strokeWidth={2.2} />
      </span>
      <span className="brand-word">
        FillUp<span className="brand-dot">.</span>
      </span>
    </>
  )
}
export function Sidebar({ page, navigate }: NavigationProps) {
  return (
    <aside className="sidebar">
      <a
        href="#"
        className="brand"
        onClick={(event) => {
          event.preventDefault()
          navigate('dashboard')
        }}
      >
        <Wordmark />
      </a>
      <nav aria-label="เมนูหลัก">
        {navigation.map((item, index) => (
          <button
            key={item.id}
            className={page === item.id ? 'active' : ''}
            onClick={() => navigate(item.id)}
            aria-current={page === item.id ? 'page' : undefined}
          >
            <span className="nav-index" aria-hidden="true">
              0{index + 1}
            </span>
            <item.icon size={19} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <ShieldCheck size={18} aria-hidden="true" />
        <span>
          ข้อมูลอยู่ในเครื่องนี้
          <small>ไม่มีบัญชี ไม่มีการติดตาม</small>
        </span>
      </div>
    </aside>
  )
}
export function Topbar({
  page,
  active,
  vehicles,
  online,
  offlineReady,
  selectVehicle,
}: {
  page: Page
  active?: Vehicle
  vehicles: Vehicle[]
  online: boolean
  offlineReady: boolean
  selectVehicle: (id: string) => void
}) {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <Wordmark size={17} />
      </div>
      <div className="topbar-title">{pageLabel(page)}</div>
      <div className="topbar-right">
        <span className={`connection ${!online ? 'offline' : ''}`}>
          {online ? <span className="status-dot" aria-hidden="true" /> : <WifiOff size={15} />}
          <span>{!online ? 'ออฟไลน์' : offlineReady ? 'พร้อมใช้ออฟไลน์' : 'เก็บข้อมูลในเครื่อง'}</span>
        </span>
        {active && (
          <label className="vehicle-selector">
            <CarFront size={18} aria-hidden="true" />
            <select
              aria-label="รถที่ใช้งาน"
              value={active.id}
              onChange={(event) => {
                selectVehicle(event.target.value)
              }}
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </label>
        )}
      </div>
    </header>
  )
}
export function BottomNav({ page, navigate }: NavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="เมนูมือถือ">
      {navigation.map((item) => (
        <button
          key={item.id}
          className={page === item.id ? 'active' : ''}
          onClick={() => navigate(item.id)}
          aria-current={page === item.id ? 'page' : undefined}
        >
          <item.icon size={22} strokeWidth={page === item.id ? 2.3 : 1.8} aria-hidden="true" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
export function PageFooter() {
  return (
    <footer className="page-footer">
      <span>FillUp 1.0 · ทำให้ทุกถังคุ้มค่า</span>
      <span>
        <ShieldCheck size={14} aria-hidden="true" /> สร้างมาเพื่อความเป็นส่วนตัว
      </span>
    </footer>
  )
}
