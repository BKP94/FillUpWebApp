import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { X, TriangleAlert } from 'lucide-react'
import { errorMessage } from '../hooks/useAppData'

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement as HTMLElement | null
    dialog?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="modal-header">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="ปิด">
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  )
}

export interface Confirmation {
  title: string
  description: string
  action: () => Promise<void>
  label?: string
  danger?: boolean
}
export function ConfirmDialog({
  confirmation,
  onClose,
}: {
  confirmation: Confirmation
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const confirm = async () => {
    setBusy(true)
    try {
      await confirmation.action()
      onClose()
    } catch (error) {
      setError(errorMessage(error))
      setBusy(false)
    }
  }
  return (
    <Modal
      title={confirmation.title}
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <div className="modal-body">
        <div className="warning-symbol">
          <TriangleAlert />
        </div>
        <p className="confirmation-copy">{confirmation.description}</p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="modal-footer">
        <button className="button secondary" disabled={busy} onClick={onClose}>
          ยกเลิก
        </button>
        <button
          className={`button ${confirmation.danger === false ? 'primary' : 'danger'}`}
          disabled={busy}
          onClick={() => {
            void confirm()
          }}
        >
          {busy ? 'กำลังดำเนินการ…' : (confirmation.label ?? 'ยืนยันการลบ')}
        </button>
      </div>
    </Modal>
  )
}
