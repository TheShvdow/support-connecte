import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { FooterComponent } from '../../layout/footer/footer.component';
import { AosDirective } from '../../shared/directives/aos.directive';
import { SeoService } from '../../services/seo.service';
import { OPTS } from '../../data/data';

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [RouterLink, FormsModule, FooterComponent, AosDirective],
  templateUrl: './devis.component.html',
})
export class DevisComponent {
  store = inject(StoreService);
  t = this.store.t;
  opts = OPTS;

  constructor() {
    inject(SeoService).set(
      'Demande de devis — Support Connecté',
      "Obtenez un devis gratuit pour vos projets d'impression, QR codes ou communication digitale. Réponse sous 24h.",
      '/devis'
    );
  }

  steps = ['devisStep0', 'devisStep1', 'devisStep2', 'devisStep3'] as const;

  next() {
    if (this.store.devisStep() === 0 && !this.store.devisType()) {
      this.store.toast(this.store.lang() === 'fr' ? 'Sélectionnez un type de projet' : 'Select a project type');
      return;
    }
    if (this.store.devisStep() === 2 && !this.store.contact().nom) {
      this.store.toast(this.t().nameRequired); return;
    }
    if (this.store.devisStep() === 2 && !this.store.contact().email) {
      this.store.toast(this.t().emailRequired); return;
    }
    this.store.setDevisStep(this.store.devisStep() + 1);
  }

  prev() { this.store.setDevisStep(this.store.devisStep() - 1); }

  toggleFinition(v: string) { this.store.toggleFinition(v); }

  handleFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(f => this.store.addFile(f.name));
    }
  }

  get imprRecap() {
    const i = this.store.impression();
    return [
      i.produit && [this.t().product, i.produit],
      (i.largeur || i.hauteur) && ['Format', `${i.largeur || '?'} × ${i.hauteur || '?'} cm`],
      i.quantite && [this.t().quantity, i.quantite],
      i.support && ['Support', i.support],
      i.finitions.length && [this.t().finishes, i.finitions.join(', ')],
    ].filter(Boolean) as [string, string][];
  }

  get qrRecap() {
    const q = this.store.qr();
    return [
      q.type && ['Type', q.type],
      q.usage && [this.t().use, q.usage],
    ].filter(Boolean) as [string, string][];
  }

  get digitalRecap() {
    const d = this.store.digital();
    return [
      d.prestation && [this.t().service, d.prestation],
      d.secteur && ['Secteur', d.secteur],
      d.budget && [this.t().budget, d.budget],
    ].filter(Boolean) as [string, string][];
  }

  get recap() {
    if (this.store.devisType() === 'impression') return this.imprRecap;
    if (this.store.devisType() === 'qr') return this.qrRecap;
    return this.digitalRecap;
  }

  get typeLabel() {
    if (this.store.devisType() === 'impression') return this.t().impTitle;
    if (this.store.devisType() === 'qr') return this.t().qrTitle;
    return this.t().digTitle;
  }
}
