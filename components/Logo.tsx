import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'icon' | 'full'
  className?: string
}

const sizes = {
  sm: { px: 28,  text: 'text-base',  tracking: '-0.03em' },
  md: { px: 36,  text: 'text-xl',    tracking: '-0.03em' },
  lg: { px: 48,  text: 'text-2xl',   tracking: '-0.035em' },
  xl: { px: 64,  text: 'text-3xl',   tracking: '-0.04em' },
}

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <Image
        src="/icons/icon-192.png"
        alt="ScrimSync"
        width={s.px}
        height={s.px}
        className="flex-shrink-0 rounded-xl"
        priority
      />
      {variant === 'full' && (
        <span
          className={`${s.text} font-semibold text-text-primary`}
          style={{ letterSpacing: s.tracking }}
        >
          ScrimSync
        </span>
      )}
    </div>
  )
}
