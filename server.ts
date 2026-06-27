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

  // ── Redirect supportconnecte.tech → supportconnecte.com
  server.use((req, res, next) => {
    if ((req.headers.host ?? '').includes('supportconnecte.tech')) {
      return res.redirect(301, `https://supportconnecte.com${req.originalUrl}`);
    }
    next();
  });

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
      await transporter.sendMail({
        from:    `"Support Connecté" <${dest}>`,
        to:      dest,          // même adresse : tu envoies à toi-même
        replyTo: email,         // répondre directement au visiteur
        subject: `📩 Nouveau message de ${nom}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
            <h2 style="color:#0f1729;margin-bottom:20px">Nouveau message — Support Connecté</h2>
            <table style="width:100%;border-collapse:collapse;font-size:15px;margin-bottom:20px">
              <tr><td style="padding:8px 0;font-weight:600;color:#555;width:110px">Nom</td><td>${nom}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;color:#555">Email</td><td><a href="mailto:${email}" style="color:#3b6fd4">${email}</a></td></tr>
              ${tel ? `<tr><td style="padding:8px 0;font-weight:600;color:#555">Téléphone</td><td>${tel}</td></tr>` : ''}
            </table>
            <div style="padding:18px;background:#f6f6f8;border-radius:10px;white-space:pre-wrap;font-size:15px;line-height:1.6;color:#2d3748">${message}</div>
            <p style="margin-top:20px;font-size:12px;color:#9aa1ac">Reçu le ${new Date().toLocaleString('fr-FR')} via supportconnecte.com</p>
          </div>`,
        text: `Nom: ${nom}\nEmail: ${email}${tel ? '\nTél: ' + tel : ''}\n\n${message}`,
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
