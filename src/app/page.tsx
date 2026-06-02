import Link from 'next/link'
import { Home, Shield, TrendingUp, Star, CheckCircle, Users, ArrowRight, MapPin, Phone, Mail } from 'lucide-react'
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

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-slate-900 text-white pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm px-4 py-1.5 rounded-full mb-6">
              <MapPin className="w-4 h-4" />
              Gujan-Mestras — Bassin d'Arcachon
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Votre conciergerie<br />
              <span className="text-sky-400">immobilière</span> sur le<br />
              Bassin d'Arcachon
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              ALD Immo prend soin de votre bien comme du sien. Gestion locative complète, accueil premium et revenus optimisés — vous profitez, nous gérons.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Demander un devis gratuit <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors"
              >
                Espace propriétaire
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-slate-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-sky-400 mb-2">50+</div>
                <div className="text-slate-300 font-medium">Propriétés gérées</div>
                <div className="text-slate-500 text-sm">sur le Bassin d'Arcachon</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-sky-400 mb-2">98%</div>
                <div className="text-slate-300 font-medium">Taux de satisfaction</div>
                <div className="text-slate-500 text-sm">propriétaires et locataires</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-sky-400 mb-2">+35%</div>
                <div className="text-slate-300 font-medium">Revenus en moyenne</div>
                <div className="text-slate-500 text-sm">par rapport à la gestion seule</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="bg-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Nos services</h2>
              <p className="text-slate-600 max-w-xl mx-auto">Une offre complète pour que votre investissement vous rapporte sans contrainte.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((s) => (
                <div key={s.title} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6">
                    <s.icon className="w-6 h-6 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section id="comment" className="bg-slate-50 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Comment ça marche ?</h2>
              <p className="text-slate-600 max-w-xl mx-auto">De la première rencontre au versement mensuel, nous vous accompagnons à chaque étape.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div key={step.num} className="relative">
                  <div className="text-6xl font-black text-slate-200 mb-4">{step.num}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Avis / Témoignages */}
        <section className="bg-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Ce que disent nos propriétaires</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-700 italic mb-6">"Depuis que ALD Immo gère ma villa, je n'ai plus à me soucier de rien. Mes revenus ont augmenté de 40% et les locataires sont ravis. Je recommande vivement."</p>
                <div className="font-semibold text-slate-900">Jean D.</div>
                <div className="text-slate-500 text-sm">Propriétaire — Villa à Gujan-Mestras</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-700 italic mb-6">"Le service est impeccable, l'équipe est réactive et professionnelle. Mon appartement est parfaitement entretenu et les bilans mensuels sont très clairs."</p>
                <div className="font-semibold text-slate-900">Sophie M.</div>
                <div className="text-slate-500 text-sm">Propriétaire — Appartement à Arcachon</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Users className="w-12 h-12 text-sky-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Devenez partenaire ALD Immo</h2>
            <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
              Rejoignez les propriétaires qui nous font confiance sur le Bassin d'Arcachon. Premier entretien gratuit et sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Prendre contact <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="tel:+33600000000"
                className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Nous appeler
              </Link>
            </div>
          </div>
        </section>

        {/* Contact rapide */}
        <section className="bg-slate-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <MapPin className="w-6 h-6 text-sky-400" />
                <div className="text-white font-medium">Gujan-Mestras</div>
                <div className="text-slate-400 text-sm">Bassin d'Arcachon, 33470</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Phone className="w-6 h-6 text-sky-400" />
                <div className="text-white font-medium">+33 6 00 00 00 00</div>
                <div className="text-slate-400 text-sm">Du lundi au samedi, 9h–19h</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mail className="w-6 h-6 text-sky-400" />
                <div className="text-white font-medium">contact@aldimmo.fr</div>
                <div className="text-slate-400 text-sm">Réponse sous 24h</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
