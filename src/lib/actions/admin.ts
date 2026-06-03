'use server'

import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function adminInsert(table: string, data: Record<string, unknown>): Promise<void> {
  const { error } = await adminClient().from(table).insert(data)
  if (error) throw new Error(error.message)
}

export async function adminUpdate(table: string, id: string, data: Record<string, unknown>): Promise<void> {
  const { error } = await adminClient().from(table).update(data).eq('id', id)
  if (error) throw new Error(error.message)
}
