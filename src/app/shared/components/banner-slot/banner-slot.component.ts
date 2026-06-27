import { Component, computed, inject, input } from '@angular/core';
import { StoreService } from '../../../services/store.service';
import { BannerPosition } from '../../../models/types';
import { AdsenseComponent } from '../adsense/adsense.component';

@Component({
  selector: 'app-banner-slot',
  standalone: true,
  imports: [AdsenseComponent],
  template: `
    @if (houseBanners().length > 0) {
      <div class="bs-wrap">
        <span class="bs-label">Publicité</span>
        @for (b of houseBanners(); track b.id) {
          @if (b.link) {
            <a class="bs-link" [href]="b.link" target="_blank" rel="noopener" [attr.aria-label]="b.title">
              <img class="bs-img" [src]="b.imageUrl" [alt]="b.title" loading="lazy">
            </a>
          } @else {
            <div class="bs-link">
              <img class="bs-img" [src]="b.imageUrl" [alt]="b.title" loading="lazy">
            </div>
          }
        }
      </div>
    } @else if (adsenseSlot()) {
      <div class="bs-wrap">
        <span class="bs-label">Publicité</span>
        <app-adsense [slot]="adsenseSlot()" />
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .bs-wrap {
      max-width: 970px;
      margin: clamp(24px, 4vw, 40px) auto;
      padding: 0 var(--pad, 24px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .bs-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--muted, #9aa1ac);
      align-self: flex-start;
    }
    .bs-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      background: #fff;
      border: 1px solid rgba(15,23,41,.06);
      border-radius: var(--r, 12px);
      box-shadow: var(--shadow, 0 4px 24px rgba(15,23,41,.1));
      overflow: hidden;
      padding: 12px;
      transition: transform .15s, box-shadow .15s;
    }
    a.bs-link:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(15,23,41,.14); }
    .bs-img {
      display: block;
      width: auto;
      max-width: 100%;
      max-height: 120px;
      height: auto;
      object-fit: contain;
    }
    @media (max-width: 600px) {
      .bs-img { max-height: 90px; }
    }
  `],
})
export class BannerSlotComponent {
  private store = inject(StoreService);

  position = input.required<BannerPosition>();

  houseBanners = computed(() => this.store.bannersFor(this.position()));

  // Identifiant de l'emplacement AdSense par position (à renseigner depuis le tableau de bord AdSense).
  private adSlots: Record<BannerPosition, string> = {
    footer: '',
    catalogue: '',
  };

  adsenseSlot = computed(() => this.adSlots[this.position()] ?? '');
}
