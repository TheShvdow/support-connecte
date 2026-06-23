import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AosDirective } from '../../shared/directives/aos.directive';
import { StoreService } from '../../services/store.service';
import { ContactBody } from '../../models/types';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, AosDirective],
  template: `
    <footer>
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="footer-brand" [aos]="'up'">
            <h3>Support<span style="color:var(--cobalt)">Connecté</span></h3>
            <p>{{ t().footerDesc }}</p>
          </div>
          <div class="footer-col" [aos]="'up'" [aosDelay]="80">
            <h4>{{ t().footerLinks }}</h4>
            <a routerLink="/">{{ t().navHome }}</a>
            <a routerLink="/catalogue">{{ t().navProducts }}</a>
            <a routerLink="/devis">{{ t().navQuote }}</a>
          </div>
          <div class="footer-col" [aos]="'up'" [aosDelay]="160">
            <h4>{{ t().footerContact }}</h4>
            @if (contact) {
              <div class="fc-list">
                @if (contact.email) {
                  <a class="fc-item" [href]="'mailto:' + contact.email">
                    <span class="fc-ico">✉</span>{{ contact.email }}
                  </a>
                }
                @if (contact.phone) {
                  <a class="fc-item" [href]="'tel:' + contact.phone">
                    <span class="fc-ico">📞</span>{{ contact.phone }}
                  </a>
                }
                @if (contact.address) {
                  <span class="fc-item">
                    <span class="fc-ico">📍</span>{{ contact.address }}
                  </span>
                }
                @if (contact.whatsapp) {
                  <a class="fc-item" [href]="contact.whatsapp" target="_blank">
                    <span class="fc-ico">💬</span>WhatsApp
                  </a>
                }
              </div>
            }
          </div>
          <div class="footer-col" [aos]="'up'" [aosDelay]="240">
            <h4>{{ t().footerLegal }}</h4>
            <a>Mentions légales</a>
            <a>Politique de confidentialité</a>
            <a>CGV</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>{{ t().rights }}</span>
          <span>Saly, Sénégal</span>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  store = inject(StoreService);
  t = this.store.t;

  get contact(): ContactBody | null {
    const c = this.store.contenus().find(c =>
      c.id === 'contact' ||
      c.title.toLowerCase() === 'contact'
    );
    return c && typeof c.body === 'object' ? c.body as ContactBody : null;
  }
}
