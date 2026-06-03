'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Users, Building2, CalendarDays, Euro,
  LogOut, Menu, X, LayoutDashboard, ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import clsx from 'clsx'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/calendrier', label: 'Calendrier', icon: CalendarDays },
  { href: '/admin/proprietaires', label: 'Propriétaires', icon: Users },
  { href: '/admin/biens', label: 'Biens', icon: Building2 },
  { href: '/admin/reservations', label: 'Réservations', icon: CalendarDays },
  { href: '/admin/revenus', label: 'Revenus', icon: Euro },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const Sidebar = () => (
    <div className="flex flex-col h-full" style={{ background: '#FAF8F5' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#5B8C6B' }}>
          <Home className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base leading-tight" style={{ color: '#2D2926' }}>ALD Immo</div>
          <div className="text-xs" style={{ color: '#A89E98' }}>Back-office</div>
        </div>
        <span
          className="flex-shrink-0 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(185,28,28,0.08)', color: '#b91c1c', border: '1px solid rgba(185,28,28,0.2)' }}
        >
          <ShieldCheck className="w-3 h-3" />
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={active
                ? { background: '#5B8C6B', color: 'white' }
                : { color: '#7A6E68' }
              }
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(91,140,107,0.08)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(45,41,38,0.08)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: '#A89E98' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,60,60,0.06)'; e.currentTarget.style.color = '#c0392b' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A89E98' }}
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: '#FAF8F5' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 fixed h-full z-30"
        style={{ background: '#FAF8F5', borderRight: '1px solid rgba(45,41,38,0.08)' }}
      >
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={clsx(
          'lg:hidden fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: '#FAF8F5', borderRight: '1px solid rgba(45,41,38,0.08)' }}
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setSidebarOpen(false)} style={{ color: '#A89E98' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen" style={{ background: '#FAF8F5' }}>
        <header
          className="lg:hidden flex items-center justify-between px-4 h-14 sticky top-0 z-20"
          style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(45,41,38,0.08)' }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ color: '#7A6E68' }}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold" style={{ color: '#2D2926' }}>Admin ALD Immo</span>
          <div className="w-5" />
        </header>
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
