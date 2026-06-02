import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export default function Card({ children, header, footer, className }: CardProps) {
  return (
    <div className={clsx('bg-slate-800 rounded-xl border border-slate-700', className)}>
      {header && (
        <div className="px-6 py-4 border-b border-slate-700">
          {header}
        </div>
      )}
      <div className="px-6 py-5">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-700">
          {footer}
        </div>
      )}
    </div>
  )
}
