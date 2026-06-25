import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const { nom, email, tel, message } = await req.json()

    const RESEND_KEY   = Deno.env.get('RESEND_API_KEY')!
    const AGENCY_EMAIL = Deno.env.get('AGENCY_EMAIL')!

    if (!RESEND_KEY || !AGENCY_EMAIL || !nom || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const sendEmail = (to: string, subject: string, html: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Support Connecté <contact@supportconnecte.com>',
          to,
          subject,
          html,
        }),
      })

    const msg = (message as string).replace(/\n/g, '<br>')

    await Promise.all([

      // ── Notification à l'agence
      sendEmail(
        AGENCY_EMAIL,
        `Nouveau contact de ${nom}`,
        `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#0F1729;margin-bottom:20px">Nouveau message de contact</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;width:100px;color:#9aa1ac;font-size:13px">Nom</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${nom}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#9aa1ac;font-size:13px">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee"><a href="mailto:${email}" style="color:#C41A1A">${email}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#9aa1ac;font-size:13px">Téléphone</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee">${tel || '—'}</td></tr>
          </table>
          <div style="margin-top:24px">
            <p style="color:#9aa1ac;font-size:13px;margin-bottom:8px">Message :</p>
            <div style="background:#f7f6f2;padding:16px 20px;border-radius:10px;line-height:1.65;color:#0F1729">${msg}</div>
          </div>
        </div>`,
      ),

      // ── Confirmation au client
      sendEmail(
        email,
        'Votre message a bien été reçu — Support Connecté',
        `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#0F1729;padding:32px 40px;border-radius:12px 12px 0 0">
            <p style="color:#fff;font-size:22px;font-weight:700;margin:0">Support Connecté</p>
            <p style="color:rgba(255,255,255,.5);font-size:13px;margin:4px 0 0">Saly Portudal, Sénégal</p>
          </div>
          <div style="background:#fff;padding:32px 40px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
            <p style="font-size:18px;font-weight:700;color:#0F1729;margin:0 0 12px">Bonjour ${nom},</p>
            <p style="color:#5B6472;line-height:1.65;margin:0 0 24px">
              Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais, sous 24h.
            </p>
            <div style="border-left:3px solid #C41A1A;padding:14px 20px;background:#fdf6f6;border-radius:0 8px 8px 0;color:#5B6472;line-height:1.65;margin-bottom:24px">${msg}</div>
            <p style="color:#5B6472;margin:0">
              À très bientôt,<br>
              <strong style="color:#0F1729">L'équipe Support Connecté</strong>
            </p>
          </div>
        </div>`,
      ),

    ])

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
