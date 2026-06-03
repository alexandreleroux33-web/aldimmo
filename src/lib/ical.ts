/**
 * iCal sync architecture for Airbnb & Booking.com
 *
 * Usage (future):
 *   const events = await parseICalFeed(bien.ical_airbnb_url)
 *   await syncReservations(bien.id, bien.proprietaire_id, events, 'airbnb')
 */

export interface ICalEvent {
  uid: string
  summary: string
  dtstart: string // ISO date 'YYYY-MM-DD'
  dtend: string   // ISO date 'YYYY-MM-DD'
  description?: string
}

/**
 * Fetches and parses an iCal feed URL.
 * Must be called server-side (Next.js API route or server action) to avoid CORS.
 */
export async function parseICalFeed(url: string): Promise<ICalEvent[]> {
  const response = await fetch(url, { next: { revalidate: 3600 } })
  if (!response.ok) throw new Error(`iCal fetch failed: ${response.status}`)
  const text = await response.text()
  return parseICalText(text)
}

function parseICalText(text: string): ICalEvent[] {
  const events: ICalEvent[] = []
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

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
      if (line.startsWith('UID:')) current.uid = line.slice(4)
      else if (line.startsWith('SUMMARY:')) current.summary = line.slice(8)
      else if (line.startsWith('DESCRIPTION:')) current.description = line.slice(12)
      else if (line.startsWith('DTSTART')) current.dtstart = extractDate(line)
      else if (line.startsWith('DTEND')) current.dtend = extractDate(line)
    }
  }

  return events
}

function extractDate(line: string): string {
  // Handles DTSTART:20240101 and DTSTART;VALUE=DATE:20240101 and DTSTART;TZID=...:20240101T...
  const value = line.split(':').slice(1).join(':').trim()
  const dateOnly = value.slice(0, 8)
  return `${dateOnly.slice(0, 4)}-${dateOnly.slice(4, 6)}-${dateOnly.slice(6, 8)}`
}

/**
 * Syncs iCal events into the reservations table.
 * Upserts based on a synthetic locataire_nom containing the iCal UID to detect duplicates.
 *
 * This function is a server-side placeholder. Implement as a Next.js server action
 * or API route (/api/ical/sync) with the Supabase service role key.
 */
export async function syncReservations(
  bienId: string,
  proprietaireId: string,
  events: ICalEvent[],
  plateforme: 'airbnb' | 'booking'
): Promise<{ inserted: number; skipped: number }> {
  // TODO: implement using supabase admin client in an API route
  // Example shape:
  // for (const event of events) {
  //   await supabaseAdmin.from('reservations').upsert({
  //     bien_id: bienId,
  //     proprietaire_id: proprietaireId,
  //     locataire_nom: event.summary || 'Réservation externe',
  //     date_debut: event.dtstart,
  //     date_fin: event.dtend,
  //     statut: 'confirme',
  //     plateforme,
  //     montant_total: 0, // iCal doesn't contain pricing
  //     ical_uid: event.uid,
  //   }, { onConflict: 'ical_uid' })
  // }
  throw new Error('syncReservations must be called server-side via an API route')
}
