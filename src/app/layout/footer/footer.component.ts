import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { ContactBody } from '../../models/types';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer>
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>Support<span style="color:var(--cobalt)">Connecté</span></h3>
            <p>{{ t().footerDesc }}</p>
          </div>
          <div class="footer-col">
            <h4>{{ t().footerLinks }}</h4>
            <a routerLink="/">{{ t().navHome }}</a>
            <a routerLink="/catalogue">{{ t().navProducts }}</a>
            <a routerLink="/devis">{{ t().navQuote }}</a>
          </div>
          <div class="footer-col">
            <h4>{{ t().footerContact }}</h4>
            @if (contact) {
              @if (contact.email) { <a [href]="'mailto:' + contact.email">{{ contact.email }}</a> }
              @if (contact.phone) { <a [href]="'tel:' + contact.phone">{{ contact.phone }}</a> }
              @if (contact.address) { <span>{{ contact.address }}</span> }
              @if (contact.whatsapp) { <a [href]="contact.whatsapp" target="_blank">WhatsApp</a> }
            } @else {
              <a>contact&#64;supportconnecte.fr</a>
              <a>+33 5 00 00 00 00</a>
              <a>WhatsApp</a>
            }
          </div>
          <div class="footer-col">
            <h4>{{ t().footerLegal }}</h4>
            <a>Mentions légales</a>
            <a>Politique de confidentialité</a>
            <a>CGV</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>{{ t().rights }}</span>
          <span>Bordeaux, France</span>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  store = inject(StoreService);
  t = this.store.t;

  get contact(): ContactBody | null {
    const c = this.store.contenus().find(c => c.id === 'contact');
    return c && typeof c.body === 'object' ? c.body as ContactBody : null;
  }
}
