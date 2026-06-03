export interface ICalEvent {
  uid: string
  summary: string
  dtstart: string // ISO date 'YYYY-MM-DD'
  dtend: string   // ISO date 'YYYY-MM-DD'
  description?: string
}

export async function parseICalFeed(url: string): Promise<ICalEvent[]> {
  const response = await fetch(url, { next: { revalidate: 3600 } })
  if (!response.ok) throw new Error(`iCal fetch failed: ${response.status}`)
  const text = await response.text()
  return parseICalText(text)
}

export function parseICalText(text: string): ICalEvent[] {
  // Unfold: continuation lines start with a space or tab (RFC 5545 §3.1)
  const unfolded = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '')

  const events: ICalEvent[] = []
  const lines = unfolded.split('\n')
  let current: Partial<ICalEvent> | null = null

  for (const raw of lines) {
    const line = raw.trim()
    if (line === 'BEGIN:VEVENT') {
      current = {}
    } else if (line === 'END:VEVENT' && current) {
      if (current.uid && current.dtstart && current.dtend) {
        events.push(current as ICalEvent)
      }
      current = null
    } else if (current) {
      const colonIdx = line.indexOf(':')
      if (colonIdx === -1) continue
      const key = line.slice(0, colonIdx).split(';')[0].toUpperCase()
      const val = line.slice(colonIdx + 1).replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';')

      if (key === 'UID') current.uid = val
      else if (key === 'SUMMARY') current.summary = val
      else if (key === 'DESCRIPTION') current.description = val
      else if (key === 'DTSTART') current.dtstart = extractDate(line)
      else if (key === 'DTEND') current.dtend = extractDate(line)
    }
  }

  return events
}

function extractDate(line: string): string {
  const value = line.split(':').slice(1).join(':').trim()
  const dateOnly = value.slice(0, 8)
  return `${dateOnly.slice(0, 4)}-${dateOnly.slice(4, 6)}-${dateOnly.slice(6, 8)}`
}

const GENERIC_SUMMARIES = [
  'réservé', 'reserved', 'airbnb (not available)', 'not available',
  'indisponible', 'blocked', 'unavailable', 'booking.com (not available)',
]

/** Extracts the best available guest name from an iCal event. */
export function extractGuestName(event: ICalEvent, plateforme: 'airbnb' | 'booking'): string {
  const summary = event.summary?.trim() ?? ''

  // Use SUMMARY if it's not a generic placeholder
  if (summary && !GENERIC_SUMMARIES.includes(summary.toLowerCase())) {
    return summary
  }

  // Try DESCRIPTION: Airbnb embeds "First name: X" or "Prénom : X"
  const desc = event.description ?? ''
  const patterns = [
    /First name[:\s]+([^\n\\]+)/i,
    /Prénom[:\s]+([^\n\\]+)/i,
    /Guest[:\s]+([^\n\\]+)/i,
    /Locataire[:\s]+([^\n\\]+)/i,
  ]
  for (const re of patterns) {
    const m = desc.match(re)
    if (m) return m[1].trim()
  }

  // Blocked / unavailable dates
  if (GENERIC_SUMMARIES.some(g => summary.toLowerCase().includes(g) || desc.toLowerCase().includes(g))) {
    return plateforme === 'airbnb' ? 'Indisponible Airbnb' : 'Indisponible Booking'
  }

  return `Réservation ${plateforme}`
}
