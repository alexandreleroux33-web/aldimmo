/**
 * Script de création d'un compte administrateur ALD Immo
 *
 * Usage :
 *   node scripts/create-admin.mjs <email> <password> [prénom] [nom]
 *
 * Exemple :
 *   node scripts/create-admin.mjs admin@aldimmo.fr MonMotDePasse Alex Dupont
 *
 * Prérequis : .env.local avec NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Charger .env.local manuellement
const envPath = resolve(process.cwd(), '.env.local')
const env = {}
try {
  const raw = readFileSync(envPath, 'utf-8')
  for (const line of raw.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) env[key.trim()] = rest.join('=').trim()
  }
} catch {
  console.error('❌  Impossible de lire .env.local')
  process.exit(1)
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local')
  process.exit(1)
}

const [,, email, password, prenom = 'Admin', nom = 'ALD'] = process.argv

if (!email || !password) {
  console.error('❌  Usage : node scripts/create-admin.mjs <email> <password> [prénom] [nom]')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function createAdmin() {
  console.log(`\n🔧  Création du compte admin pour : ${email}\n`)

  // 1. Créer l'utilisateur auth avec le rôle admin en metadata
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // confirmation email ignorée
    user_metadata: { is_admin: true, prenom, nom },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('ℹ️   Cet email est déjà enregistré. Mise à jour du rôle admin...')

      // Récupérer l'utilisateur existant
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
      if (listError) { console.error('❌', listError.message); process.exit(1) }

      const existing = listData.users.find(u => u.email === email)
      if (!existing) { console.error('❌  Utilisateur introuvable'); process.exit(1) }

      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        user_metadata: { ...existing.user_metadata, is_admin: true },
      })
      if (updateError) { console.error('❌', updateError.message); process.exit(1) }

      console.log(`✅  Rôle admin ajouté à l'utilisateur existant (${existing.id})`)
      console.log('\n🎉  Terminé ! Connectez-vous sur /login puis accédez à /admin\n')
      return
    }
    console.error('❌  Erreur création auth :', authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log(`✅  Utilisateur auth créé (${userId})`)

  // 2. Créer la fiche proprietaire
  const { error: dbError } = await supabase.from('proprietaires').insert({
    user_id: userId,
    nom,
    prenom,
    email,
  })

  if (dbError && !dbError.message.includes('duplicate')) {
    console.warn('⚠️   Fiche proprietaire non créée :', dbError.message)
  } else {
    console.log('✅  Fiche propriétaire créée')
  }

  console.log(`
✅  Compte admin créé avec succès !
   Email    : ${email}
   Rôle     : is_admin = true
   User ID  : ${userId}

🔐  Connexion : /login  →  puis /admin
`)
}

createAdmin()
