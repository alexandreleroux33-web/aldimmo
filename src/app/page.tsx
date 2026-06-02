import Link from 'next/link'
import { Home, Shield, TrendingUp, Star, Users, ArrowRight, MapPin, Phone, Mail, Clock, HeartHandshake, CheckCircle } from 'lucide-react'
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
    { icon: HeartHandshake, title: 'Service personnalisé', desc: 'Un interlocuteur dédié qui connaît votre bien et vos attentes.' },
    { icon: Clock, title: 'Disponible 7j/7', desc: 'Nous sommes joignables tous les jours pour vous et vos locataires.' },
    { icon: TrendingUp, title: 'Revenus optimisés', desc: 'Tarification intelligente et gestion proactive pour rentabiliser au mieux votre bien.' },
  ]

  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex items-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #FAF8F5 0%, #F5EDE0 40%, #EDE3D0 70%, #F2EBE0 100%)' }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute top-0 right-0 w-[55%] h-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 80% 30%, #DFC48A 0%, transparent 60%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-[40%] h-[50%] opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 20% 80%, #7DAF90 0%, transparent 60%)' }}
          />

          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, #2D2926 0px, #2D2926 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #2D2926 0px, #2D2926 1px, transparent 1px, transparent 60px)',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16 lg:pt-32 lg:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* ── Left : texte ── */}
              <div>
                {/* Pill badge */}
                <div
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full mb-8 font-medium"
                  style={{ background: 'rgba(91,140,107,0.12)', color: '#4A7559', border: '1px solid rgba(91,140,107,0.25)' }}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Bordeaux &amp; ses environs
                </div>

                {/* Headline */}
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] mb-6 tracking-tight"
                  style={{ color: '#2D2926' }}
                >
                  Votre bien,<br />
                  <span style={{ color: '#5B8C6B' }}>géré avec soin.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg leading-relaxed mb-10 max-w-lg" style={{ color: '#7A6E68' }}>
                  ALD Immo prend en charge la gestion locative complète de votre bien à Bordeaux et ses environs. Vous profitez des revenus, nous gérons tout le reste.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
                    style={{ background: '#5B8C6B' }}
                  >
                    Demander un devis gratuit <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold transition-all hover:shadow-sm"
                    style={{ background: 'rgba(45,41,38,0.06)', color: '#2D2926', border: '1.5px solid rgba(45,41,38,0.15)' }}
                  >
                    Espace propriétaire
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-5">
                  {[
                    'Premier entretien gratuit',
                    'Sans engagement',
                    'Réponse sous 24h',
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-1.5" style={{ color: '#7A6E68' }}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#5B8C6B' }} />
                      <span className="text-sm">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right : composition décorative ── */}
              <div className="relative hidden lg:block">
                {/* Carte principale */}
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl"
                  style={{ background: 'linear-gradient(145deg, #EDE3D0 0%, #DFC48A 50%, #C8A96E 100%)', aspectRatio: '4/5' }}
                >
                  {/* Overlay texture sable/eau */}
                  <div
                    className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35) 0%, transparent 50%), radial-gradient(ellipse at 75% 80%, rgba(91,140,107,0.2) 0%, transparent 45%)' }}
                  />

                  {/* Formes abstraites évocatrices */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-2/5"
                    style={{ background: 'linear-gradient(to top, rgba(91,140,107,0.3), transparent)' }}
                  />
                  {/* Cercle soleil/lune */}
                  <div
                    className="absolute top-12 right-12 w-28 h-28 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.25)', boxShadow: 'inset 0 0 40px rgba(255,200,80,0.3)' }}
                  />
                  {/* Lignes horizon */}
                  {[35, 42, 49].map((top) => (
                    <div
                      key={top}
                      className="absolute left-8 right-8 h-px"
                      style={{ top: `${top}%`, background: 'rgba(255,255,255,0.2)' }}
                    />
                  ))}
                  {/* Vague basse */}
                  <svg
                    className="absolute bottom-0 left-0 right-0 w-full"
                    viewBox="0 0 400 80"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,40 C80,10 160,70 240,40 C320,10 360,50 400,35 L400,80 L0,80 Z"
                      fill="rgba(91,140,107,0.25)"
                    />
                    <path
                      d="M0,55 C60,30 140,75 220,50 C300,25 360,60 400,45 L400,80 L0,80 Z"
                      fill="rgba(91,140,107,0.15)"
                    />
                  </svg>
                </div>

                {/* Carte flottante : bilan mensuel */}
                <div
                  className="absolute -left-10 top-12 rounded-2xl p-5 shadow-xl w-52"
                  style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.08)' }}
                >
                  <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#A89E98' }}>Bilan juin</div>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#2D2926' }}>2 840 €</div>
                  <div className="text-xs mb-3" style={{ color: '#7A6E68' }}>Revenus nets versés</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#5B8C6B' }} />
                    <span className="text-xs" style={{ color: '#5B8C6B' }}>+12% vs mai</span>
                  </div>
                </div>

                {/* Carte flottante : prochain séjour */}
                <div
                  className="absolute -right-8 bottom-16 rounded-2xl p-5 shadow-xl w-48"
                  style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.08)' }}
                >
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#A89E98' }}>Prochain séjour</div>
                  <div className="text-sm font-bold mb-1" style={{ color: '#2D2926' }}>Famille Martin</div>
                  <div className="text-xs" style={{ color: '#7A6E68' }}>Check-in 14 juil.</div>
                  <div
                    className="mt-3 text-xs px-2 py-1 rounded-full inline-block font-medium"
                    style={{ background: 'rgba(91,140,107,0.12)', color: '#4A7559' }}
                  >
                    Confirmé ✓
                  </div>
                </div>

                {/* Étoiles flottantes */}
                <div
                  className="absolute top-1/2 -right-6 -translate-y-1/2 rounded-2xl p-4 shadow-lg"
                  style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.08)' }}
                >
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#DFC48A' }} />
                    ))}
                  </div>
                  <div className="text-xs font-semibold" style={{ color: '#2D2926' }}>5 / 5</div>
                  <div className="text-xs" style={{ color: '#A89E98' }}>Avis locataires</div>
                </div>
              </div>

            </div>
          </div>

          {/* Wave de transition vers la section suivante */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none" style={{ display: 'block' }}>
              <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#F0EBE3" />
            </svg>
          </div>
        </section>

        {/* ── ENGAGEMENTS ──────────────────────────────────────────────── */}
        <section style={{ background: '#F0EBE3' }} className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {engagements.map((e) => (
                <div key={e.title} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(91,140,107,0.15)' }}>
                    <e.icon className="w-6 h-6" style={{ color: '#5B8C6B' }} />
                  </div>
                  <div className="text-lg font-bold" style={{ color: '#2D2926' }}>{e.title}</div>
                  <div className="text-sm max-w-xs" style={{ color: '#7A6E68' }}>{e.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES ─────────────────────────────────────────────────── */}
        <section id="services" className="bg-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#2D2926' }}>Nos services</h2>
              <p className="max-w-xl mx-auto" style={{ color: '#7A6E68' }}>Une offre complète pour que votre investissement vous rapporte sans contrainte.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl p-8 transition-all hover:shadow-md hover:-translate-y-1"
                  style={{ background: '#FAF8F5', border: '1px solid #EDE8E3' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(91,140,107,0.12)' }}>
                    <s.icon className="w-6 h-6" style={{ color: '#5B8C6B' }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#2D2926' }}>{s.title}</h3>
                  <p className="leading-relaxed" style={{ color: '#7A6E68' }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────────── */}
        <section id="comment" style={{ background: '#FAF8F5' }} className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#2D2926' }}>Comment ça marche ?</h2>
              <p className="max-w-xl mx-auto" style={{ color: '#7A6E68' }}>De la première rencontre au versement mensuel, nous vous accompagnons à chaque étape.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div key={step.num} className="relative">
                  <div className="text-6xl font-black mb-4 leading-none" style={{ color: '#EDE3D0' }}>{step.num}</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#2D2926' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#7A6E68' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TÉMOIGNAGES ──────────────────────────────────────────────── */}
        <section className="bg-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#2D2926' }}>Ce que disent nos propriétaires</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  text: '"Depuis que ALD Immo gère mon appartement, je n\'ai plus à me soucier de rien. Mes revenus ont augmenté et les locataires sont ravis. Je recommande vivement."',
                  name: 'Jean D.',
                  role: 'Propriétaire — Appartement à Bordeaux',
                },
                {
                  text: '"Le service est impeccable, l\'équipe est réactive et professionnelle. Mon bien est parfaitement entretenu et les bilans mensuels sont très clairs."',
                  name: 'Sophie M.',
                  role: 'Propriétaire — Maison aux environs de Bordeaux',
                },
              ].map((t) => (
                <div key={t.name} className="rounded-2xl p-8" style={{ background: '#FAF8F5', border: '1px solid #EDE8E3' }}>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#DFC48A' }} />)}
                  </div>
                  <p className="italic mb-6 leading-relaxed" style={{ color: '#5C524C' }}>{t.text}</p>
                  <div className="font-semibold" style={{ color: '#2D2926' }}>{t.name}</div>
                  <div className="text-sm" style={{ color: '#A89E98' }}>{t.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────── */}
        <section
          className="py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #3A5E46 0%, #5B8C6B 60%, #4A7559 100%)' }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Devenez partenaire ALD Immo</h2>
            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Confiez-nous votre bien et bénéficiez d'un accompagnement sur-mesure à Bordeaux et ses environs. Premier entretien gratuit et sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                style={{ background: '#FAF8F5', color: '#3A5E46' }}
              >
                Prendre contact <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="tel:+33600000000"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}
              >
                <Phone className="w-4 h-4" /> Nous appeler
              </Link>
            </div>
          </div>
        </section>

        {/* ── CONTACT RAPIDE ───────────────────────────────────────────── */}
        <section style={{ background: '#2D2926' }} className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { icon: MapPin, main: 'Bordeaux et environs', sub: 'Gironde, France' },
                { icon: Phone, main: '+33 6 00 00 00 00', sub: 'Du lundi au samedi, 9h–19h' },
                { icon: Mail, main: 'contact@aldimmo.fr', sub: 'Réponse sous 24h' },
              ].map(({ icon: Icon, main, sub }) => (
                <div key={main} className="flex flex-col items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: '#7DAF90' }} />
                  <div className="font-medium text-white">{main}</div>
                  <div className="text-sm" style={{ color: '#7A6E68' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
