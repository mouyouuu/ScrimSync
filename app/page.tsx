import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
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

          <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 text-left">
            <p className="text-xs text-text-muted mb-3 font-medium uppercase tracking-wide">
              Accès joueur
            </p>
            <p className="text-sm text-text-secondary">
              Utilisez votre lien personnel envoyé par l'admin.
            </p>
            <div className="mt-2 rounded-lg bg-bg-elevated px-3 py-2 font-mono text-xs text-text-muted">
              /player/votre-token
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs text-text-disabled">
          ScrimSync · Esport Team Scheduler
        </p>
      </div>
    </div>
  )
}
