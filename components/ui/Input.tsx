import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, placeholder, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    if (!label) {
      return (
        <div className="flex flex-col gap-1.5">
          <input
            ref={ref}
            id={inputId}
            placeholder={placeholder}
            className={cn(
              'h-11 w-full rounded-xl border bg-white/[0.04] px-3.5 text-sm text-text-primary placeholder:text-text-muted',
              'transition-colors duration-150 outline-none',
              'focus:border-accent focus:ring-1 focus:ring-accent/20',
              error ? 'border-danger/50 focus:border-danger focus:ring-danger/20' : 'border-white/[0.08] hover:border-white/[0.14]',
              className
            )}
            {...props}
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            className={cn(
              'peer h-14 w-full rounded-xl border bg-white/[0.04] px-3.5 pt-5 pb-2 text-sm text-text-primary',
              'transition-colors duration-150 outline-none',
              'focus:border-accent focus:ring-1 focus:ring-accent/20',
              error ? 'border-danger/50 focus:border-danger focus:ring-danger/20' : 'border-white/[0.08] hover:border-white/[0.14]',
              className
            )}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              'pointer-events-none absolute left-3.5 text-text-muted transition-all duration-150',
              // état flottant (rempli ou focus) — valeurs par défaut
              'top-2.5 text-[10px] font-semibold',
              // état dans le champ (vide + pas focus)
              'peer-placeholder-shown:top-[17px] peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium',
              // retour au flottant au focus
              'peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:font-semibold',
              error ? 'peer-focus:text-danger' : 'peer-focus:text-accent',
            )}
          >
            {label}
          </label>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    if (!label) {
      return (
        <div className="flex flex-col gap-1.5">
          <textarea
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border bg-white/[0.04] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
              'transition-colors duration-150 outline-none resize-none',
              'focus:border-accent focus:ring-1 focus:ring-accent/20',
              error ? 'border-danger/50 focus:border-danger focus:ring-danger/20' : 'border-white/[0.08] hover:border-white/[0.14]',
              className
            )}
            {...props}
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <textarea
            ref={ref}
            id={inputId}
            placeholder=" "
            className={cn(
              'peer w-full rounded-xl border bg-white/[0.04] px-3.5 pt-7 pb-2.5 text-sm text-text-primary',
              'transition-colors duration-150 outline-none resize-none',
              'focus:border-accent focus:ring-1 focus:ring-accent/20',
              error ? 'border-danger/50 focus:border-danger focus:ring-danger/20' : 'border-white/[0.08] hover:border-white/[0.14]',
              className
            )}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              'pointer-events-none absolute left-3.5 text-text-muted transition-all duration-150',
              'top-2.5 text-[10px] font-semibold',
              'peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium',
              'peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:font-semibold',
              error ? 'peer-focus:text-danger' : 'peer-focus:text-accent',
            )}
          >
            {label}
          </label>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
