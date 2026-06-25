import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './layout/nav/nav.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { AnalyticsService } from './services/analytics.service';

export const routeFade = trigger('routeAnim', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(12px)' }),
      animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
    ], { optional: true }),
  ]),
]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, ToastComponent],
  animations: [routeFade],
  template: `
    <app-nav />
    <main [@routeAnim]="outlet.activatedRouteData['animation'] ?? outlet.isActivated">
      <router-outlet #outlet="outlet" />
    </main>
    <app-toast />
  `,
  styles: [`
    main {
      padding-top: 70px;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }
  `]
})
export class AppComponent {
  constructor() {
    inject(AnalyticsService).init();
  }
}
