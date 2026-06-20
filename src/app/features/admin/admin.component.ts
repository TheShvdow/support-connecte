import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AdminTab, Demande, Product, Realisation, Contenu } from '../../models/types';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule, SlidePanelComponent, ModalComponent],
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
  ];

  tabLabel(key: AdminTab) {
    if (key === 'demandes') return this.t().adminDemandes;
    if (key === 'catalogue') return this.t().adminCatalogue;
    if (key === 'realisations') return this.t().adminReal;
    return this.t().adminContenus;
  }

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
