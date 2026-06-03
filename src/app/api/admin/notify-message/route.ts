import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  const { proprietaire_prenom, proprietaire_email, proprietaire_telephone } = await request.json()

  if (!proprietaire_email && !proprietaire_telephone) {
    return NextResponse.json({ error: 'email ou téléphone requis' }, { status: 400 })
  }

  const errors: string[] = []
  const results: Record<string, boolean> = {}

  // ── Email via Resend ────────────────────────────────────────────────────────
  if (proprietaire_email && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const fromName = process.env.RESEND_FROM_NAME ?? 'ALD Immo'
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@aldimmo.fr'
      const dashboardUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/messages`
        : 'https://aldimmo.fr/dashboard/messages'

      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: proprietaire_email,
        subject: 'Vous avez un nouveau message de l\'équipe ALD Immo',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#2D2926">
            <div style="background:#5B8C6B;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="margin:0;color:white;font-size:20px">ALD Immo</h1>
            </div>
            <div style="background:#FAF8F5;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(45,41,38,0.08)">
              <p style="margin:0 0 16px">Bonjour ${proprietaire_prenom ?? ''},</p>
              <p style="margin:0 0 24px">Vous avez reçu un nouveau message de l'équipe ALD Immo. Connectez-vous à votre espace propriétaire pour le lire et y répondre.</p>
              <a href="${dashboardUrl}" style="display:inline-block;background:#5B8C6B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
                Lire le message →
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:#A89E98">
                Si vous ne souhaitez plus recevoir ces notifications, contactez-nous à contact@aldimmo.fr
              </p>
            </div>
          </div>
        `,
      })
      results.email = true
    } catch (err: unknown) {
      errors.push(`Email: ${err instanceof Error ? err.message : String(err)}`)
      results.email = false
    }
  } else {
    results.email = false
  }

  // ── SMS via Twilio ──────────────────────────────────────────────────────────
  if (proprietaire_telephone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    try {
      const twilio = require('twilio')
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      await client.messages.create({
        body: 'ALD Immo : vous avez un nouveau message. Connectez-vous sur votre espace propriétaire : aldimmo.fr/dashboard/messages',
        from: process.env.TWILIO_FROM_NUMBER,
        to: proprietaire_telephone,
      })
      results.sms = true
    } catch (err: unknown) {
      errors.push(`SMS: ${err instanceof Error ? err.message : String(err)}`)
      results.sms = false
    }
  } else {
    results.sms = false
  }

  return NextResponse.json({ ok: true, results, errors: errors.length ? errors : undefined })
}
