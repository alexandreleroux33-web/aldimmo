import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ALD Immo - Conciergerie immobilière Bassin d\'Arcachon',
  description: 'ALD Immo, votre conciergerie immobilière de confiance sur le Bassin d\'Arcachon. Gestion locative, conciergerie premium et optimisation de vos revenus à Gujan-Mestras.',
  keywords: 'conciergerie immobilière, Bassin d\'Arcachon, Gujan-Mestras, gestion locative, location saisonnière',
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
