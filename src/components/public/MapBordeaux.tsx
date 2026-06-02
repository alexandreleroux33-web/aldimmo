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
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
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

      // Label "ALD Immo" au centre du cercle
      const label = L.divIcon({
        html: `
          <div style="
            display:flex;
            flex-direction:column;
            align-items:center;
            gap:4px;
            transform:translate(-50%,-50%);
            white-space:nowrap;
          ">
            <div style="
              background:rgba(250,248,245,0.92);
              border:1.5px solid rgba(91,140,107,0.4);
              border-radius:999px;
              padding:5px 14px;
              font-family:system-ui,-apple-system,sans-serif;
              font-size:12px;
              font-weight:700;
              color:#3A5E46;
              letter-spacing:0.04em;
              backdrop-filter:blur(6px);
              box-shadow:0 2px 12px rgba(91,140,107,0.18);
            ">ALD Immo</div>
            <div style="
              font-family:system-ui,-apple-system,sans-serif;
              font-size:10px;
              color:#7A6E68;
              font-weight:500;
            ">Zone d&apos;intervention</div>
          </div>
        `,
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })

      L.marker(CENTER, { icon: label, interactive: false }).addTo(map)

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
