import { Component, inject, signal, ViewChild, afterNextRender, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgClass, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { QrGeneratorComponent } from '../qr-generator/qr-generator.component';
import { QrDetailComponent } from './qr-detail/qr-detail.component';
import { AdminTab, Demande, Product, Realisation, Contenu, QrCode, Contact, Banner } from '../../models/types';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, NgClass, DatePipe, FormsModule, SlidePanelComponent, ModalComponent, QrGeneratorComponent, QrDetailComponent],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnDestroy {
  store = inject(StoreService);
  auth  = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  t = this.store.t;

  sidebarOpen = signal(true);

  constructor() {
    afterNextRender(() => {
      const saved = localStorage.getItem('sb-open');
      if (saved !== null) this.sidebarOpen.set(saved !== 'false');
      document.body.classList.add('admin-open');
      this.syncNavPadding(this.sidebarOpen());
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('admin-open', 'sb-closed');
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => {
      const next = !v;
      localStorage.setItem('sb-open', String(next));
      this.syncNavPadding(next);
      return next;
    });
  }

  private syncNavPadding(open: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('sb-closed', !open);
    }
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
    { key: 'contacts'    as AdminTab, ico: '✉️' },
    { key: 'catalogue'   as AdminTab, ico: '🛍️' },
    { key: 'realisations'as AdminTab, ico: '🖼️' },
    { key: 'contenus'    as AdminTab, ico: '✏️' },
    { key: 'qrcodes'     as AdminTab, ico: '📱' },
    { key: 'banners'     as AdminTab, ico: '📣' },
  ];

  tabLabel(key: AdminTab) {
    if (key === 'demandes')     return this.t().adminDemandes;
    if (key === 'contacts')     return 'Messages';
    if (key === 'catalogue')    return this.t().adminCatalogue;
    if (key === 'realisations') return this.t().adminReal;
    if (key === 'qrcodes')      return 'QR Codes';
    if (key === 'banners')      return 'Bannières';
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

  // ── Pagination
  readonly PAGE_SIZE = 10;
  demandesPage     = signal(1);
  contactsPage     = signal(1);
  cataloguePage    = signal(1);
  realisationsPage = signal(1);
  qrPage           = signal(1);

  setSearch(val: string) {
    this.store.setAdminSearch(val);
    this.demandesPage.set(1);
    this.contactsPage.set(1);
    this.cataloguePage.set(1);
    this.realisationsPage.set(1);
    this.qrPage.set(1);
  }

  pageSlice<T>(list: T[], page: number): T[] {
    return list.slice((page - 1) * this.PAGE_SIZE, page * this.PAGE_SIZE);
  }
  totalPages(list: unknown[]): number {
    return Math.max(1, Math.ceil(list.length / this.PAGE_SIZE));
  }
  pageEnd(page: number, total: number): number {
    return Math.min(page * this.PAGE_SIZE, total);
  }
  pageNums(current: number, total: number): number[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [current - 2, current - 1, current, current + 1, current + 2];
  }

  get pagedDemandes()  { return this.pageSlice(this.filteredDemandes,  this.demandesPage()); }
  get pagedContacts()  { return this.pageSlice(this.filteredContacts,  this.contactsPage()); }
  get pagedProducts()  { return this.pageSlice(this.filteredProducts,  this.cataloguePage()); }
  get pagedReal()      { return this.pageSlice(this.filteredReal,       this.realisationsPage()); }
  get pagedQrCodes()   { return this.pageSlice(this.filteredQrCodes,   this.qrPage()); }

  // ── Filtered lists
  get filteredContacts() {
    const q = this.store.adminSearch().toLowerCase();
    return !q ? this.store.contacts()
      : this.store.contacts().filter(c =>
          c.nom.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.message.toLowerCase().includes(q)
        );
  }

  get unreadContactsCount() {
    return this.store.contacts().filter(c => !c.lu).length;
  }

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

  async deleteContact(id: number, event: Event) {
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
    if (result.isConfirmed) this.store.deleteContact(id);
  }

  async openContact(c: Contact) {
    if (!c.lu) await this.store.markContactLu(c.id);
    await Swal.fire({
      title: c.nom,
      html: `
        <div style="text-align:left;font-size:14px;line-height:1.6">
          <p><strong>Email :</strong> <a href="mailto:${c.email}">${c.email}</a></p>
          ${c.tel ? `<p><strong>Tél :</strong> ${c.tel}</p>` : ''}
          <p style="margin-top:12px;padding:12px;background:#f6f6f6;border-radius:8px;white-space:pre-wrap">${c.message}</p>
          <p style="margin-top:8px;font-size:12px;color:#9aa1ac">${new Date(c.createdAt).toLocaleString('fr-FR')}</p>
        </div>`,
      confirmButtonColor: '#3b6fd4',
      confirmButtonText: 'Fermer',
      customClass: { popup: 'swal-font' },
    });
  }

  openDemande(d: Demande)        { this.panel.openWith(d); }
  openProductModal(p?: Product)  { this.modal.openProduct(p); }
  openRealModal(r?: Realisation) { this.modal.openRealisation(r); }
  openContenuModal(c: Contenu)   { this.modal.openContenu(c); }
  openBannerModal(b?: Banner)    { this.modal.openBanner(b); }

  bannerPositionLabel(pos: string): string {
    return pos === 'catalogue' ? 'Catalogue' : 'Avant footer';
  }

  async deleteBanner(id: string, event: Event) {
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
    if (result.isConfirmed) this.store.deleteBanner(id);
  }

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
