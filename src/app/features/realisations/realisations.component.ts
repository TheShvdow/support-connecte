import { Component, inject, computed } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-realisations',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './realisations.component.html',
})
export class RealisationsComponent {
  store = inject(StoreService);
  t = this.store.t;

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
