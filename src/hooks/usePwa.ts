import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePwa() {
  const [online, setOnline] = useState(navigator.onLine)
  const [cached, setCached] = useState(false)
  const [swError, setSwError] = useState(false)
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({ onRegisterError: () => setSwError(true) })
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    if ('serviceWorker' in navigator)
      void navigator.serviceWorker.ready
        .then((registration) => setCached(!!registration.active))
        .catch(() => setSwError(true))
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  return { online, offlineReady: offlineReady || cached, needRefresh, updateServiceWorker, swError }
}
