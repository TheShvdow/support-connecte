import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { FooterComponent } from '../../layout/footer/footer.component';
import { AosDirective } from '../../shared/directives/aos.directive';
import { SeoService } from '../../services/seo.service';
import { BannerSlotComponent } from '../../shared/components/banner-slot/banner-slot.component';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [RouterLink, FooterComponent, AosDirective, BannerSlotComponent],
  templateUrl: './catalogue.component.html',
})
export class CatalogueComponent {
  store = inject(StoreService);
  t = this.store.t;

  constructor() {
    inject(SeoService).set(
      'Catalogue produits & services — Support Connecté',
      "Découvrez nos solutions d'impression grand format, QR codes, NFC et communication digitale. Bâches, enseignes, stickers, identité visuelle et plus.",
      '/catalogue'
    );
  }

  categories = computed(() => {
    const all = this.store.lang() === 'fr' ? this.store.t().catAll : this.store.t().catAll;
    const cats = [...new Set(this.store.products().map(p => this.store.lang() === 'fr' ? p.cat : p.catEn))];
    return [all, ...cats];
  });

  filtered = computed(() => {
    const f = this.store.catFilter();
    const all = this.store.t().catAll;
    if (f === all || f === 'Tous' || f === 'All') return this.store.products();
    return this.store.products().filter(p => (this.store.lang() === 'fr' ? p.cat : p.catEn) === f);
  });
}
