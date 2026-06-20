import { Component, inject } from '@angular/core';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast" [class.show]="store.toastVisible()">
      {{ store.toastMsg() }}
    </div>
  `
})
export class ToastComponent {
  store = inject(StoreService);
}
