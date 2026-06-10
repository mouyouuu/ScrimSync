'use client'

import { useState } from 'react'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { APP_CONFIG } from '@/config/app'
import { formatDayLong, formatHour } from '@/lib/dates'
import { validateScrimForm } from '@/lib/validations'
import { ScrimFormData, Scrim, ScrimStatus } from '@/types'

interface ScrimFormProps {
  weekStart: string
  initialDay?: number
  initialHour?: number
  initialData?: Scrim
  onSubmit: (data: ScrimFormData) => Promise<void>
  onCancel: () => void
}

const STATUS_OPTIONS: { value: ScrimStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'pending',   label: 'En attente' },
  { value: 'cancelled', label: 'Annulé' },
]

export function ScrimForm({ weekStart, initialDay, initialHour, initialData, onSubmit, onCancel }: ScrimFormProps) {
  const [form, setForm] = useState<ScrimFormData>({
    week_start: weekStart,
    day_of_week: initialData?.day_of_week ?? initialDay ?? 1,
    start_hour: initialData?.start_hour ?? initialHour ?? 19,
    opponent_name: initialData?.opponent_name ?? '',
    opponent_opgg_url: initialData?.opponent_opgg_url ?? '',
    notes: initialData?.notes ?? '',
    status: initialData?.status ?? 'confirmed',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const dayOptions = APP_CONFIG.daysOfWeek.map(d => ({ value: d, label: formatDayLong(d) }))
  const hourOptions = APP_CONFIG.availableHours.map(h => ({ value: h, label: formatHour(h) }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateScrimForm(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try { await onSubmit(form) } finally { setLoading(false) }
  }

  function set(field: keyof ScrimFormData, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select label="Jour" options={dayOptions} value={form.day_of_week} onChange={e => set('day_of_week', Number(e.target.value))} error={errors.day_of_week} />
        <Select label="Heure de début" options={hourOptions} value={form.start_hour} onChange={e => set('start_hour', Number(e.target.value))} error={errors.start_hour} />
      </div>

      <Input
        label="Adversaire"
        placeholder="Nom de l'équipe adverse"
        value={form.opponent_name}
        onChange={e => set('opponent_name', e.target.value)}
        error={errors.opponent_name}
        autoFocus
      />

      <Input
        label="Lien OP.GG"
        placeholder="https://www.op.gg/multisearch/..."
        value={form.opponent_opgg_url}
        onChange={e => set('opponent_opgg_url', e.target.value)}
        error={errors.opponent_opgg_url}
        type="url"
        inputMode="url"
      />

      {/* Statut */}
      <div>
        <p className="text-xs font-medium text-text-secondary mb-2">Statut</p>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('status', opt.value)}
              className={[
                'flex-1 py-2 rounded-lg border text-xs font-medium transition-all duration-150',
                form.status === opt.value
                  ? opt.value === 'confirmed' ? 'bg-success/15 border-success/40 text-success'
                    : opt.value === 'pending' ? 'bg-warning/15 border-warning/40 text-warning'
                    : 'bg-danger/15 border-danger/40 text-danger'
                  : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-border',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="Notes (optionnel)"
        placeholder="Informations supplémentaires..."
        value={form.notes}
        onChange={e => set('notes', e.target.value)}
        rows={3}
      />

      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1 whitespace-nowrap">
          {initialData ? 'Enregistrer' : 'Confirmer le scrim'}
        </Button>
      </div>
    </form>
  )
}
