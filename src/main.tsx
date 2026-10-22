import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@fontsource/bai-jamjuree/500.css'
import '@fontsource/bai-jamjuree/600.css'
import '@fontsource/bai-jamjuree/700.css'
import '@fontsource/ibm-plex-sans-thai/400.css'
import '@fontsource/ibm-plex-sans-thai/500.css'
import '@fontsource/ibm-plex-sans-thai/600.css'
import './styles/app.css'

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed)
      return (
        <div className="loading-screen">
          <h1>เปิด FillUp ไม่สำเร็จ</h1>
          <p>กรุณาเปิดแอปใหม่ ข้อมูลที่บันทึกไว้จะไม่ถูกลบ</p>
          <button className="button primary" onClick={() => window.location.reload()}>
            เปิดใหม่
          </button>
        </div>
      )
    return this.props.children
  }
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
