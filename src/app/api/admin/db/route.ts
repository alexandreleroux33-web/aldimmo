import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Client créé au niveau module — même pattern que /api/register qui fonctionne.
// La service role key bypass complètement le RLS.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const { operation, table, data, id } = await request.json()

  if (!table || !operation) {
    return NextResponse.json({ error: 'table et operation requis' }, { status: 400 })
  }

  let result: { error: { message: string } | null }

  if (operation === 'insert') {
    result = await supabaseAdmin.from(table).insert(data)
  } else if (operation === 'update' && id) {
    result = await supabaseAdmin.from(table).update(data).eq('id', id)
  } else {
    return NextResponse.json({ error: 'operation invalide' }, { status: 400 })
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
