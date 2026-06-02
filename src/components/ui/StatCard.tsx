import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  trend?: '+' | '-'
  className?: string
}

export default function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div className="rounded-2xl p-5 transition-all hover:shadow-md" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(91,140,107,0.1)' }}>
          <Icon className="w-5 h-5" style={{ color: '#5B8C6B' }} />
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
            style={trend === '+'
              ? { color: '#4A7559', background: 'rgba(91,140,107,0.1)' }
              : { color: '#c0392b', background: 'rgba(220,60,60,0.08)' }
            }
          >
            {trend === '+' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: '#2D2926' }}>{value}</div>
      <div className="text-sm" style={{ color: '#A89E98' }}>{label}</div>
    </div>
  )
}
