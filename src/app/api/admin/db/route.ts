import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Client au niveau module — même pattern que /api/register.
// La service role key bypass complètement le RLS (SELECT et écritures).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/** GET /api/admin/db?table=proprietaires&select=*&order=created_at&orderAsc=false */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const select = searchParams.get('select') ?? '*'
  const order = searchParams.get('order')
  const orderAsc = searchParams.get('orderAsc') !== 'false'
  const eqCol = searchParams.get('eqCol')
  const eqVal = searchParams.get('eqVal')

  if (!table) return NextResponse.json({ error: 'table requis' }, { status: 400 })

  let query = supabaseAdmin.from(table).select(select)
  if (eqCol && eqVal) query = query.eq(eqCol, eqVal) as any
  if (order) query = query.order(order, { ascending: orderAsc }) as any

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

/** POST /api/admin/db  body: { operation, table, data, id? } */
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
  } else if (operation === 'delete' && id) {
    result = await supabaseAdmin.from(table).delete().eq('id', id)
  } else {
    return NextResponse.json({ error: 'operation invalide' }, { status: 400 })
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
