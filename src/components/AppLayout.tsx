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
interface NavigationProps {
  page: Page
  navigate: (page: Page) => void
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
        <span className="brand-mark">
          <Fuel size={25} />
        </span>
        <span>
          FillUp<span className="brand-dot">.</span>
        </span>
      </a>
      <div className="sidebar-caption">ทุกถังมีความหมาย</div>
      <nav aria-label="เมนูหลัก">
        {navigation.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? 'active' : ''}
            onClick={() => navigate(item.id)}
            aria-current={page === item.id ? 'page' : undefined}
          >
            <item.icon size={21} />
            <span>{item.label}</span>
            {page === item.id && <span className="nav-dot" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="local-note">
          <ShieldCheck size={20} />
          <span>
            ส่วนตัว ปลอดภัย
            <br />
            <small>ข้อมูลอยู่กับคุณเสมอ</small>
          </span>
        </div>
        <span className="version">FILLUP / VERSION 1.0</span>
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
        <span className="brand-mark">
          <Fuel size={20} />
        </span>
        FillUp<span className="brand-dot">.</span>
      </div>
      <div className="breadcrumb">
        พื้นที่ของคุณ <span>/</span> <strong>{navigation.find((item) => item.id === page)?.label}</strong>
      </div>
      <div className="topbar-right">
        <span className={`connection ${!online ? 'offline' : ''}`}>
          {online ? <span className="status-dot" /> : <WifiOff size={14} />}
          <span>{!online ? 'ออฟไลน์' : offlineReady ? 'พร้อมใช้ออฟไลน์' : 'เก็บข้อมูลในเครื่อง'}</span>
        </span>
        {active && (
          <label className="vehicle-selector">
            <span className="selector-icon">
              <CarFront size={18} />
            </span>
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
            <ChevronDown size={15} />
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
          <item.icon size={22} strokeWidth={page === item.id ? 2.3 : 1.8} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
export function PageFooter() {
  return (
    <footer className="page-footer">
      <span>FillUp — ทำให้ทุกถังคุ้มค่า</span>
      <span>
        <ShieldCheck size={13} /> สร้างมาเพื่อความเป็นส่วนตัว
      </span>
    </footer>
  )
}
