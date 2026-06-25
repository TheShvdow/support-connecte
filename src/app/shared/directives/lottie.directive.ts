import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import lottie, { AnimationItem } from 'lottie-web';

@Directive({ selector: '[lottieAnim]', standalone: true })
export class LottieDirective implements OnInit, OnDestroy {
  @Input('lottieAnim') path = '';
  @Input() loop = true;
  @Input() autoplay = true;

  private anim!: AnimationItem;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.anim = lottie.loadAnimation({
      container: this.el.nativeElement,
      renderer: 'svg',
      loop: this.loop,
      autoplay: this.autoplay,
      path: this.path,
    });
  }

  ngOnDestroy() { this.anim?.destroy(); }
}
