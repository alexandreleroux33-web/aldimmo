'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Home } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/#services', label: 'Services' },
    { href: '/#comment', label: 'Comment ça marche' },
    { href: '/contact', label: 'Contact' },
  ]

  const isScrolled = scrolled || isOpen

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: isScrolled ? 'rgba(250,248,245,0.97)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(45,41,38,0.08)' : '1px solid transparent',
        boxShadow: isScrolled ? '0 1px 20px rgba(45,41,38,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: '#5B8C6B' }}
            >
              <Home className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-bold text-xl transition-colors"
              style={{ color: '#2D2926' }}
            >
              ALD Immo
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors"
                style={{ color: '#5C524C' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#2D2926')}
                onMouseLeave={e => (e.currentTarget.style.color = '#5C524C')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium transition-colors"
              style={{ color: '#5C524C' }}
            >
              Connexion
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#5B8C6B' }}
            >
              Espace propriétaire
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#5C524C' }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className="md:hidden px-4 py-4 space-y-1"
          style={{ background: 'rgba(250,248,245,0.98)', borderTop: '1px solid rgba(45,41,38,0.08)' }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2.5 text-sm font-medium"
              style={{ color: '#5C524C' }}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t" style={{ borderColor: 'rgba(45,41,38,0.08)' }}>
            <Link
              href="/login"
              className="block w-full text-center text-white text-sm font-semibold px-4 py-2.5 rounded-xl mt-2"
              style={{ background: '#5B8C6B' }}
              onClick={() => setIsOpen(false)}
            >
              Espace propriétaire
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
