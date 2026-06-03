import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const { proprietaire_id, email, action } = await request.json()

  if (!proprietaire_id) {
    return NextResponse.json({ error: 'proprietaire_id requis' }, { status: 400 })
  }

  // Unlink: set user_id to null
  if (action === 'unlink') {
    const { error } = await supabaseAdmin
      .from('proprietaires')
      .update({ user_id: null })
      .eq('id', proprietaire_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, unlinked: true })
  }

  // Link: find auth user by email then set user_id
  if (!email) {
    return NextResponse.json({ error: 'email requis pour lier un compte' }, { status: 400 })
  }

  // List users and find by email (works well for small user bases)
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })

  const found = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (!found) {
    return NextResponse.json({
      error: `Aucun compte Supabase trouvé avec l'email ${email}. Le propriétaire doit d'abord créer son compte sur le site.`,
    }, { status: 404 })
  }

  // Check if this auth user is already linked to another proprietaire
  const { data: existing } = await supabaseAdmin
    .from('proprietaires')
    .select('id, nom, prenom')
    .eq('user_id', found.id)
    .neq('id', proprietaire_id)
    .limit(1)

  if (existing && existing.length > 0) {
    const other = existing[0]
    return NextResponse.json({
      error: `Ce compte est déjà lié à ${other.prenom} ${other.nom}.`,
    }, { status: 409 })
  }

  const { error: updateErr } = await supabaseAdmin
    .from('proprietaires')
    .update({ user_id: found.id })
    .eq('id', proprietaire_id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    user_id: found.id,
    email: found.email,
    created_at: found.created_at,
    last_sign_in: found.last_sign_in_at,
  })
}
