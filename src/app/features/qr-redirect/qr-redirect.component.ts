import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-qr-redirect',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="qr-redir-wrap">
      @if (status() === 'redirecting') {
        <div class="qr-redir-card">
          <div class="qr-redir-spinner"></div>
          <p>Redirection en cours…</p>
        </div>
      }
      @if (status() === 'inactive') {
        <div class="qr-redir-card error">
          <div class="qr-redir-ico">🔒</div>
          <h2>QR Code inactif</h2>
          <p>Ce lien a été temporairement désactivé par son propriétaire.</p>
          <a routerLink="/" class="cta-outline" style="margin-top:24px;display:inline-block">Accueil</a>
        </div>
      }
      @if (status() === 'expired') {
        <div class="qr-redir-card error">
          <div class="qr-redir-ico">⏱</div>
          <h2>QR Code expiré</h2>
          <p>La validité de ce QR code est arrivée à terme le {{ expiryDate() }}.</p>
          <a routerLink="/" class="cta-outline" style="margin-top:24px;display:inline-block">Accueil</a>
        </div>
      }
      @if (status() === 'notfound') {
        <div class="qr-redir-card error">
          <div class="qr-redir-ico">❓</div>
          <h2>QR Code introuvable</h2>
          <p>Ce QR code n'existe pas ou a été supprimé.</p>
          <a routerLink="/" class="cta-outline" style="margin-top:24px;display:inline-block">Accueil</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .qr-redir-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--cream); }
    .qr-redir-card { text-align: center; background: #fff; border-radius: 24px; padding: 48px 40px; box-shadow: var(--shadow); max-width: 400px; width: 90%; }
    .qr-redir-card h2 { font-size: 22px; margin: 16px 0 10px; }
    .qr-redir-card p { color: var(--body); line-height: 1.6; }
    .qr-redir-ico { font-size: 48px; }
    .qr-redir-spinner { width: 48px; height: 48px; border: 4px solid rgba(35,71,230,.15); border-top-color: var(--cobalt); border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class QrRedirectComponent implements OnInit {
  store = inject(StoreService);
  route = inject(ActivatedRoute);

  status = signal<'redirecting' | 'inactive' | 'expired' | 'notfound'>('redirecting');
  expiryDate = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const qr = this.store.qrCodes().find(q => q.id === id);

    if (!qr) { this.status.set('notfound'); return; }
    if (!qr.active) { this.status.set('inactive'); return; }
    if (qr.expiresAt && new Date(qr.expiresAt) < new Date()) {
      this.expiryDate.set(new Date(qr.expiresAt).toLocaleDateString('fr-FR'));
      this.status.set('expired');
      return;
    }
    this.status.set('redirecting');
    setTimeout(() => { window.location.href = qr.destination; }, 800);
  }
}
