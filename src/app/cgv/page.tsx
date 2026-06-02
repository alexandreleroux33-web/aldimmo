import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'

export const metadata = {
  title: 'Conditions Générales de Vente — ALD Immo',
  description: 'CGV ALD Immo — conditions générales de vente pour les propriétaires confiant leur bien à la conciergerie.',
}

export default function CGVPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-stone-50 min-h-screen">
        <section className="bg-stone-900 text-white py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Conditions Générales de Vente</h1>
            <p className="text-stone-400 text-sm">Applicables aux propriétaires — Dernière mise à jour : juin 2025</p>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto space-y-10 text-stone-700 leading-relaxed">

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-sm text-amber-800">
              <strong>Note :</strong> Ces CGV constituent le cadre général de la relation entre ALD Immo et les propriétaires. Un contrat de mandat de gestion individualisé est signé pour chaque bien confié, précisant les conditions spécifiques convenues.
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">1. Identification des parties</h2>
              <p>Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les relations contractuelles entre :</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="bg-white rounded-xl border border-stone-200 p-5 text-sm">
                  <div className="font-semibold text-stone-900 mb-2">Le prestataire</div>
                  <div className="space-y-1 text-stone-600">
                    <div>ALD Immo</div>
                    <div>Bordeaux et ses environs, Gironde</div>
                    <div>contact@aldimmo.fr</div>
                    <div>+33 6 00 00 00 00</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-stone-200 p-5 text-sm">
                  <div className="font-semibold text-stone-900 mb-2">Le client / propriétaire</div>
                  <div className="text-stone-600">Toute personne physique ou morale propriétaire d'un bien immobilier souhaitant confier sa gestion locative saisonnière à ALD Immo.</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">2. Objet du contrat</h2>
              <p>ALD Immo propose des services de <strong>conciergerie immobilière et de gestion locative de courte durée</strong>, comprenant notamment :</p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-sm">
                <li>La création, la gestion et l'optimisation des annonces sur les plateformes de réservation (Airbnb, Booking.com, etc.)</li>
                <li>La gestion des réservations et de la relation avec les locataires</li>
                <li>L'accueil des locataires, la remise et la récupération des clés</li>
                <li>La coordination des ménages et de la blanchisserie entre chaque séjour</li>
                <li>La gestion des petites interventions de maintenance courante</li>
                <li>L'établissement de bilans mensuels détaillés</li>
                <li>Le versement mensuel des revenus nets au propriétaire</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">3. Formation du contrat</h2>
              <p>Le contrat de gestion est formé par la signature d'un <strong>mandat de gestion</strong> entre ALD Immo et le propriétaire. Ce mandat précise :</p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-sm">
                <li>Le bien concerné (adresse, description, équipements)</li>
                <li>La durée du mandat et les conditions de renouvellement</li>
                <li>Le taux de commission applicable</li>
                <li>Les conditions particulières éventuelles</li>
              </ul>
              <p className="mt-3">Les présentes CGV s'appliquent à tout mandat signé avec ALD Immo, sauf stipulation contraire expressément mentionnée dans le mandat.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">4. Tarification et commissions</h2>

              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-stone-200 p-6">
                  <h3 className="font-semibold text-stone-900 mb-3">4.1 Commission de gestion</h3>
                  <p className="text-sm">ALD Immo perçoit une <strong>commission de 20 % HT</strong> (vingt pour cent) sur le montant brut de chaque réservation encaissée. Cette commission couvre l'ensemble des prestations de gestion courante définies à l'article 2.</p>
                  <p className="text-sm mt-2">Exemple : pour une réservation de 500 €, la commission ALD Immo est de 100 € HT, et le versement net au propriétaire est de 400 €.</p>
                </div>

                <div className="bg-white rounded-xl border border-stone-200 p-6">
                  <h3 className="font-semibold text-stone-900 mb-3">4.2 Frais non inclus</h3>
                  <p className="text-sm mb-2">Les éléments suivants ne sont pas inclus dans la commission et font l'objet d'une facturation séparée, après accord préalable du propriétaire :</p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-stone-600">
                    <li>Travaux de réparation ou de rénovation</li>
                    <li>Remplacement de matériel ou d'équipements</li>
                    <li>Frais de ménage de fin de saison ou grand nettoyage exceptionnel</li>
                    <li>Frais photographiques professionnels (premier mandat)</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl border border-stone-200 p-6">
                  <h3 className="font-semibold text-stone-900 mb-3">4.3 Taxes de séjour</h3>
                  <p className="text-sm">La collecte et le reversement des taxes de séjour sont gérés directement par les plateformes de réservation (Airbnb, Booking.com) qui les collectent à la source. ALD Immo n'est pas responsable de la taxe de séjour pour les réservations directes ; le propriétaire est alors responsable de son reversement à la commune concernée.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">5. Versement des revenus</h2>
              <p>Les revenus nets (montant brut des réservations déduction faite de la commission ALD Immo et des éventuels frais refacturés) sont versés au propriétaire <strong>une fois par mois</strong>, dans les 10 jours ouvrés suivant la clôture du mois écoulé.</p>
              <p className="mt-3">Un bilan mensuel détaillé est communiqué au propriétaire via son espace en ligne, préalablement au versement, récapitulant :</p>
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>La liste des réservations du mois</li>
                <li>Le montant brut encaissé</li>
                <li>La commission ALD Immo (20 %)</li>
                <li>Les éventuels frais</li>
                <li>Le montant net versé</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">6. Obligations du propriétaire</h2>
              <p>Le propriétaire s'engage à :</p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-sm">
                <li>Fournir un bien conforme à la description transmise à ALD Immo, propre, sécurisé et équipé</li>
                <li>Informer ALD Immo de toute période d'indisponibilité du bien (travaux, usage personnel) avec un préavis minimum de <strong>7 jours</strong></li>
                <li>Souscrire une assurance habitation couvrant la location saisonnière (assurance villégiature ou multirisque habitation incluant les locataires de passage)</li>
                <li>Déclarer ses revenus locatifs conformément à la législation fiscale en vigueur</li>
                <li>Effectuer les déclarations administratives nécessaires (déclaration en mairie, autorisation de changement d'usage si applicable)</li>
                <li>Régler les factures liées aux travaux ou achats validés dans les délais convenus</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">7. Obligations d'ALD Immo</h2>
              <p>ALD Immo s'engage à :</p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-sm">
                <li>Gérer le bien avec diligence et professionnalisme</li>
                <li>Communiquer au propriétaire tout incident ou dommage constaté dans les meilleurs délais</li>
                <li>Obtenir l'accord préalable du propriétaire pour toute dépense non prévue au contrat supérieure à <strong>150 € TTC</strong></li>
                <li>Reverser les revenus dans les délais convenus</li>
                <li>Tenir un bilan mensuel précis et accessible depuis l'espace propriétaire</li>
                <li>Maintenir la confidentialité des informations du propriétaire</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">8. Durée et résiliation</h2>
              <div className="space-y-3 text-sm">
                <p><strong>Durée :</strong> Le mandat de gestion est conclu pour une durée initiale d'un an, renouvelable tacitement par périodes d'un an.</p>
                <p><strong>Résiliation à l'échéance :</strong> Chaque partie peut résilier le mandat à son échéance anniversaire, avec un préavis de <strong>3 mois</strong> par lettre recommandée avec accusé de réception.</p>
                <p><strong>Résiliation anticipée :</strong> En cas de manquement grave de l'une des parties à ses obligations, non remédié dans un délai de 15 jours après mise en demeure, le contrat peut être résilié de plein droit.</p>
                <p><strong>Réservations en cours :</strong> En cas de résiliation, les réservations déjà confirmées sont honorées jusqu'à leur terme, sauf accord contraire entre les parties.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">9. Responsabilité</h2>
              <div className="space-y-3 text-sm">
                <p><strong>Dommages au bien :</strong> ALD Immo met en œuvre toutes les mesures raisonnables pour prévenir les dommages. En cas de dommage causé par un locataire, ALD Immo accompagne le propriétaire dans les démarches de réclamation auprès du locataire et/ou des plateformes (garantie hôte Airbnb, etc.). La responsabilité d'ALD Immo ne saurait être engagée au-delà de ce que couvrent les garanties des plateformes.</p>
                <p><strong>Revenus locatifs :</strong> ALD Immo n'est pas tenue à une obligation de résultat en termes de revenus. Les estimations de revenus communiquées sont indicatives et dépendent de facteurs externes (saisonnalité, marché, disponibilité du bien).</p>
                <p><strong>Force majeure :</strong> ALD Immo ne saurait être tenue responsable d'un manquement à ses obligations résultant d'un cas de force majeure (catastrophe naturelle, pandémie, décision administrative, etc.).</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">10. Confidentialité</h2>
              <p className="text-sm">Les parties s'engagent mutuellement à garder confidentielles les informations échangées dans le cadre du contrat et à ne pas les divulguer à des tiers sans accord préalable. Cette obligation survit à la résiliation du contrat pendant une durée de <strong>3 ans</strong>.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">11. Protection des données</h2>
              <p className="text-sm">Le traitement des données personnelles dans le cadre de la relation contractuelle est détaillé dans notre <a href="/politique-de-confidentialite" className="text-emerald-700 hover:underline">Politique de confidentialité</a>.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">12. Modification des CGV</h2>
              <p className="text-sm">ALD Immo se réserve le droit de modifier les présentes CGV. Les modifications sont communiquées aux propriétaires par email avec un préavis de <strong>30 jours</strong>. À défaut d'opposition dans ce délai, les nouvelles CGV sont réputées acceptées.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">13. Règlement des litiges</h2>
              <p className="text-sm">En cas de litige, les parties s'engagent à rechercher une solution amiable dans un délai de 30 jours. À défaut, le litige sera soumis au tribunal compétent du ressort du siège d'ALD Immo. Le droit applicable est le droit français.</p>
              <p className="mt-3 text-sm">Conformément à l'article L.612-1 du Code de la consommation, le client peut recourir gratuitement à un médiateur de la consommation.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">14. Acceptation</h2>
              <p className="text-sm">La signature du mandat de gestion vaut acceptation pleine et entière des présentes CGV. Le propriétaire déclare en avoir pris connaissance préalablement à la signature.</p>
            </div>

            <div className="bg-stone-100 rounded-xl p-6 text-sm text-stone-600">
              <p>Pour toute question relative à ces CGV : <a href="mailto:contact@aldimmo.fr" className="text-emerald-700 hover:underline">contact@aldimmo.fr</a> — <a href="/contact" className="text-emerald-700 hover:underline">Formulaire de contact</a></p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
