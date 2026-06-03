/**
 * Helpers côté client pour appeler la route /api/admin/db
 * qui utilise la service role key et bypass le RLS.
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
