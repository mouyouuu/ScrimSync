import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    if (!label) {
      return (
        <div className="flex flex-col gap-1.5">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'h-11 w-full rounded-xl border bg-white/[0.04] px-3.5 text-sm text-text-primary',
              'transition-colors duration-150 outline-none appearance-none cursor-pointer',
              'focus:border-accent focus:ring-1 focus:ring-accent/20',
              error ? 'border-danger/50 focus:border-danger focus:ring-danger/20' : 'border-white/[0.08] hover:border-white/[0.14]',
              className
            )}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          {/* Label toujours flottant pour un select (valeur toujours présente) */}
          <label
            htmlFor={inputId}
            className="pointer-events-none absolute left-3.5 top-2.5 text-[10px] font-semibold text-text-muted"
          >
            {label}
          </label>
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'h-14 w-full rounded-xl border bg-white/[0.04] px-3.5 pt-5 pb-2 text-sm text-text-primary',
              'transition-colors duration-150 outline-none appearance-none cursor-pointer',
              'focus:border-accent focus:ring-1 focus:ring-accent/20',
              error ? 'border-danger/50 focus:border-danger focus:ring-danger/20' : 'border-white/[0.08] hover:border-white/[0.14]',
              className
            )}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {/* Chevron */}
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
