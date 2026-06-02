'use client'

import dynamic from 'next/dynamic'

const MapBordeaux = dynamic(() => import('./MapBordeaux'), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-2xl flex items-center justify-center"
      style={{ height: 280, background: '#F0EBE3', border: '1px solid rgba(45,41,38,0.1)' }}
    >
      <div className="text-sm" style={{ color: '#A89E98' }}>Chargement de la carte…</div>
    </div>
  ),
})

export default function MapBordeauxWrapper() {
  return <MapBordeaux />
}
