'use client'

import { useEffect, useRef } from 'react'

const ZONES = [
  { name: 'Bordeaux centre', lat: 44.8378, lng: -0.5792, primary: true },
  { name: 'Le Bouscat',      lat: 44.8636, lng: -0.5942, primary: false },
  { name: 'Caudéran',        lat: 44.8453, lng: -0.6142, primary: false },
  { name: 'Mérignac',        lat: 44.8378, lng: -0.6436, primary: false },
  { name: 'Bruges',          lat: 44.8886, lng: -0.6069, primary: false },
]

// SVG marker inline pour éviter le bug d'icône Leaflet avec webpack
function makeIcon(L: typeof import('leaflet'), primary: boolean) {
  const color = primary ? '#5B8C6B' : '#7DAF90'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/></filter>
      <path filter="url(#s)" d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 22 14 22S28 23.63 28 14C28 6.27 21.73 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="5.5" fill="white" opacity="0.9"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

export default function MapBordeaux() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Import dynamique pour éviter le SSR
    import('leaflet').then((L) => {
      const map = L.map(containerRef.current!, {
        center: [44.855, -0.605],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        doubleClickZoom: false,
      })

      mapRef.current = map

      // Tuiles CartoDB Positron — légères, neutres, s'accordent avec le design crème
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      // Attribution discrète en bas
      L.control.attribution({ position: 'bottomright', prefix: '' })
        .addAttribution('© <a href="https://carto.com" style="color:#A89E98;font-size:9px">CARTO</a>')
        .addTo(map)

      // Zoom en bas à droite
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Marqueurs
      ZONES.forEach(({ name, lat, lng, primary }) => {
        const marker = L.marker([lat, lng], { icon: makeIcon(L, primary) })
        marker.bindPopup(
          `<div style="font-family:system-ui;font-size:13px;font-weight:600;color:#2D2926;white-space:nowrap;padding:2px 4px">${name}</div>`,
          { closeButton: false, offset: [0, -4] }
        )
        marker.on('mouseover', () => marker.openPopup())
        marker.on('mouseout', () => marker.closePopup())
        marker.addTo(map)

        // Cercle de zone autour de chaque marqueur (sauf Bordeaux centre)
        if (!primary) {
          L.circle([lat, lng], {
            radius: 1200,
            color: '#5B8C6B',
            fillColor: '#5B8C6B',
            fillOpacity: 0.07,
            weight: 1,
            opacity: 0.3,
          }).addTo(map)
        }
      })

      // Overlay de couleur chaude sur la carte via CSS
      const pane = map.getPane('tilePane')
      if (pane) {
        pane.style.filter = 'sepia(15%) saturate(85%) brightness(1.02)'
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md" style={{ border: '1px solid rgba(45,41,38,0.1)' }}>
      {/* Légende */}
      <div
        className="absolute top-3 left-3 z-[1000] rounded-xl px-3 py-2 flex items-center gap-2"
        style={{ background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(8px)', border: '1px solid rgba(45,41,38,0.08)' }}
      >
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#5B8C6B' }} />
        <span className="text-xs font-medium" style={{ color: '#2D2926' }}>Zones d'intervention</span>
      </div>

      {/* Conteneur Leaflet */}
      <div ref={containerRef} style={{ height: '280px', width: '100%' }} />
    </div>
  )
}
