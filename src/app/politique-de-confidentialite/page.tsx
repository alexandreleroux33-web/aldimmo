import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'

export const metadata = {
  title: 'Politique de confidentialité — ALD Immo',
  description: 'Politique de confidentialité et protection des données personnelles (RGPD) — ALD Immo.',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-stone-50 min-h-screen">
        <section className="bg-stone-900 text-white py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
            <p className="text-stone-400 text-sm">Dernière mise à jour : juin 2025 — Conforme au RGPD (UE) 2016/679</p>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto space-y-10 text-stone-700 leading-relaxed">

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-sm text-emerald-800">
              <strong>En résumé :</strong> ALD Immo collecte uniquement les données nécessaires à la gestion de votre bien et à votre relation client. Vos données ne sont jamais vendues à des tiers. Vous pouvez exercer vos droits à tout moment en nous contactant.
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">1. Responsable du traitement</h2>
              <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-2 text-sm">
                <div><span className="font-medium text-stone-900">Responsable :</span> ALD Immo</div>
                <div><span className="font-medium text-stone-900">Adresse :</span> Bordeaux et ses environs, Gironde (33), France</div>
                <div><span className="font-medium text-stone-900">Email DPO :</span> <a href="mailto:contact@aldimmo.fr" className="text-emerald-700 hover:underline">contact@aldimmo.fr</a></div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">2. Données collectées</h2>
              <p className="mb-4">ALD Immo collecte les catégories de données suivantes :</p>
              <div className="space-y-4">
                {[
                  {
                    title: 'Données d\'identification',
                    items: ['Nom et prénom', 'Adresse email', 'Numéro de téléphone', 'Adresse postale'],
                  },
                  {
                    title: 'Données relatives à votre bien immobilier',
                    items: ['Adresse du bien', 'Type de bien, capacité, nombre de chambres', 'Prix de location', 'Historique des réservations'],
                  },
                  {
                    title: 'Données financières',
                    items: ['Montants des réservations', 'Commissions versées', 'Coordonnées bancaires (pour les virements)'],
                  },
                  {
                    title: 'Données de connexion',
                    items: ['Adresse email (identifiant)', 'Mot de passe (chiffré, non lisible par ALD Immo)', 'Logs de connexion'],
                  },
                  {
                    title: 'Données de communication',
                    items: ['Messages échangés via l\'espace propriétaire', 'Emails et SMS échangés'],
                  },
                ].map((cat) => (
                  <div key={cat.title} className="bg-white rounded-xl border border-stone-200 p-5">
                    <div className="font-medium text-stone-900 mb-2">{cat.title}</div>
                    <ul className="list-disc list-inside text-sm space-y-1 text-stone-600">
                      {cat.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">3. Finalités et bases légales</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-stone-200 rounded-xl overflow-hidden">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-stone-700">Finalité</th>
                      <th className="text-left px-4 py-3 font-medium text-stone-700">Base légale</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-100">
                    {[
                      ['Gestion du contrat de conciergerie', 'Exécution du contrat (art. 6.1.b RGPD)'],
                      ['Gestion des réservations et des locataires', 'Exécution du contrat'],
                      ['Facturation et virements', 'Obligation légale (art. 6.1.c)'],
                      ['Envoi de bilans mensuels et rapports', 'Exécution du contrat'],
                      ['Communication via l\'espace propriétaire', 'Exécution du contrat'],
                      ['Amélioration du service', 'Intérêt légitime (art. 6.1.f)'],
                      ['Conformité fiscale et comptable', 'Obligation légale'],
                      ['Envoi d\'informations commerciales (si consentement)', 'Consentement (art. 6.1.a)'],
                    ].map(([fin, base]) => (
                      <tr key={fin}>
                        <td className="px-4 py-3 text-stone-700">{fin}</td>
                        <td className="px-4 py-3 text-stone-500">{base}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">4. Destinataires des données</h2>
              <p className="mb-3">Vos données sont accessibles aux personnes suivantes :</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>L'équipe ALD Immo</strong> — dans le cadre de la gestion de votre bien</li>
                <li><strong>Supabase (sous-traitant)</strong> — hébergement sécurisé de la base de données (serveurs UE)</li>
                <li><strong>Vercel (sous-traitant)</strong> — hébergement du site web</li>
                <li><strong>Plateformes de réservation</strong> (Airbnb, Booking.com) — uniquement les données nécessaires à la gestion des annonces</li>
                <li><strong>Prestataires comptables</strong> — données financières pour établissement des documents fiscaux</li>
              </ul>
              <p className="mt-3 text-sm font-medium text-stone-900">Vos données ne sont jamais vendues à des tiers.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">5. Durée de conservation</h2>
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-stone-700">Catégorie</th>
                      <th className="text-left px-4 py-3 font-medium text-stone-700">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {[
                      ['Données du compte propriétaire', '3 ans après la fin du contrat'],
                      ['Données de réservation', '5 ans (obligations comptables)'],
                      ['Documents financiers et factures', '10 ans (obligation légale)'],
                      ['Données de connexion', '12 mois'],
                      ['Messages', '3 ans après la fin du contrat'],
                    ].map(([cat, duree]) => (
                      <tr key={cat}>
                        <td className="px-4 py-3 text-stone-700">{cat}</td>
                        <td className="px-4 py-3 text-stone-500">{duree}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">6. Sécurité</h2>
              <p>ALD Immo met en œuvre les mesures techniques et organisationnelles suivantes pour protéger vos données :</p>
              <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                <li>Chiffrement des mots de passe (bcrypt)</li>
                <li>Connexions HTTPS/TLS</li>
                <li>Accès aux données limité par Row Level Security (RLS) — chaque propriétaire ne voit que ses propres données</li>
                <li>Authentification sécurisée via Supabase Auth</li>
                <li>Hébergement sur infrastructure certifiée ISO 27001</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">7. Vos droits</h2>
              <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { droit: 'Droit d\'accès', desc: 'Obtenir une copie de vos données (art. 15)' },
                  { droit: 'Droit de rectification', desc: 'Corriger des données inexactes (art. 16)' },
                  { droit: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données (art. 17)' },
                  { droit: 'Droit à la portabilité', desc: 'Recevoir vos données dans un format structuré (art. 20)' },
                  { droit: 'Droit d\'opposition', desc: 'Vous opposer à un traitement basé sur l\'intérêt légitime (art. 21)' },
                  { droit: 'Droit à la limitation', desc: 'Restreindre le traitement dans certains cas (art. 18)' },
                ].map((r) => (
                  <div key={r.droit} className="bg-white border border-stone-200 rounded-xl p-4">
                    <div className="font-medium text-stone-900 text-sm">{r.droit}</div>
                    <div className="text-stone-500 text-xs mt-1">{r.desc}</div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm">Pour exercer vos droits, contactez-nous à : <a href="mailto:contact@aldimmo.fr" className="text-emerald-700 hover:underline">contact@aldimmo.fr</a>. Nous répondrons dans un délai d'un mois. En cas de réponse insatisfaisante, vous pouvez saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">CNIL</a>.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">8. Cookies</h2>
              <p>Le site utilise uniquement des <strong>cookies techniques essentiels</strong> au fonctionnement du service :</p>
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mt-3">
                <table className="w-full text-sm">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-stone-700">Cookie</th>
                      <th className="text-left px-4 py-3 font-medium text-stone-700">Rôle</th>
                      <th className="text-left px-4 py-3 font-medium text-stone-700">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-stone-700">sb-*-auth-token</td>
                      <td className="px-4 py-3 text-stone-600">Session d'authentification Supabase</td>
                      <td className="px-4 py-3 text-stone-500">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm">Aucun cookie publicitaire, analytique ou de réseaux sociaux n'est déposé.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">9. Transferts hors UE</h2>
              <p>Certains de nos sous-traitants (Vercel, Supabase) sont basés aux États-Unis. Les transferts sont encadrés par les clauses contractuelles types (CCT) de la Commission européenne et les garanties appropriées prévues par le RGPD.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">10. Modification de la politique</h2>
              <p>ALD Immo se réserve le droit de modifier la présente politique à tout moment. La date de dernière mise à jour est indiquée en haut de cette page. En cas de modification substantielle, vous serez informé par email.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">11. Contact</h2>
              <p>Pour toute question relative à vos données personnelles : <a href="mailto:contact@aldimmo.fr" className="text-emerald-700 hover:underline">contact@aldimmo.fr</a></p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
