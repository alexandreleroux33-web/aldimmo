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

  const { error } = await supabaseAdmin.from('demandes').insert({
    nom,
    email,
    telephone: telephone || null,
    type: type || 'information',
    message,
    statut: 'nouveau',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
