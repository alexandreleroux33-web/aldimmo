import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  trend?: '+' | '-'
  className?: string
}

export default function StatCard({ icon: Icon, label, value, trend, className }: StatCardProps) {
  return (
    <div className={clsx('stat-card', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-400" />
        </div>
        {trend && (
          <div className={clsx(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            trend === '+' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
          )}>
            {trend === '+' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-stone-400 text-sm">{label}</div>
    </div>
  )
}
