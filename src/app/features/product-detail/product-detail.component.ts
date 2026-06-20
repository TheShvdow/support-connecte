import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StoreService } from '../../services/store.service';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, FooterComponent],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent {
  store = inject(StoreService);
  t = this.store.t;

  private route = inject(ActivatedRoute);
  private id = toSignal(this.route.params.pipe(map(p => p['id'])));

  product = computed(() => this.store.products().find(p => p.id === this.id()) ?? null);
}
