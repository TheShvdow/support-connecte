import { Component, inject, signal, ViewChild, afterNextRender } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { QrGeneratorComponent } from '../qr-generator/qr-generator.component';
import { QrDetailComponent } from './qr-detail/qr-detail.component';
import { AdminTab, Demande, Product, Realisation, Contenu, QrCode } from '../../models/types';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule, SlidePanelComponent, ModalComponent, QrGeneratorComponent, QrDetailComponent],
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  store = inject(StoreService);
  auth  = inject(AuthService);
  private router = inject(Router);
  t = this.store.t;

  sidebarOpen = signal(true);

  constructor() {
    afterNextRender(() => {
      const saved = localStorage.getItem('sb-open');
      if (saved !== null) this.sidebarOpen.set(saved !== 'false');
    });
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => { localStorage.setItem('sb-open', String(!v)); return !v; });
  }

  async logout() {
    const result = await Swal.fire({
      title: 'Se déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#C41A1A',
      cancelButtonColor: '#9aa1ac',
      confirmButtonText: 'Déconnexion',
      cancelButtonText: 'Annuler',
      customClass: { popup: 'swal-font' },
    });
    if (result.isConfirmed) {
      await this.auth.logout();
      this.router.navigate(['/']);
    }
  }

  @ViewChild(SlidePanelComponent) panel!: SlidePanelComponent;
  @ViewChild(ModalComponent) modal!: ModalComponent;

  tabs = [
    { key: 'demandes'    as AdminTab, ico: '📋' },
    { key: 'catalogue'   as AdminTab, ico: '🛍️' },
    { key: 'realisations'as AdminTab, ico: '🖼️' },
    { key: 'contenus'    as AdminTab, ico: '✏️' },
    { key: 'qrcodes'     as AdminTab, ico: '📱' },
  ];

  tabLabel(key: AdminTab) {
    if (key === 'demandes')     return this.t().adminDemandes;
    if (key === 'catalogue')    return this.t().adminCatalogue;
    if (key === 'realisations') return this.t().adminReal;
    if (key === 'qrcodes')      return 'QR Codes';
    if (key === 'profil')       return 'Mon profil';
    return this.t().adminContenus;
  }

  // ── Profile page
  profileName        = signal('');
  profileEmail       = signal('');
  profilePassword    = signal('');
  profilePasswordCfm = signal('');
  profileSaving      = signal(false);
  profileMsg         = signal<{ type: 'ok' | 'err'; text: string } | null>(null);

  openProfile() {
    this.profileName.set(this.auth.displayName());
    this.profileEmail.set(this.auth.userEmail());
    this.profilePassword.set('');
    this.profilePasswordCfm.set('');
    this.profileMsg.set(null);
    this.store.setAdminTab('profil');
  }

  async saveProfile() {
    this.profileSaving.set(true);
    this.profileMsg.set(null);
    const errors: string[] = [];

    const name = this.profileName().trim();
    if (name && name !== this.auth.displayName()) {
      await this.auth.updateName(name);
    }

    const email = this.profileEmail().trim();
    if (email && email !== this.auth.userEmail()) {
      const r = await this.auth.updateEmail(email);
      if (r.error) errors.push('Email : ' + r.error);
    }

    const pwd = this.profilePassword().trim();
    if (pwd) {
      if (pwd !== this.profilePasswordCfm()) {
        errors.push('Les mots de passe ne correspondent pas.');
      } else if (pwd.length < 6) {
        errors.push('Le mot de passe doit faire au moins 6 caractères.');
      } else {
        const r = await this.auth.updatePassword(pwd);
        if (r.error) errors.push('Mot de passe : ' + r.error);
        else { this.profilePassword.set(''); this.profilePasswordCfm.set(''); }
      }
    }

    this.profileSaving.set(false);
    if (errors.length) {
      this.profileMsg.set({ type: 'err', text: errors.join(' ') });
    } else {
      this.profileMsg.set({ type: 'ok', text: 'Profil mis à jour ✓' });
    }
  }

  // ── QR view state
  showQrGenerator = signal(false);
  selectedQr      = signal<QrCode | null>(null);

  openQrGenerator() { this.selectedQr.set(null); this.showQrGenerator.set(true); }
  openQrDetail(qr: QrCode) { this.showQrGenerator.set(false); this.selectedQr.set(qr); }
  backToQrList()    { this.showQrGenerator.set(false); this.selectedQr.set(null); }

  // ── Filtered lists
  get filteredQrCodes() {
    const q = this.store.adminSearch().toLowerCase();
    return !q ? this.store.qrCodes()
      : this.store.qrCodes().filter(qr => qr.name.toLowerCase().includes(q) || qr.id.toLowerCase().includes(q) || qr.destination.toLowerCase().includes(q));
  }

  isExpired(qr: QrCode): boolean {
    return !!qr.expiresAt && new Date(qr.expiresAt) < new Date();
  }

  qrStatusClass(qr: QrCode): string {
    if (this.isExpired(qr)) return 'badge-wait';
    return qr.active ? 'badge-done' : 'badge-new';
  }

  qrStatusLabel(qr: QrCode): string {
    if (this.isExpired(qr)) return 'Expiré';
    return qr.active ? 'Actif' : 'Inactif';
  }

  get todayMin() { return new Date().toISOString().split('T')[0]; }

  badgeClass(statut: string) {
    return { 'Nouveau': 'badge-new', 'En cours': 'badge-progress', 'Livré': 'badge-done', 'En attente': 'badge-wait' }[statut] ?? 'badge-new';
  }

  get filteredDemandes() {
    const q = this.store.adminSearch().toLowerCase();
    return !q ? this.store.demandes()
      : this.store.demandes().filter(d => d.client.toLowerCase().includes(q) || d.ref.toLowerCase().includes(q) || d.detail.toLowerCase().includes(q));
  }

  get filteredProducts() {
    const q = this.store.adminSearch().toLowerCase();
    return !q ? this.store.products()
      : this.store.products().filter(p => (this.store.lang() === 'fr' ? p.fr : p.en).toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
  }

  get filteredReal() {
    const q = this.store.adminSearch().toLowerCase();
    return !q ? this.store.realisations()
      : this.store.realisations().filter(r => (r[this.store.lang()] || r.fr).toLowerCase().includes(q) || r.cat.toLowerCase().includes(q));
  }

  get stats() {
    const d = this.store.demandes();
    return [
      { n: d.filter(x => x.statut === 'Nouveau').length,  l: 'Nouvelles',  sub: 'Ce mois' },
      { n: d.filter(x => x.statut === 'En cours').length, l: 'En cours',   sub: 'Actif' },
      { n: d.filter(x => x.statut === 'Livré').length,    l: 'Livrées',    sub: 'Total' },
      { n: d.length,                                       l: 'Total',      sub: 'Toutes statuts' },
    ];
  }

  openDemande(d: Demande)        { this.panel.openWith(d); }
  openProductModal(p?: Product)  { this.modal.openProduct(p); }
  openRealModal(r?: Realisation) { this.modal.openRealisation(r); }
  openContenuModal(c: Contenu)   { this.modal.openContenu(c); }

  async deleteProduct(id: string, event: Event) {
    event.stopPropagation();
    const result = await Swal.fire({
      title: this.t().deleteConfirm,
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF5B35',
      cancelButtonColor: '#9aa1ac',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
    });
    if (result.isConfirmed) this.store.deleteProduct(id);
  }

  async deleteReal(id: number, event: Event) {
    event.stopPropagation();
    const result = await Swal.fire({
      title: this.t().deleteConfirm,
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF5B35',
      cancelButtonColor: '#9aa1ac',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
    });
    if (result.isConfirmed) this.store.deleteRealisation(id);
  }

  bodyPreview(body: string | object): string {
    if (typeof body !== 'string') {
      const b = body as any;
      return [b.email, b.phone, b.address].filter(Boolean).join(' · ');
    }
    return body;
  }
}
