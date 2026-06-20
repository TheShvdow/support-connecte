import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [RouterLink, FooterComponent],
  templateUrl: './catalogue.component.html',
})
export class CatalogueComponent {
  store = inject(StoreService);
  t = this.store.t;

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
