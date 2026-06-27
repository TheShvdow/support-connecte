import { Component, Input, afterNextRender } from '@angular/core';
import { environment } from '../../../../environments/environment';

declare global {
  interface Window { adsbygoogle?: unknown[]; }
}

@Component({
  selector: 'app-adsense',
  standalone: true,
  template: `
    @if (client) {
      <ins class="adsbygoogle"
           style="display:block"
           [attr.data-ad-client]="client"
           [attr.data-ad-slot]="slot"
           [attr.data-ad-format]="format"
           data-full-width-responsive="true"></ins>
    }
  `,
  styles: [`:host { display: block; width: 100%; }`],
})
export class AdsenseComponent {
  /** Identifiant de l'emplacement publicitaire AdSense (data-ad-slot). */
  @Input() slot = '';
  /** Format de l'annonce (auto par défaut). */
  @Input() format = 'auto';

  readonly client = environment.adsenseClient;

  constructor() {
    // Le push ne doit s'exécuter que côté navigateur, jamais pendant le rendu SSR.
    afterNextRender(() => {
      if (!this.client) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Le script AdSense n'est pas encore chargé ou est bloqué — on ignore silencieusement.
      }
    });
  }
}
