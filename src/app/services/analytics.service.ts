import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

declare function gtag(...args: unknown[]): void;

const GA_ID = 'G-4GDE327F3Q';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private router     = inject(Router);

  init() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    ).subscribe(e => {
      gtag('event', 'page_view', {
        page_path:     e.urlAfterRedirects,
        page_location: window.location.href,
        send_to:       GA_ID,
      });
    });
  }

  event(name: string, params: Record<string, unknown> = {}) {
    if (!isPlatformBrowser(this.platformId)) return;
    gtag('event', name, { ...params, send_to: GA_ID });
  }
}
