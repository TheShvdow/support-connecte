import { Directive, ElementRef, Input, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({ selector: '[aos]', standalone: true })
export class AosDirective implements AfterViewInit, OnDestroy {
  @Input() aos: 'up' | 'left' | 'right' | 'scale' | 'fade' = 'up';
  @Input() aosDelay = 0;

  private observer!: IntersectionObserver;
  private platformId = inject(PLATFORM_ID);

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.el.nativeElement;
    el.style.setProperty('--aos-delay', `${this.aosDelay}ms`);
    el.classList.add(`aos-${this.aos}`);
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('aos-in');
          this.observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    this.observer.observe(el);
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}
