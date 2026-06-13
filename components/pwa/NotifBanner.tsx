'use client'

import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'notif_banner_dismissed'

export function NotifBanner({ playerId }: { playerId?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission !== 'default') return
    if (localStorage.getItem(DISMISSED_KEY)) return
    setVisible(true)
  }, [])

  async function handleAllow() {
    setVisible(false)
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), player_id: playerId }),
      })
    } catch {
      // silently fail
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="sticky z-[9] border-b border-accent/20"
      style={{
        top: 'calc(env(safe-area-inset-top) + 56px)',
        background: 'rgba(108,92,231,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-accent flex-shrink-0">
          <path d="M10 2a6 6 0 016 6v2.5l1.5 2.5H2.5L4 10.5V8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M8.5 16.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="flex-1 text-xs text-text-secondary leading-snug">
          Active les notifications pour être alerté lors des scrims.
        </p>
        <button
          onClick={handleAllow}
          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover active:scale-[0.97] transition-all"
        >
          Activer
        </button>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-text-muted hover:text-text-secondary transition-colors rounded-md hover:bg-white/[0.06]"
          aria-label="Fermer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}
