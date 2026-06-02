import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export default function Card({ children, header, footer, className }: CardProps) {
  return (
    <div className={clsx('bg-stone-800 rounded-xl border border-stone-700', className)}>
      {header && (
        <div className="px-6 py-4 border-b border-stone-700">
          {header}
        </div>
      )}
      <div className="px-6 py-5">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-stone-700">
          {footer}
        </div>
      )}
    </div>
  )
}
