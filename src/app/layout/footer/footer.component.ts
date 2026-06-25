import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { ContactBody } from '../../models/types';
import {
  LucideMail, LucidePhone, LucideMapPin,
  LucideMessageCircle, LucideArrowUpRight
} from '@lucide/angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LucideMail, LucidePhone, LucideMapPin, LucideMessageCircle, LucideArrowUpRight],
  styles: [`
    :host { display: block; }

    footer {
      background: #0b111f;
      color: #fff;
      position: relative;
      overflow: hidden;
    }

    /* Dot texture */
    footer::before {
      content: '';
      position: absolute; inset: 0;
      background-image: radial-gradient(circle, rgba(255,255,255,.04) 1px, transparent 1px);
      background-size: 28px 28px;
      pointer-events: none; z-index: 0;
    }

    /* ── CTA TOP ── */
    .ft-cta {
      position: relative; z-index: 1;
      border-bottom: 1px solid rgba(255,255,255,.07);
      padding: clamp(40px,5vw,64px) clamp(18px,5vw,48px);
      max-width: 1240px; margin: 0 auto;
      display: flex; align-items: center;
      justify-content: space-between; gap: 32px;
    }
    .ft-cta-label {
      font-size: 11px; font-weight: 700; letter-spacing: .14em;
      text-transform: uppercase; color: #C41A1A;
      display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
    }
    .ft-cta-label::before {
      content: ''; display: block;
      width: 24px; height: 2px; background: #C41A1A; flex-shrink: 0;
    }
    .ft-cta-title {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-weight: 700; font-size: clamp(28px, 3.5vw, 52px);
      letter-spacing: -.03em; line-height: .95;
      color: #fff; margin: 0;
    }
    .ft-cta-btn {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 15px 28px; border-radius: 999px;
      background: #C41A1A; color: #fff;
      font-weight: 700; font-size: 15px;
      text-decoration: none; white-space: nowrap; flex-shrink: 0;
      transition: background .2s, transform .2s;
    }
    .ft-cta-btn:hover { background: #a01414; transform: translateY(-1px); }
    .ft-cta-btn svg { display: block !important; width: 16px !important; height: 16px !important; }

    /* ── MAIN GRID ── */
    .ft-main {
      position: relative; z-index: 1;
      max-width: 1240px; margin: 0 auto;
      padding: clamp(48px,6vw,72px) clamp(18px,5vw,48px);
      display: grid;
      grid-template-columns: 1.8fr 1fr 1.4fr 1fr;
      gap: clamp(32px,4vw,64px);
    }

    /* Brand */
    .ft-brand { display: flex; flex-direction: column; gap: 20px; align-items: flex-start; align-content: flex-start; }
    .ft-logo { height: 120px; width: auto; display: block; object-fit: contain; }
    .ft-desc {
      font-size: 18px; line-height: 1.7;
      color: rgba(255,255,255,.4); max-width: 260px; margin: 0;
    }
    .ft-loc {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; color: rgba(255,255,255,.25); font-weight: 500;
    }
    .ft-loc svg { display: block !important; width: 11px !important; height: 11px !important; }

    /* Columns */
    .ft-col { display: flex; flex-direction: column; }
    .ft-col-title {
      font-size: 10.5px; font-weight: 700; letter-spacing: .13em;
      text-transform: uppercase; color: rgba(255,255,255,.28);
      margin: 0 0 20px; padding-bottom: 14px;
      border-bottom: 1px solid rgba(255,255,255,.07);
    }
    .ft-col-links { display: flex; flex-direction: column; gap: 2px; }
    .ft-col-links a {
      font-size: 14px; color: rgba(255,255,255,.5);
      text-decoration: none; padding: 5px 0; transition: color .15s;
    }
    .ft-col-links a:hover { color: #fff; }

    /* Contact items */
    .ft-contact { display: flex; flex-direction: column; gap: 6px; }
    .ft-ci {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; padding: 5px 0; transition: color .15s;
      color: rgba(255,255,255,.5); font-size: 13.5px;
    }
    .ft-ci:hover { color: rgba(255,255,255,.9); }
    .ft-ci-ico {
      width: 26px; height: 26px; border-radius: 7px;
      background: rgba(255,255,255,.06); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .ft-ci-ico svg { display: block !important; width: 13px !important; height: 13px !important; }
    .ft-ci span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* ── BOTTOM BAR ── */
    .ft-bar {
      position: relative; z-index: 1;
      border-top: 1px solid rgba(255,255,255,.07);
      max-width: 1240px; margin: 0 auto;
      padding: 20px clamp(18px,5vw,48px);
      display: flex; justify-content: space-between; align-items: center;
      font-size: 12.5px; color: rgba(255,255,255,.22);
    }
    .ft-bar-right {
      display: flex; align-items: center; gap: 6px;
    }
    .ft-bar-right svg { display: block !important; width: 11px !important; height: 11px !important; }

    /* Responsive */
    @media (max-width: 900px) {
      .ft-cta { flex-direction: column; align-items: flex-start; gap: 24px; }
      .ft-main { grid-template-columns: 1fr 1fr; }
      .ft-brand { grid-column: span 2; }
    }
    @media (max-width: 540px) {
      .ft-main { grid-template-columns: 1fr; }
      .ft-brand { grid-column: span 1; }
    }
  `],
  template: `
    <footer>

      <!-- CTA top -->
      <div class="ft-cta">
        <div>
          <div class="ft-cta-label">{{ store.lang() === 'fr' ? 'Démarrez maintenant' : 'Get started' }}</div>
          <h2 class="ft-cta-title">
            {{ store.lang() === 'fr' ? 'Vous avez un projet ?' : 'Got a project in mind?' }}
          </h2>
        </div>
        <a routerLink="/devis" class="ft-cta-btn">
          {{ t().ctaQuote }}
          <svg lucideArrowUpRight />
        </a>
      </div>

      <!-- Main grid -->
      <div class="ft-main">

        <!-- Brand -->
        <div class="ft-brand">
          <img src="/logo_footer.png" alt="Support Connecté" class="ft-logo">
          <p class="ft-desc">{{ t().footerDesc }}</p>
          <span class="ft-loc">
            <svg lucideMapPin />
            Saly Niakh Niakhal, Sénégal
          </span>
        </div>

        <!-- Navigation -->
        <div class="ft-col">
          <div class="ft-col-title">{{ t().footerLinks }}</div>
          <nav class="ft-col-links">
            <a routerLink="/">{{ t().navHome }}</a>
            <a routerLink="/catalogue">{{ t().navProducts }}</a>
            <a routerLink="/devis">{{ t().navQuote }}</a>
            <a routerLink="/realisations">{{ t().navWork }}</a>
            <a routerLink="/contact">{{ store.lang() === 'fr' ? 'Contact' : 'Contact' }}</a>
          </nav>
        </div>

        <!-- Contact -->
        <div class="ft-col">
          <div class="ft-col-title">{{ t().footerContact }}</div>
          @if (contact) {
            <div class="ft-contact">
              @if (contact.email) {
                <a class="ft-ci" [href]="'mailto:' + contact.email">
                  <span class="ft-ci-ico"><svg lucideMail /></span>
                  <span>{{ contact.email }}</span>
                </a>
              }
              @if (contact.phone) {
                <a class="ft-ci" [href]="'tel:' + contact.phone">
                  <span class="ft-ci-ico"><svg lucidePhone /></span>
                  <span>{{ contact.phone }}</span>
                </a>
              }
              @if (contact.address) {
                <span class="ft-ci">
                  <span class="ft-ci-ico"><svg lucideMapPin /></span>
                  <span>{{ contact.address }}</span>
                </span>
              }
              @if (contact.whatsapp) {
                <a class="ft-ci" [href]="contact.whatsapp" target="_blank">
                  <span class="ft-ci-ico"><svg lucideMessageCircle /></span>
                  <span>WhatsApp</span>
                </a>
              }
            </div>
          }
        </div>

        <!-- Légal -->
        <div class="ft-col">
          <div class="ft-col-title">{{ t().footerLegal }}</div>
          <nav class="ft-col-links">
            <a>Mentions légales</a>
            <a>Politique de confidentialité</a>
            <a>CGV</a>
          </nav>
        </div>

      </div>

      <!-- Bottom bar -->
      <div class="ft-bar">
        <span>{{ t().rights }}</span>
        <span class="ft-bar-right">
          <svg lucideMapPin />
          Saly, Sénégal
        </span>
      </div>

    </footer>
  `
})
export class FooterComponent {
  store = inject(StoreService);
  t = this.store.t;

  get contact(): ContactBody | null {
    const c = this.store.contenus().find(c =>
      c.id === 'contact' || c.title.toLowerCase() === 'contact'
    );
    return c && typeof c.body === 'object' ? c.body as ContactBody : null;
  }
}
