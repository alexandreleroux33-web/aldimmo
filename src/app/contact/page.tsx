'use client'

import { useState } from 'react'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    type: 'information',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Simulate form submission — replace with real API/email integration
    await new Promise((res) => setTimeout(res, 1000))
    setLoading(false)
    setSuccess(true)
  }

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
            <p className="text-slate-300 max-w-xl mx-auto">
              Une question sur nos services ? Vous souhaitez nous confier votre bien ? Nous vous répondons sous 24h.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Envoyez-nous un message</h2>

                {success ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Message envoyé !</h3>
                    <p className="text-slate-600">Merci pour votre message. Nous vous répondrons dans les 24 heures.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom complet *</label>
                        <input
                          type="text"
                          name="nom"
                          value={form.nom}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="Jean Dupont"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="jean@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Téléphone</label>
                        <input
                          type="tel"
                          name="telephone"
                          value={form.telephone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="06 12 34 56 78"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Type de demande *</label>
                        <select
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                        >
                          <option value="information">Demande d'information</option>
                          <option value="devis">Demande de devis</option>
                          <option value="partenariat">Devenir partenaire</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                        placeholder="Décrivez votre demande..."
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 hover:bg-slate-700 disabled:bg-slate-400 text-white font-semibold py-4 rounded-xl transition-colors"
                    >
                      {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                    </button>
                  </form>
                )}
              </div>

              {/* Sidebar info */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Nos coordonnées</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">Adresse</div>
                      <div className="text-slate-600 text-sm">Gujan-Mestras<br />Bassin d'Arcachon<br />33470, France</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">Téléphone</div>
                      <a href="tel:+33600000000" className="text-slate-600 text-sm hover:text-sky-600 transition-colors">+33 6 00 00 00 00</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">Email</div>
                      <a href="mailto:contact@aldimmo.fr" className="text-slate-600 text-sm hover:text-sky-600 transition-colors">contact@aldimmo.fr</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">Horaires</div>
                      <div className="text-slate-600 text-sm">
                        Lundi – Vendredi : 9h – 19h<br />
                        Samedi : 9h – 17h<br />
                        Dimanche : Fermé
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-sky-50 border border-sky-100 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">Réponse rapide garantie</h3>
                  <p className="text-slate-600 text-sm">Nous nous engageons à vous répondre dans les 24 heures ouvrées. Pour les urgences, appelez directement notre ligne.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
