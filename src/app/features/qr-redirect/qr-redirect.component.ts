import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-qr-redirect',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="qr-redir-wrap">
      @if (status() === 'loading' || status() === 'redirecting') {
        <div class="qr-redir-card">
          <div class="qr-redir-spinner"></div>
          <p>{{ status() === 'loading' ? 'Chargement…' : 'Redirection en cours…' }}</p>
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
  sb    = inject(SupabaseService);
  route = inject(ActivatedRoute);

  status     = signal<'loading' | 'redirecting' | 'inactive' | 'expired' | 'notfound'>('loading');
  expiryDate = signal('');

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.status.set('notfound'); return; }

    // Check store first (already loaded)
    let qr = this.store.qrCodes().find(q => q.id === id);

    // Fallback: fetch directly from Supabase if not in store yet
    if (!qr) {
      const { data, error } = await this.sb.client
        .from('qr_codes').select('*').eq('id', id).single();
      if (error || !data) { this.status.set('notfound'); return; }
      qr = {
        id: data.id, name: data.name, destination: data.destination,
        active: data.active, expiresAt: data.expires_at,
        createdAt: data.created_at, scans: data.scans,
        maxScans: (data as any).max_scans ?? null,
        style: (data as any).style ?? {},
      };
    }

    if (!qr.active) { this.status.set('inactive'); return; }
    if (qr.maxScans !== null && qr.scans >= qr.maxScans) { this.status.set('inactive'); return; }
    if (qr.expiresAt && new Date(qr.expiresAt) < new Date()) {
      this.expiryDate.set(new Date(qr.expiresAt).toLocaleDateString('fr-FR'));
      this.status.set('expired');
      return;
    }
    this.status.set('redirecting');
    this.store.incrementQrScans(qr.id);
    setTimeout(() => { window.location.href = qr!.destination; }, 800);
  }
}
