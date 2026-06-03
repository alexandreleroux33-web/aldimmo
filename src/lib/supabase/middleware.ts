import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Redirige vers /login si non connecté
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirige vers /dashboard si connecté mais pas admin
  if (user && pathname.startsWith('/admin')) {
    // Vérifie dans user_metadata ET app_metadata (les deux peuvent porter is_admin
    // selon la méthode utilisée pour l'attribuer). On accepte aussi la valeur string
    // "true" car certaines versions de Supabase sérialisent les booléens en string.
    const meta = user.user_metadata
    const app = user.app_metadata
    const isAdmin =
      meta?.is_admin === true || meta?.is_admin === 'true' ||
      app?.is_admin  === true || app?.is_admin  === 'true'
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}
