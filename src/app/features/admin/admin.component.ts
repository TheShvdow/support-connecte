import { Component, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { QrGeneratorComponent } from '../qr-generator/qr-generator.component';
import { AdminTab, Demande, Product, Realisation, Contenu, QrCode } from '../../models/types';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule, SlidePanelComponent, ModalComponent, QrGeneratorComponent],
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  store = inject(StoreService);
  auth = inject(AuthService);
  private router = inject(Router);
  t = this.store.t;

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  @ViewChild(SlidePanelComponent) panel!: SlidePanelComponent;
  @ViewChild(ModalComponent) modal!: ModalComponent;

  tabs = [
    { key: 'demandes' as AdminTab, ico: '📋' },
    { key: 'catalogue' as AdminTab, ico: '🛍️' },
    { key: 'realisations' as AdminTab, ico: '🖼️' },
    { key: 'contenus' as AdminTab, ico: '✏️' },
    { key: 'qrcodes' as AdminTab, ico: '📱' },
  ];

  tabLabel(key: AdminTab) {
    if (key === 'demandes') return this.t().adminDemandes;
    if (key === 'catalogue') return this.t().adminCatalogue;
    if (key === 'realisations') return this.t().adminReal;
    if (key === 'qrcodes') return 'QR Codes';
    return this.t().adminContenus;
  }

  // ── QR view state
  showQrGenerator = signal(false);
  openQrGenerator() { this.showQrGenerator.set(true); }
  backToQrList()    { this.showQrGenerator.set(false); }

  // ── QR management
  editingQrId   = signal('');
  editQrName    = signal('');
  editQrDest    = signal('');
  editQrExpiry  = signal('');

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

  startEditQr(qr: QrCode) {
    this.editingQrId.set(qr.id);
    this.editQrName.set(qr.name);
    this.editQrDest.set(qr.destination);
    this.editQrExpiry.set(qr.expiresAt ?? '');
  }

  saveQrEdit(id: string) {
    this.store.updateQrCode(id, {
      name: this.editQrName(),
      destination: this.editQrDest(),
      expiresAt: this.editQrExpiry() || null,
    });
    this.editingQrId.set('');
  }

  cancelQrEdit() { this.editingQrId.set(''); }

  deleteQrCode(id: string) {
    if (confirm(this.t().deleteConfirm)) this.store.deleteQrCode(id);
  }

  async copyQrLink(id: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/r/${id}`);
    this.store.toast('Lien copié ✓');
  }

  qrShortLink(id: string) { return `${window.location.origin}/r/${id}`; }

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
      { n: d.filter(x => x.statut === 'Nouveau').length, l: 'Nouvelles', sub: 'Ce mois' },
      { n: d.filter(x => x.statut === 'En cours').length, l: 'En cours', sub: 'Actif' },
      { n: d.filter(x => x.statut === 'Livré').length, l: 'Livrées', sub: 'Total' },
      { n: d.length, l: 'Total', sub: 'Toutes statuts' },
    ];
  }

  openDemande(d: Demande) { this.panel.openWith(d); }
  openProductModal(p?: Product) { this.modal.openProduct(p); }
  openRealModal(r?: Realisation) { this.modal.openRealisation(r); }
  openContenuModal(c: Contenu) { this.modal.openContenu(c); }

  deleteProduct(id: string, event: Event) {
    event.stopPropagation();
    if (confirm(this.t().deleteConfirm)) this.store.deleteProduct(id);
  }

  deleteReal(id: number, event: Event) {
    event.stopPropagation();
    if (confirm(this.t().deleteConfirm)) this.store.deleteRealisation(id);
  }
}
