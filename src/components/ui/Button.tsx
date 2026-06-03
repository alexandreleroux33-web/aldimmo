import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: React.ReactNode
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary: { background: '#5B8C6B', color: 'white' },
  secondary: { background: 'white', color: '#7A6E68', border: '1px solid rgba(45,41,38,0.12)' },
  ghost: { background: 'transparent', color: '#7A6E68' },
  danger: { background: 'rgba(185,28,28,0.06)', color: '#b91c1c', border: '1px solid rgba(185,28,28,0.15)' },
}

export default function Button({ variant = 'primary', children, className, disabled, style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{ ...VARIANT_STYLES[variant], ...style }}
      className={clsx(
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  )
}
