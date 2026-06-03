import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { parseICalFeed, extractGuestName } from '@/lib/ical'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const { bien_id, proprietaire_id, ical_url, plateforme, reset } = await request.json()

  if (!bien_id || !proprietaire_id || !ical_url || !plateforme) {
    return NextResponse.json({ error: 'bien_id, proprietaire_id, ical_url et plateforme requis' }, { status: 400 })
  }
  if (!['airbnb', 'booking'].includes(plateforme)) {
    return NextResponse.json({ error: 'plateforme doit être airbnb ou booking' }, { status: 400 })
  }

  // Parse iCal feed first (fail fast before any deletions)
  let events
  try {
    events = await parseICalFeed(ical_url)
  } catch (err: any) {
    return NextResponse.json({ error: `Impossible de lire le calendrier iCal : ${err.message}` }, { status: 400 })
  }

  // In reset mode: delete all existing reservations for this bien + plateforme
  let deleted = 0
  if (reset) {
    const { data: toDelete, error: fetchErr } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('bien_id', bien_id)
      .eq('plateforme', plateforme)

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    if (toDelete && toDelete.length > 0) {
      const { error: delErr } = await supabaseAdmin
        .from('reservations')
        .delete()
        .eq('bien_id', bien_id)
        .eq('plateforme', plateforme)

      if (delErr) {
        return NextResponse.json({ error: delErr.message }, { status: 500 })
      }
      deleted = toDelete.length
    }
  }

  if (events.length === 0) {
    return NextResponse.json({ inserted: 0, skipped: 0, deleted })
  }

  // In normal mode: skip dates already imported
  const existingKeys = new Set<string>()
  if (!reset) {
    const { data: existing } = await supabaseAdmin
      .from('reservations')
      .select('date_debut, date_fin')
      .eq('bien_id', bien_id)
      .eq('plateforme', plateforme)
    ;(existing ?? []).forEach(r => existingKeys.add(`${r.date_debut}__${r.date_fin}`))
  }

  let inserted = 0
  let skipped = 0

  for (const event of events) {
    const key = `${event.dtstart}__${event.dtend}`

    if (!reset && existingKeys.has(key)) {
      skipped++
      continue
    }

    // Skip events that ended more than 1 day ago
    if (new Date(event.dtend) < new Date(Date.now() - 86400000)) {
      skipped++
      continue
    }

    const locataire_nom = extractGuestName(event, plateforme as 'airbnb' | 'booking')

    const { error } = await supabaseAdmin.from('reservations').insert({
      bien_id,
      proprietaire_id,
      locataire_nom,
      locataire_email: null,
      date_debut: event.dtstart,
      date_fin: event.dtend,
      montant_total: 0,
      statut: 'confirme',
      plateforme,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    existingKeys.add(key)
    inserted++
  }

  return NextResponse.json({ inserted, skipped, deleted, total: events.length })
}
