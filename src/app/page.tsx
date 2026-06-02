import Link from 'next/link'
import { Home, Shield, TrendingUp, Star, CheckCircle, Users, ArrowRight, MapPin, Phone, Mail, Clock, HeartHandshake } from 'lucide-react'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'

export default function HomePage() {
  const services = [
    {
      icon: Home,
      title: 'Gestion locative',
      description: 'Nous gérons intégralement votre bien : annonces, calendriers, communication avec les locataires, états des lieux et ménage entre chaque séjour.',
    },
    {
      icon: Shield,
      title: 'Conciergerie premium',
      description: 'Accueil personnalisé, remise des clés 24h/24, panier de bienvenue, linge de maison haut de gamme. Vos locataires repartent avec 5 étoiles.',
    },
    {
      icon: TrendingUp,
      title: 'Optimisation des revenus',
      description: 'Tarification dynamique selon la saison et la demande, référencement optimisé sur Airbnb et Booking. Maximisez chaque nuitée.',
    },
  ]

  const steps = [
    { num: '01', title: 'Premier contact', desc: 'Nous échangeons sur votre bien et vos objectifs. Visite gratuite et sans engagement.' },
    { num: '02', title: 'Mise en place', desc: 'Création ou optimisation des annonces, photos professionnelles, calendrier de disponibilités.' },
    { num: '03', title: 'Gestion quotidienne', desc: 'Nous prenons en charge tout : réservations, accueil, ménage, maintenance, communication.' },
    { num: '04', title: 'Bilan mensuel', desc: 'Rapport détaillé chaque mois : revenus, taux d\'occupation, avis locataires, versement net.' },
  ]

  const engagements = [
    {
      icon: HeartHandshake,
      title: 'Service personnalisé',
      desc: 'Un interlocuteur dédié qui connaît votre bien et vos attentes.',
    },
    {
      icon: Clock,
      title: 'Disponible 7j/7',
      desc: 'Nous sommes joignables tous les jours pour vous et vos locataires.',
    },
    {
      icon: TrendingUp,
      title: 'Revenus optimisés',
      desc: 'Tarification intelligente et gestion proactive pour rentabiliser au mieux votre bien.',
    },
  ]

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-stone-900 text-white pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-700/20 border border-emerald-600/30 text-emerald-300 text-sm px-4 py-1.5 rounded-full mb-6">
              <MapPin className="w-4 h-4" />
              Bordeaux et ses environs
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Votre conciergerie<br />
              <span className="text-emerald-400">immobilière</span> à<br />
              Bordeaux et environs
            </h1>
            <p className="text-stone-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              ALD Immo prend soin de votre bien comme du sien. Gestion locative complète, accueil premium et revenus optimisés — vous profitez, nous gérons.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Demander un devis gratuit <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="border border-stone-500 hover:border-stone-300 text-stone-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors"
              >
                Espace propriétaire
              </Link>
            </div>
          </div>
        </section>

        {/* Engagements — remplace les fausses stats */}
        <section className="bg-emerald-50 py-14 px-4 border-y border-emerald-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {engagements.map((e) => (
                <div key={e.title} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-700 rounded-xl flex items-center justify-center">
                    <e.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xl font-bold text-stone-900">{e.title}</div>
                  <div className="text-stone-600 text-sm max-w-xs">{e.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="bg-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Nos services</h2>
              <p className="text-stone-600 max-w-xl mx-auto">Une offre complète pour que votre investissement vous rapporte sans contrainte.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((s) => (
                <div key={s.title} className="bg-stone-50 rounded-2xl p-8 border border-stone-100 hover:border-emerald-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-emerald-700 rounded-xl flex items-center justify-center mb-6">
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-3">{s.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section id="comment" className="bg-stone-50 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Comment ça marche ?</h2>
              <p className="text-stone-600 max-w-xl mx-auto">De la première rencontre au versement mensuel, nous vous accompagnons à chaque étape.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div key={step.num} className="relative">
                  <div className="text-6xl font-black text-emerald-100 mb-4">{step.num}</div>
                  <h3 className="text-lg font-bold text-stone-900 mb-2">{step.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="bg-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Ce que disent nos propriétaires</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-stone-700 italic mb-6">"Depuis que ALD Immo gère mon appartement, je n'ai plus à me soucier de rien. Mes revenus ont augmenté et les locataires sont ravis. Je recommande vivement."</p>
                <div className="font-semibold text-stone-900">Jean D.</div>
                <div className="text-stone-500 text-sm">Propriétaire — Appartement à Bordeaux</div>
              </div>
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-stone-700 italic mb-6">"Le service est impeccable, l'équipe est réactive et professionnelle. Mon bien est parfaitement entretenu et les bilans mensuels sont très clairs."</p>
                <div className="font-semibold text-stone-900">Sophie M.</div>
                <div className="text-stone-500 text-sm">Propriétaire — Maison aux environs de Bordeaux</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-stone-900 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Users className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Devenez partenaire ALD Immo</h2>
            <p className="text-stone-300 text-lg mb-10 max-w-xl mx-auto">
              Confiez-nous votre bien et bénéficiez d'un accompagnement sur-mesure à Bordeaux et ses environs. Premier entretien gratuit et sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Prendre contact <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="tel:+33600000000"
                className="border border-stone-600 hover:border-stone-400 text-stone-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Nous appeler
              </Link>
            </div>
          </div>
        </section>

        {/* Contact rapide */}
        <section className="bg-stone-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-400" />
                <div className="text-white font-medium">Bordeaux et environs</div>
                <div className="text-stone-400 text-sm">Gironde, France</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Phone className="w-6 h-6 text-emerald-400" />
                <div className="text-white font-medium">+33 6 00 00 00 00</div>
                <div className="text-stone-400 text-sm">Du lundi au samedi, 9h–19h</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mail className="w-6 h-6 text-emerald-400" />
                <div className="text-white font-medium">contact@aldimmo.fr</div>
                <div className="text-stone-400 text-sm">Réponse sous 24h</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
