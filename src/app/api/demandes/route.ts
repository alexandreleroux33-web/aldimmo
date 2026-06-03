import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const { nom, email, telephone, type, message } = await request.json()

  if (!nom || !email || !message) {
    return NextResponse.json({ error: 'nom, email et message requis' }, { status: 400 })
  }

  // Build insert payload — omit columns that may not exist yet in older schema
  const payload: Record<string, unknown> = { nom, email, message, statut: 'nouveau' }
  if (telephone) payload.telephone = telephone

  // Attempt full insert with type; fall back without it if the column is missing
  const { error } = await supabaseAdmin.from('demandes').insert({ ...payload, type: type || 'information' })

  if (error?.message?.includes("column") && error.message.includes("type")) {
    const { error: err2 } = await supabaseAdmin.from('demandes').insert(payload)
    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 })
  } else if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
