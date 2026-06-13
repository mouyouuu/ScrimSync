import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ' +
      'disabled:opacity-40 disabled:pointer-events-none select-none tracking-snug active:scale-[0.97]'

    const variants = {
      primary:
        'bg-accent text-white hover:bg-accent-hover shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_4px_16px_rgba(108,92,231,0.25)]',
      secondary:
        'bg-white/[0.06] hover:bg-white/[0.10] text-text-primary border border-white/[0.09]',
      ghost:
        'hover:bg-white/[0.06] text-text-secondary hover:text-text-primary',
      danger:
        'bg-danger/10 hover:bg-danger/15 text-danger border border-danger/20',
      success:
        'bg-success/10 hover:bg-success/15 text-success border border-success/20',
    }

    const sizes = {
      sm: 'h-9 px-3.5 text-xs gap-1.5',
      md: 'h-11 px-5 text-sm gap-2',
      lg: 'h-[52px] px-7 text-base gap-2.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
