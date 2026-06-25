import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Injectable({ providedIn: 'root' })
export class GsapService {

  animateHero(selector: string) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(`${selector} .hero-eyebrow`,  { opacity: 0, y: 20, duration: 0.5 })
      .from(`${selector} .hero-h1`,       { opacity: 0, y: 36, duration: 0.65 }, '-=0.3')
      .from(`${selector} .hero-sub`,      { opacity: 0, y: 24, duration: 0.55 }, '-=0.4')
      .from(`${selector} .hero-actions`,  { opacity: 0, y: 20, duration: 0.5  }, '-=0.4')
      .from(`${selector} .card-tall`,     { opacity: 0, x: 40, duration: 0.65 }, '-=0.5')
      .from(`${selector} .card-sm`,       { opacity: 0, x: 40, duration: 0.55, stagger: 0.12 }, '-=0.45');
  }

  animateStats(containerSelector: string) {
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
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
      });

      gsap.from(el.parentElement!, {
        opacity: 0, y: 28, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });
  }

  animateSection(selector: string, delay = 0) {
    gsap.from(selector, {
      opacity: 0, y: 32, duration: 0.7, ease: 'power3.out', delay,
      scrollTrigger: { trigger: selector, start: 'top 80%', once: true },
    });
  }
}
