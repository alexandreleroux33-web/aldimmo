'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl`}
        style={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}
        >
          {title && <h2 className="text-lg font-semibold" style={{ color: '#2D2926' }}>{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ color: '#A89E98' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,41,38,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
