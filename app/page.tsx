'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function HomePage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('player_token')
    if (token) { router.replace(`/player/${token}`); return }

    const isAdmin = document.cookie.split(';').some(c => c.trim().startsWith('admin_session=authenticated'))
    if (isAdmin) { router.replace('/admin'); return }

    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 pt-safe">
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-fade-in">
        <Logo size="lg" variant="icon" className="mb-6" />

        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">
          ScrimSync
        </h1>
        <p className="text-base text-text-secondary mb-10">
          Planifiez vos scrims sans friction.
        </p>

        <div className="w-full space-y-3">
          <Link
            href="/admin"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-accent hover:bg-accent-hover active:scale-[0.98] text-sm font-semibold text-white transition-all duration-150 shadow-sm"
          >
            Accéder à l'admin
          </Link>

          <Link
            href="/player"
            className="flex h-11 w-full items-center justify-center rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-elevated active:scale-[0.98] text-sm font-semibold text-text-primary transition-all duration-150"
          >
            Accès joueur
          </Link>
        </div>

        <p className="mt-10 text-xs text-text-disabled">
          ScrimSync · Esport Team Scheduler
        </p>
      </div>
    </div>
  )
}
