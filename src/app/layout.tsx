import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ALD Immo - Conciergerie immobilière Bordeaux',
  description: 'ALD Immo, votre conciergerie immobilière de confiance à Bordeaux et ses environs. Gestion locative, conciergerie premium et optimisation de vos revenus.',
  keywords: 'conciergerie immobilière, Bordeaux, gestion locative, location saisonnière, Gironde',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
