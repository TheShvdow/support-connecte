import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav id="nav">
      <div class="nav-inner">
        <a class="logo" routerLink="/">
          <div class="logo-icon"><div class="logo-ring"></div><div class="logo-dot"></div></div>
          <div class="logo-text">Support<span>Connecté</span></div>
        </a>
        <div class="nav-links">
          @for (link of links; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact: link.path === '/'}">
              {{ link.path === '/' ? t().navHome : link.path === '/catalogue' ? t().navProducts
                : link.path === '/realisations' ? t().navWork : link.path === '/devis' ? t().navQuote : t().navAdmin }}
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
      @for (link of links; track link.path) {
        <a [routerLink]="link.path" (click)="mobileOpen.set(false)">
          {{ link.path === '/' ? t().navHome : link.path === '/catalogue' ? t().navProducts
            : link.path === '/realisations' ? t().navWork : link.path === '/devis' ? t().navQuote : t().navAdmin }}
        </a>
      }
      <a routerLink="/devis" class="mobile-cta" (click)="mobileOpen.set(false)">{{ t().ctaQuote }}</a>
    </div>
  `
})
export class NavComponent {
  store = inject(StoreService);
  t = this.store.t;
  mobileOpen = signal(false);

  links = [
    { path: '/' }, { path: '/catalogue' }, { path: '/realisations' },
    { path: '/devis' }, { path: '/admin' }
  ];
}
