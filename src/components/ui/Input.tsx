import clsx from 'clsx'
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseClass = 'w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-stone-300 mb-1.5">{label}</label>}
      <input {...props} className={clsx(baseClass, error && 'border-red-500', className)} />
      {error && <p className="mt-1 text-red-400 text-sm">{error}</p>}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: React.ReactNode
}

export function Select({ label, error, children, className, ...props }: SelectProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-stone-300 mb-1.5">{label}</label>}
      <select {...props} className={clsx(baseClass, 'bg-stone-700', error && 'border-red-500', className)}>
        {children}
      </select>
      {error && <p className="mt-1 text-red-400 text-sm">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-stone-300 mb-1.5">{label}</label>}
      <textarea {...props} className={clsx(baseClass, 'resize-none', error && 'border-red-500', className)} />
      {error && <p className="mt-1 text-red-400 text-sm">{error}</p>}
    </div>
  )
}
