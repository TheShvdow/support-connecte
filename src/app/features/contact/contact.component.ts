import { Component, inject, signal, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { SeoService } from '../../services/seo.service';
import { EmailService } from '../../services/email.service';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ContactBody } from '../../models/types';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink, FooterComponent],
  templateUrl: './contact.component.html',
})
export class ContactComponent implements AfterViewInit {
  store         = inject(StoreService);
  private emailSvc = inject(EmailService);
  private platformId = inject(PLATFORM_ID);
  t = this.store.t;

  nom     = signal('');
  email   = signal('');
  tel     = signal('');
  message = signal('');
  sending = signal(false);
  sent    = signal(false);
  error   = signal('');

  constructor() {
    inject(SeoService).set(
      'Contact — Support Connecté, Saly',
      'Contactez notre agence de communication visuelle à Saly. Appelez-nous, envoyez un WhatsApp ou remplissez ce formulaire — réponse sous 24h.',
      '/contact'
    );
  }

  get contact(): ContactBody | null {
    const c = this.store.contenus().find(c =>
      c.id === 'contact' || c.title.toLowerCase() === 'contact'
    );
    return c && typeof c.body === 'object' ? c.body as ContactBody : null;
  }

  async send() {
    if (!this.nom() || !this.email() || !this.message()) return;
    this.sending.set(true);
    this.error.set('');
    try {
      await Promise.all([
        this.store.submitContact(this.nom(), this.email(), this.tel(), this.message()),
        this.emailSvc.sendContactForm({ nom: this.nom(), email: this.email(), tel: this.tel(), message: this.message() }),
      ]);
      this.sent.set(true);
    } catch {
      this.sent.set(true);
    } finally {
      this.sending.set(false);
    }
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    import('gsap').then(({ gsap }) => {
      gsap.from('.ct-left',  { x: -48, opacity: 0, duration: 0.85, ease: 'power3.out' });
      gsap.from('.ct-right', { x:  40, opacity: 0, duration: 0.85, ease: 'power3.out', delay: 0.12 });
    });
  }
}
