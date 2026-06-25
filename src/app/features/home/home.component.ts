import { Component, inject, AfterViewInit, OnDestroy, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { FooterComponent } from '../../layout/footer/footer.component';
import { AosDirective } from '../../shared/directives/aos.directive';
import { SeoService } from '../../services/seo.service';
import { GsapService } from '../../services/gsap.service';
import { ParticlesService } from '../../services/particles.service';
import { CardThreeService } from '../../services/card-three.service';
import { ContactBody } from '../../models/types';
import { POLES } from '../../data/data';
import {
  LucidePhone, LucideMessageCircle, LucideMail,
  LucideArrowRight, LucideMapPin, LucideClock
} from '@lucide/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FooterComponent, AosDirective,
    LucidePhone, LucideMessageCircle, LucideMail,
    LucideArrowRight, LucideMapPin, LucideClock],
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChildren('cardCanvas') private cardCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  store = inject(StoreService);
  private gsap = inject(GsapService);
  private particles = inject(ParticlesService);
  private cardThree = inject(CardThreeService);
  t = this.store.t;
  poles = POLES;
  variants = [0, 1, 2];

  constructor() {
    inject(SeoService).set(
      'Support Connecté — Communication & Impression à Saly',
      'Agence de communication visuelle à Saly : impression grand format, QR codes dynamiques, identité visuelle et solutions digitales. Devis gratuit sous 24h.',
      '/'
    );
  }

  ngAfterViewInit() {
    // Three.js particles
    if (this.canvasRef?.nativeElement) {
      this.particles.init(this.canvasRef.nativeElement);
    }

    setTimeout(() => {
      if (this.store.heroVariant() === 0) {
        this.gsap.animateHero('.hero-bold');
        this.gsap.initCardEffects();
        const canvases = this.cardCanvases.map(r => r.nativeElement);
        if (canvases.length === 3) this.cardThree.init(canvases);
      }
      this.gsap.animateStats('.trust-strip');
      this.gsap.animateProcess();
      this.gsap.initParallax();
    }, 50);
  }

  ngOnDestroy() {
    this.particles.destroy();
    this.cardThree.destroy();
  }

  get contact(): ContactBody | null {
    const c = this.store.contenus().find(c =>
      c.id === 'contact' ||
      c.title.toLowerCase() === 'contact'
    );
    return c && typeof c.body === 'object' ? c.body as ContactBody : null;
  }

  stats = [
    { num: '100+', key: 'happy' as const },
    { num: '5',    key: 'expertise' as const },
    { num: '48h',  key: 'response' as const },
    { num: '10+',  key: 'experience' as const },
  ];

  steps = [
    { n: 1, key: 'step1' as const, dk: 'step1d' as const },
    { n: 2, key: 'step2' as const, dk: 'step2d' as const },
    { n: 3, key: 'step3' as const, dk: 'step3d' as const },
    { n: 4, key: 'step4' as const, dk: 'step4d' as const },
  ];

  poleText(pole: typeof POLES[number]) {
    return pole[this.store.lang() as 'fr' | 'en'];
  }
}
