import { Component, inject, computed } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { FooterComponent } from '../../layout/footer/footer.component';
import { AosDirective } from '../../shared/directives/aos.directive';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-realisations',
  standalone: true,
  imports: [FooterComponent, AosDirective],
  templateUrl: './realisations.component.html',
})
export class RealisationsComponent {
  store = inject(StoreService);
  t = this.store.t;

  constructor() {
    inject(SeoService).set(
      'Nos réalisations — Support Connecté',
      "Découvrez nos projets d'impression, signalétique, QR codes et communication digitale réalisés pour nos clients.",
      '/realisations'
    );
  }

  categories = computed(() => {
    const all = this.store.lang() === 'fr' ? 'Tous' : 'All';
    const cats = [...new Set(this.store.realisations().map(r => r.cat))];
    return [all, ...cats];
  });

  filtered = computed(() => {
    const f = this.store.realFilter();
    if (f === 'Tous' || f === 'All') return this.store.realisations();
    return this.store.realisations().filter(r => r.cat === f);
  });
}
