import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { FooterComponent } from '../../layout/footer/footer.component';
import { AosDirective } from '../../shared/directives/aos.directive';
import { SeoService } from '../../services/seo.service';
import { ContactBody } from '../../models/types';
import { POLES } from '../../data/data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FooterComponent, AosDirective],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  store = inject(StoreService);
  t = this.store.t;
  poles = POLES;
  variants = [0, 1, 2];

  constructor() {
    inject(SeoService).set(
      'Support Connecté — Communication & Impression à Bordeaux',
      'Agence de communication visuelle à Bordeaux : impression grand format, QR codes dynamiques, identité visuelle et solutions digitales. Devis gratuit sous 24h.',
      '/'
    );
  }

  get contact(): ContactBody | null {
    const c = this.store.contenus().find(c =>
      c.id === 'contact' ||
      c.title.toLowerCase() === 'contact'
    );
    return c && typeof c.body === 'object' ? c.body as ContactBody : null;
  }

  stats = [
    { num: '500+', key: 'happy' as const },
    { num: '5',    key: 'expertise' as const },
    { num: '24h',  key: 'response' as const },
    { num: '10+',  key: 'experience' as const },
  ];

  steps = [
    { n: 1, key: 'step1' as const, dk: 'step1d' as const },
    { n: 2, key: 'step2' as const, dk: 'step2d' as const },
    { n: 3, key: 'step3' as const, dk: 'step3d' as const },
    { n: 4, key: 'step4' as const, dk: 'step4d' as const },
  ];

  poleText(pole: typeof POLES[number]) {
    return pole[this.store.lang() as 'fr' | 'en'];
  }
}
