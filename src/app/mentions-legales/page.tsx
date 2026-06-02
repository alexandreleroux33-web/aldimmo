import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'

export const metadata = {
  title: 'Mentions légales — ALD Immo',
  description: 'Mentions légales de ALD Immo, conciergerie immobilière à Bordeaux.',
}

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-stone-50 min-h-screen">
        <section className="bg-stone-900 text-white py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Mentions légales</h1>
            <p className="text-stone-400 text-sm">Dernière mise à jour : juin 2025</p>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto space-y-10 text-stone-700 leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">1. Éditeur du site</h2>
              <p>Le site <strong>aldimmo.fr</strong> est édité par :</p>
              <div className="mt-3 bg-white rounded-xl border border-stone-200 p-6 space-y-2 text-sm">
                <div><span className="font-medium text-stone-900">Raison sociale :</span> ALD Immo</div>
                <div><span className="font-medium text-stone-900">Forme juridique :</span> Entreprise individuelle</div>
                <div><span className="font-medium text-stone-900">Activité :</span> Conciergerie immobilière — gestion locative de courte durée</div>
                <div><span className="font-medium text-stone-900">Adresse :</span> Bordeaux et ses environs, Gironde (33), France</div>
                <div><span className="font-medium text-stone-900">Email :</span> contact@aldimmo.fr</div>
                <div><span className="font-medium text-stone-900">Téléphone :</span> +33 6 00 00 00 00</div>
                <div><span className="font-medium text-stone-900">SIRET :</span> [à compléter]</div>
                <div><span className="font-medium text-stone-900">N° TVA intracommunautaire :</span> [à compléter si applicable]</div>
                <div><span className="font-medium text-stone-900">Carte professionnelle (Loi Hoguet) :</span> [à compléter si applicable]</div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">2. Directeur de la publication</h2>
              <p>Le directeur de la publication est le représentant légal d'ALD Immo, joignable à l'adresse email : <a href="mailto:contact@aldimmo.fr" className="text-emerald-700 hover:underline">contact@aldimmo.fr</a>.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">3. Hébergement</h2>
              <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-2 text-sm">
                <div><span className="font-medium text-stone-900">Hébergeur :</span> Vercel Inc.</div>
                <div><span className="font-medium text-stone-900">Adresse :</span> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</div>
                <div><span className="font-medium text-stone-900">Site web :</span> <a href="https://vercel.com" className="text-emerald-700 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a></div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">4. Propriété intellectuelle</h2>
              <p>L'ensemble des éléments constituant le site aldimmo.fr (textes, images, logos, icônes, structure) sont la propriété exclusive d'ALD Immo, sauf mention contraire. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation préalable écrite d'ALD Immo est interdite et constituerait une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la Propriété Intellectuelle.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">5. Responsabilité</h2>
              <p>ALD Immo s'efforce de fournir des informations exactes et à jour sur ce site. Toutefois, elle ne saurait garantir l'exhaustivité, l'exactitude ou l'actualité des informations diffusées. ALD Immo décline toute responsabilité pour tout préjudice direct ou indirect résultant de l'accès ou de l'utilisation du site, ou de l'impossibilité d'y accéder.</p>
              <p className="mt-3">Le site peut contenir des liens hypertextes vers des sites tiers. ALD Immo n'exerce aucun contrôle sur ces sites et n'assume aucune responsabilité quant à leur contenu.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">6. Données personnelles</h2>
              <p>Les informations recueillies via le site font l'objet d'un traitement informatique destiné à la gestion de la relation client et à la fourniture des services de conciergerie. Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés, vous disposez de droits sur vos données. Consultez notre <a href="/politique-de-confidentialite" className="text-emerald-700 hover:underline">Politique de confidentialité</a> pour en savoir plus.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">7. Cookies</h2>
              <p>Le site aldimmo.fr utilise des cookies techniques strictement nécessaires au fonctionnement du service d'authentification (session utilisateur). Aucun cookie publicitaire ou de tracking tiers n'est utilisé. En naviguant sur ce site, vous acceptez l'utilisation de ces cookies techniques.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">8. Droit applicable</h2>
              <p>Le présent site et les présentes mentions légales sont soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">9. Contact</h2>
              <p>Pour toute question relative aux présentes mentions légales : <a href="mailto:contact@aldimmo.fr" className="text-emerald-700 hover:underline">contact@aldimmo.fr</a></p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
