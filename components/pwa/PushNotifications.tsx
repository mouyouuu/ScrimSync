'use client'

import { useEffect, useState } from 'react'

export function PushNotifications({ playerId }: { playerId?: string }) {
  const [status, setStatus] = useState<'idle' | 'asking' | 'done' | 'denied'>('idle')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'granted') { subscribe(); return }
    if (Notification.permission === 'denied') { setStatus('denied'); return }
    setStatus('asking')
  }, [])

  async function subscribe() {
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
      setStatus('done')
    } catch {
      // permission denied or error
    }
  }

  async function handleAllow() {
    setStatus('idle')
    const permission = await Notification.requestPermission()
    if (permission === 'granted') await subscribe()
    else setStatus('denied')
  }

  if (status !== 'asking') return null

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 flex items-start gap-3">
      <span className="text-xl flex-shrink-0">🔔</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">Activer les notifications</p>
        <p className="text-xs text-text-muted mt-0.5">Reçois une alerte quand un scrim est créé.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAllow}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            Activer
          </button>
          <button
            onClick={() => setStatus('idle')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-primary transition-colors"
          >
            Plus tard
          </button>
        </div>
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
