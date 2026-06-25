import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Injectable({ providedIn: 'root' })
export class GsapService {
  private platformId = inject(PLATFORM_ID);

  animateHero(selector: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(`${selector} .hero-eyebrow`, { opacity: 0, y: 28, duration: 0.6 })
      .from(`${selector} .hero-h1`,      { opacity: 0, y: 52, duration: 0.75 }, '-=0.35')
      .from(`${selector} .hero-sub`,     { opacity: 0, y: 28, duration: 0.65 }, '-=0.4')
      .from(`${selector} .hero-actions`, { opacity: 0, y: 20, duration: 0.55 }, '-=0.45')
      .from(`${selector} .card-tall`,    { opacity: 0, duration: 0.8 }, '-=0.4')
      .from(`${selector} .card-sm`,      { opacity: 0, duration: 0.65, stagger: 0.14 }, '-=0.55')
      .add(() => {
        // Float sur les wrappers .card-3d — même élément que le tilt, GSAP gère y et rotationX/Y séparément
        gsap.to(`${selector} .card-3d--tall`,        { y: -10, duration: 3,   ease: 'sine.inOut', repeat: -1, yoyo: true });
        gsap.to(`${selector} .card-3d:nth-child(2)`, { y: -8,  duration: 3.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.3 });
        gsap.to(`${selector} .card-3d:nth-child(3)`, { y: -8,  duration: 2.9, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.6 });
      });
  }

  animateStats(containerSelector: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const statNums = document.querySelectorAll<HTMLElement>(`${containerSelector} .stat-num`);
    statNums.forEach(el => {
      const raw = el.textContent?.trim() ?? '';
      const num = parseInt(raw.replace(/\D/g, ''), 10);
      const suffix = raw.replace(/[0-9]/g, '');
      if (isNaN(num)) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: num,
        duration: 1.8,
        ease: 'power2.out',
        snap: { val: 1 },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
      });
    });
  }

  animateProcess() {
    if (!isPlatformBrowser(this.platformId)) return;
    const cards = gsap.utils.toArray<HTMLElement>('.proc-card');
    cards.forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 36,
        duration: 0.65,
        ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: { trigger: '.proc-grid', start: 'top 82%', once: true },
      });
    });
  }

  initCardEffects() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Tilt (rotationX/Y) + float (y) tous deux sur .card-3d — GSAP compose les deux en un seul transform
    document.querySelectorAll<HTMLElement>('.card-3d').forEach(wrap => {
      gsap.set(wrap, { transformPerspective: 800 });

      wrap.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = wrap.getBoundingClientRect();
        const dx = (e.clientX - rect.left) / rect.width  * 2 - 1;
        const dy = (e.clientY - rect.top)  / rect.height * 2 - 1;

        // overwrite: 'auto' tue le tween précédent du même hover MAIS pas le float y
        gsap.to(wrap, {
          rotationX: -dy * 16,
          rotationY:  dx * 16,
          scale: 1.04,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        const shine = wrap.querySelector<HTMLElement>('.card-shine');
        if (shine) {
          const px = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
          const py = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
          shine.style.background =
            `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,.24), transparent 60%)`;
          gsap.to(shine, { opacity: 1, duration: 0.12, overwrite: true });
        }
      });

      wrap.addEventListener('mouseleave', () => {
        // overwrite: 'auto' — ne tue que les tweens rotationX/Y/scale, laisse le float y intact
        gsap.to(wrap, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
        const shine = wrap.querySelector<HTMLElement>('.card-shine');
        if (shine) gsap.to(shine, { opacity: 0, duration: 0.3, overwrite: true });
      });
    });
  }

  initParallax() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!document.querySelector('.hero-section')) return;

    gsap.to('.hero-blob--red', {
      y: -180, x: 40, ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1.2 },
    });
    gsap.to('.hero-blob--teal', {
      y: -90, x: -30, ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 2 },
    });
    gsap.to('.hero-blob--violet', {
      y: -120, x: 20, ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1.6 },
    });

    const textCol = document.querySelector<HTMLElement>('.hero-bold > div:first-child');
    if (textCol) {
      gsap.to(textCol, {
        y: -40, ease: 'none',
        scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1 },
      });
    }
  }
}
