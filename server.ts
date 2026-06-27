import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import nodemailer from 'nodemailer';
import bootstrap from './src/main.server';

// ── Transporter Hostinger (config au démarrage, utilisé à chaque requête)
const transporter = nodemailer.createTransport({
  host:   'smtp.hostinger.com',
  port:   465,
  secure: true, // SSL
  auth: {
    user: process.env['SMTP_USER'] ?? '', // contact@supportconnecte.com
    pass: process.env['SMTP_PASS'] ?? '', // mot de passe de la boîte Hostinger
  },
});

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');
  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);
  server.use(express.json());


  // ── POST /api/contact
  server.post('/api/contact', async (req, res) => {
    const { nom, email, tel, message } = req.body ?? {};

    if (!nom || !email || !message) {
      res.status(400).json({ ok: false, error: 'Champs requis manquants.' });
      return;
    }

    const dest = process.env['SMTP_USER'] ?? '';

    if (!dest || !process.env['SMTP_PASS']) {
      console.warn('[mail] Variables SMTP_USER / SMTP_PASS non définies — email non envoyé.');
      res.json({ ok: true, warn: 'smtp_not_configured' });
      return;
    }

    try {
      const escapeHtml = (s: string) =>
        String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const eNom = escapeHtml(nom);
      const eEmail = escapeHtml(email);
      const eTel = tel ? escapeHtml(tel) : '';
      const eMessage = escapeHtml(message).replace(/\n/g, '<br>');
      const recu = new Date().toLocaleString('fr-FR', {
        dateStyle: 'long', timeStyle: 'short',
      });

      await transporter.sendMail({
        from:    `"Support Connecté" <${dest}>`,
        to:      dest,          // même adresse : tu envoies à toi-même
        replyTo: email,         // répondre directement au visiteur
        subject: `📩 Nouveau message de ${nom}`,
        html: `
<!doctype html>
<html lang="fr">
<body style="margin:0;padding:0;background:#eef1f6;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

          <!-- Header -->
          <tr>
            <td style="background:#0f1729;background-image:linear-gradient(135deg,#0f1729 0%,#1e3a8a 100%);border-radius:16px 16px 0 0;padding:32px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-block;background:rgba(255,255,255,.12);border-radius:999px;padding:5px 14px;font-size:12px;font-weight:600;letter-spacing:.5px;color:#dbe4ff;text-transform:uppercase;">Nouveau message</div>
                    <h1 style="margin:16px 0 4px;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">Support Connecté</h1>
                    <p style="margin:0;color:#9db3e8;font-size:14px;">Demande reçue depuis le formulaire de contact</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px 36px 12px;">

              <!-- Coordonnées -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;color:#0f1729;">
                <tr>
                  <td style="padding:0 0 16px;border-bottom:1px solid #eef1f6;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:.6px;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Nom</div>
                    <div style="font-size:16px;font-weight:600;">${eNom}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 0;border-bottom:1px solid #eef1f6;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:.6px;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Email</div>
                    <a href="mailto:${eEmail}" style="font-size:16px;font-weight:600;color:#2563eb;text-decoration:none;">${eEmail}</a>
                  </td>
                </tr>
                ${eTel ? `
                <tr>
                  <td style="padding:16px 0;border-bottom:1px solid #eef1f6;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:.6px;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Téléphone</div>
                    <a href="tel:${eTel}" style="font-size:16px;font-weight:600;color:#0f1729;text-decoration:none;">${eTel}</a>
                  </td>
                </tr>` : ''}
              </table>

              <!-- Message -->
              <div style="font-size:11px;font-weight:700;letter-spacing:.6px;color:#94a3b8;text-transform:uppercase;margin:24px 0 10px;">Message</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f6f8fc;border-left:3px solid #2563eb;border-radius:0 10px 10px 0;padding:18px 20px;font-size:15px;line-height:1.65;color:#334155;">${eMessage}</td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                <tr>
                  <td style="border-radius:10px;background:#2563eb;">
                    <a href="mailto:${eEmail}?subject=Re%3A%20votre%20demande%20%E2%80%94%20Support%20Connect%C3%A9" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Répondre à ${eNom}</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#ffffff;border-radius:0 0 16px 16px;padding:20px 36px 28px;border-top:1px solid #eef1f6;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                Reçu le ${recu} · via <a href="https://supportconnecte.com" style="color:#94a3b8;">supportconnecte.com</a><br>
                Répondez directement à cet email pour contacter le visiteur.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        text: `Nouveau message — Support Connecté\n\nNom: ${nom}\nEmail: ${email}${tel ? '\nTéléphone: ' + tel : ''}\n\nMessage:\n${message}\n\nReçu le ${recu} via supportconnecte.com`,
      });

      res.json({ ok: true });
    } catch (err: any) {
      console.error('[mail] Erreur envoi:', err.message);
      res.status(500).json({ ok: false, error: 'Erreur lors de l\'envoi.' });
    }
  });

  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, { maxAge: '1y', index: 'index.html' }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 3000;
  app().listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
