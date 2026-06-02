'use client'

import { useEffect, useRef } from 'react'

// Centre géographique de la zone d'intervention
const CENTER: [number, number] = [44.855, -0.615]
const RADIUS_M = 6200 // englobe Bordeaux centre, Le Bouscat, Caudéran, Mérignac, Bruges

export default function MapBordeaux() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      const map = L.map(containerRef.current!, {
        center: CENTER,
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
        dragging: true,
        doubleClickZoom: true,
        touchZoom: true,
        keyboard: true,
      })

      mapRef.current = map

      // Tuiles CartoDB Positron — fond clair et neutre
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      // Attribution discrète
      L.control.attribution({ position: 'bottomright', prefix: '' })
        .addAttribution('© <a href="https://carto.com" style="color:#C8B89A;font-size:9px">CARTO</a>')
        .addTo(map)

      // Grand cercle semi-transparent vert sauge
      L.circle(CENTER, {
        radius: RADIUS_M,
        color: '#5B8C6B',
        fillColor: '#5B8C6B',
        fillOpacity: 0.12,
        weight: 1.5,
        opacity: 0.45,
      }).addTo(map)

      // Teinte chaude sur les tuiles
      const pane = map.getPane('tilePane')
      if (pane) {
        pane.style.filter = 'sepia(18%) saturate(80%) brightness(1.03)'
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
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(45,41,38,0.1)', boxShadow: '0 2px 16px rgba(45,41,38,0.07)' }}
    >
      <div ref={containerRef} style={{ height: '260px', width: '100%' }} />
    </div>
  )
}
