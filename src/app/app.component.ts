import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './layout/nav/nav.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, ToastComponent],
  template: `
    <app-nav />
    <main>
      <router-outlet />
    </main>
    <app-toast />
  `,
  styles: [`
    main { padding-top: 70px; min-height: 100vh; }
  `]
})
export class AppComponent {}
