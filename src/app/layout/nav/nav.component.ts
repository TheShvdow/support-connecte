import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav id="nav">
      <div class="nav-inner">
        <a class="logo" routerLink="/">
          <img src="/logo-full.png" alt="Support Connecté" class="logo-img">
        </a>
        <div class="nav-links">
          @for (link of publicLinks; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact: link.path === '/'}">
              {{ link.label }}
            </a>
          }
        </div>
        <div class="nav-right">
          <button class="lang-btn" (click)="store.toggleLang()">{{ store.lang() === 'fr' ? 'EN' : 'FR' }}</button>
          <a class="cta-nav" routerLink="/devis">{{ t().ctaQuote }}</a>
          <button class="hamburger" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
    <div class="mobile-nav" [class.open]="mobileOpen()">
      @for (link of publicLinks; track link.path) {
        <a [routerLink]="link.path" (click)="mobileOpen.set(false)">{{ link.label }}</a>
      }
      <a routerLink="/devis" class="mobile-cta" (click)="mobileOpen.set(false)">{{ t().ctaQuote }}</a>
    </div>
  `
})
export class NavComponent {
  store = inject(StoreService);
  auth = inject(AuthService);
  t = this.store.t;
  mobileOpen = signal(false);

  get publicLinks() {
    return [
      { path: '/', label: this.t().navHome },
      { path: '/catalogue', label: this.t().navProducts },
      // { path: '/realisations', label: this.t().navRealisations },
      // { path: '/qr', label: this.t().navQr },
      { path: '/devis', label: this.t().navQuote },
      { path: '/contact', label: this.store.lang() === 'fr' ? 'Contact' : 'Contact' },
    ];
  }
}
