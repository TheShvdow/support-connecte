import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './layout/nav/nav.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { SlidePanelComponent } from './shared/components/slide-panel/slide-panel.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { StoreService } from './services/store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, ToastComponent, SlidePanelComponent, ModalComponent],
  template: `
    <app-nav />
    <main>
      <router-outlet />
    </main>
    <app-toast />
    <app-slide-panel />
    <app-modal />
  `,
  styles: [`
    main { padding-top: 70px; min-height: 100vh; }
  `]
})
export class AppComponent {
  store = inject(StoreService);
}
