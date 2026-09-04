import { useCallback, useEffect, useRef, useState } from 'react'
import { repository } from '../db/repository'
import { emptyData } from '../services/backup'

export function errorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'QuotaExceededError')
    return 'พื้นที่จัดเก็บเต็ม กรุณาสำรองข้อมูลและเพิ่มพื้นที่ว่างก่อนลองอีกครั้ง'
  return error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง'
}
export function useAppData() {
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const sequence = useRef(0)
  const refresh = useCallback(async () => {
    const request = ++sequence.current
    try {
      const next = await repository.read()
      if (request === sequence.current) {
        setData(next)
        setError(null)
      }
    } catch (error) {
      if (request === sequence.current) setError(errorMessage(error))
    } finally {
      if (request === sequence.current) setLoading(false)
    }
  }, [])
  useEffect(() => {
    // refresh only sets state after an IndexedDB await; no synchronous state update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
    const changed = () => {
      void refresh()
    }
    window.addEventListener('fillup-changed', changed)
    window.addEventListener('focus', changed)
    return () => {
      window.removeEventListener('fillup-changed', changed)
      window.removeEventListener('focus', changed)
    }
  }, [refresh])
  const mutate = async (action: () => Promise<void>) => {
    await action()
    await refresh()
  }
  return { data, loading, error, refresh, mutate }
}
