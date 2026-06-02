import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Utilise la service role key côté serveur pour bypasser le RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const { userId, nom, prenom, email, telephone } = await request.json()

  if (!userId || !nom || !prenom || !email) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('proprietaires').insert({
    user_id: userId,
    nom,
    prenom,
    email,
    telephone: telephone || null,
  })

  if (error) {
    // Si la ligne existe déjà (double soumission), on considère que c'est OK
    if (error.code === '23505') {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
