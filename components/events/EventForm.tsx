'use client'

import { useState } from 'react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TeamEventFormData, EventType } from '@/types'

interface EventFormProps {
  onSubmit: (data: TeamEventFormData) => Promise<void>
  onCancel: () => void
}

const TYPE_OPTIONS: { value: EventType; label: string; colors: string; activeColors: string }[] = [
  { value: 'match',      label: 'Match',   colors: 'text-text-muted border-border-subtle bg-bg-elevated', activeColors: 'text-accent   border-accent/40   bg-accent/10'   },
  { value: 'tournament', label: 'Tournoi', colors: 'text-text-muted border-border-subtle bg-bg-elevated', activeColors: 'text-warning  border-warning/40  bg-warning/10'  },
]

export function EventForm({ onSubmit, onCancel }: EventFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<TeamEventFormData>({
    type: 'match',
    title: '',
    event_date: today,
    event_time: '19:00',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function set(field: keyof TeamEventFormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.title.trim())    errs.title      = 'Le titre est requis'
    if (!form.event_date)      errs.event_date = 'La date est requise'
    if (!form.event_time)      errs.event_time = "L'heure est requise"
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try { await onSubmit(form) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Type */}
      <div>
        <p className="text-sm font-medium text-text-secondary mb-2.5">Type</p>
        <div className="flex gap-2">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('type', opt.value)}
              className={[
                'flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 active:scale-[0.97]',
                form.type === opt.value ? opt.activeColors : opt.colors,
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Titre */}
      <Input
        label={form.type === 'tournament' ? 'Nom du tournoi' : 'Adversaire'}
        value={form.title}
        onChange={e => set('title', e.target.value)}
        error={errors.title}
      />

      {/* Date + Heure */}
      <div className="flex gap-3">
        <div className="flex-[3] min-w-0">
          <label className="text-xs font-medium text-text-secondary block mb-1.5">Date</label>
          <input
            type="date"
            value={form.event_date}
            onChange={e => set('event_date', e.target.value)}
            className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
          {errors.event_date && <p className="text-xs text-danger mt-1">{errors.event_date}</p>}
        </div>
        <div className="flex-[2] min-w-0">
          <label className="text-xs font-medium text-text-secondary block mb-1.5">Heure</label>
          <input
            type="time"
            value={form.event_time}
            onChange={e => set('event_time', e.target.value)}
            className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
          {errors.event_time && <p className="text-xs text-danger mt-1">{errors.event_time}</p>}
        </div>
      </div>

      {/* Description */}
      <Textarea
        label="Description (optionnel)"
        value={form.description}
        onChange={e => set('description', e.target.value)}
        rows={2}
      />

      <div className="pt-1 space-y-2">
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Ajouter l&apos;événement
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-3 text-sm font-medium text-text-muted hover:text-text-secondary transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
