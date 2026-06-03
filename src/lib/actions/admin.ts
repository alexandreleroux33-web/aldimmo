/**
 * Helpers côté client pour appeler /api/admin/db
 * qui utilise la service role key et bypass le RLS (SELECT et écritures).
 */

async function callAdminDb(body: Record<string, unknown>): Promise<void> {
  const res = await fetch('/api/admin/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error ?? `Erreur ${res.status}`)
  }
}

export async function adminInsert(table: string, data: Record<string, unknown>): Promise<void> {
  await callAdminDb({ operation: 'insert', table, data })
}

export async function adminUpdate(table: string, id: string, data: Record<string, unknown>): Promise<void> {
  await callAdminDb({ operation: 'update', table, id, data })
}

export async function adminDelete(table: string, id: string): Promise<void> {
  await callAdminDb({ operation: 'delete', table, id })
}

/** Fetches ALL rows from a table bypassing RLS (admin service role key). */
export async function adminSelect<T = Record<string, unknown>>(
  table: string,
  options: {
    select?: string
    order?: string
    orderAsc?: boolean
    eqCol?: string
    eqVal?: string
  } = {}
): Promise<T[]> {
  const params = new URLSearchParams({ table })
  if (options.select)   params.set('select', options.select)
  if (options.order)    params.set('order', options.order)
  if (options.orderAsc === false) params.set('orderAsc', 'false')
  if (options.eqCol)    params.set('eqCol', options.eqCol)
  if (options.eqVal)    params.set('eqVal', options.eqVal)

  const res = await fetch(`/api/admin/db?${params}`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error ?? `Erreur ${res.status}`)
  }
  const { data } = await res.json()
  return data ?? []
}
