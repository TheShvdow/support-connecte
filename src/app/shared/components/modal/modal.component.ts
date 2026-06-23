import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../services/store.service';
import { OPTS } from '../../../data/data';
import { Product, Realisation, Contenu, ContactBody } from '../../../models/types';

type ModalMode = 'product' | 'realisation' | 'contenu' | null;

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-overlay" [class.open]="open()" (click)="onOverlayClick($event)">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ title() }}</h3>
          <button class="panel-close" (click)="close()">×</button>
        </div>

        @if (mode() === 'product') {
          <div class="modal-body">
            <div class="field-row">
              <div class="field-group"><label class="field-label-sm">Nom (FR) *</label><input class="field-input" [(ngModel)]="pFr"></div>
              <div class="field-group"><label class="field-label-sm">Nom (EN)</label><input class="field-input" [(ngModel)]="pEn"></div>
            </div>
            <div class="field-row">
              <div class="field-group"><label class="field-label-sm">Catégorie (FR)</label><input class="field-input" [(ngModel)]="pCat"></div>
              <div class="field-group"><label class="field-label-sm">Catégorie (EN)</label><input class="field-input" [(ngModel)]="pCatEn"></div>
            </div>
            <div class="field-row">
              <div class="field-group"><label class="field-label-sm">Prix (FR)</label><input class="field-input" [(ngModel)]="pPrice"></div>
              <div class="field-group"><label class="field-label-sm">Prix (EN)</label><input class="field-input" [(ngModel)]="pPriceEn"></div>
            </div>
            <div class="field-group"><label class="field-label-sm">Description (FR)</label><textarea class="field-input" rows="2" [(ngModel)]="pDesc"></textarea></div>
            <div class="field-group"><label class="field-label-sm">Description (EN)</label><textarea class="field-input" rows="2" [(ngModel)]="pDescEn"></textarea></div>
            <div class="field-row">
              <div class="field-group"><label class="field-label-sm">Couleur</label><input type="color" [(ngModel)]="pColor" class="field-input" style="height:40px;padding:2px 6px"></div>
              <div class="field-group"><label class="field-label-sm">Icône</label><input class="field-input" [(ngModel)]="pIco"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="panel-cancel" (click)="close()">{{ store.t().cancel }}</button>
            <button class="panel-save" (click)="saveProduct()">{{ store.t().save }}</button>
          </div>
        }

        @if (mode() === 'realisation') {
          <div class="modal-body">
            <div class="field-group"><label class="field-label-sm">Titre (FR) *</label><input class="field-input" [(ngModel)]="rFr"></div>
            <div class="field-group"><label class="field-label-sm">Titre (EN)</label><input class="field-input" [(ngModel)]="rEn"></div>
            <div class="field-row">
              <div class="field-group"><label class="field-label-sm">Catégorie</label>
                <select class="field-input" [(ngModel)]="rCat">
                  @for (c of realCats; track c) { <option>{{ c }}</option> }
                </select>
              </div>
              <div class="field-group"><label class="field-label-sm">Année</label><input class="field-input" [(ngModel)]="rYear"></div>
            </div>
            <div class="field-group"><label class="field-label-sm">Couleur</label><input type="color" [(ngModel)]="rColor" class="field-input" style="height:40px;padding:2px 6px;width:100%"></div>
          </div>
          <div class="modal-footer">
            <button class="panel-cancel" (click)="close()">{{ store.t().cancel }}</button>
            <button class="panel-save" (click)="saveRealisation()">{{ store.t().save }}</button>
          </div>
        }

        @if (mode() === 'contenu') {
          <div class="modal-body">
            <div class="field-group">
              <label class="field-label-sm">{{ contenuItem()?.title }}</label>
              @if (contenuItem()?.id === 'contact') {
                <div class="field-group"><label class="field-label-sm">Email</label><input class="field-input" [(ngModel)]="cEmail" placeholder="contact@exemple.fr"></div>
                <div class="field-group"><label class="field-label-sm">Téléphone</label><input class="field-input" [(ngModel)]="cPhone" placeholder="+33 5 00 00 00 00"></div>
                <div class="field-group"><label class="field-label-sm">Adresse</label><input class="field-input" [(ngModel)]="cAddress" placeholder="12 rue …, 33000 Bordeaux"></div>
                <div class="field-group"><label class="field-label-sm">WhatsApp (URL ou numéro)</label><input class="field-input" [(ngModel)]="cWhatsapp" placeholder="https://wa.me/33500000000"></div>
              } @else {
                <textarea class="field-input" rows="8" [(ngModel)]="cBody" style="resize:vertical"></textarea>
              }
            </div>
          </div>
          <div class="modal-footer">
            <button class="panel-cancel" (click)="close()">{{ store.t().cancel }}</button>
            <button class="panel-save" (click)="saveContenu()">{{ store.t().save }}</button>
          </div>
        }
      </div>
    </div>
  `
})
export class ModalComponent {
  store = inject(StoreService);
  open = signal(false);
  mode = signal<ModalMode>(null);
  title = signal('');

  // Product fields
  editProductId = signal<string | null>(null);
  pFr = ''; pEn = ''; pCat = ''; pCatEn = ''; pPrice = ''; pPriceEn = '';
  pDesc = ''; pDescEn = ''; pColor = '#2347E6'; pIco = '📦';

  // Realisation fields
  editRealId = signal<number | null>(null);
  rFr = ''; rEn = ''; rCat = 'Impression'; rYear = '2025'; rColor = '#2347E6';
  realCats = ['Impression', 'Marquage', 'QR Code', 'Digital', 'PLV', 'Objets', 'Formation'];

  // Contenu fields
  contenuItem = signal<Contenu | null>(null);
  cBody = '';
  cEmail = ''; cPhone = ''; cAddress = ''; cWhatsapp = '';

  openProduct(p?: Product) {
    this.mode.set('product');
    this.editProductId.set(p?.id ?? null);
    this.title.set(p ? `Modifier — ${p.fr}` : 'Ajouter un produit');
    this.pFr = p?.fr ?? ''; this.pEn = p?.en ?? '';
    this.pCat = p?.cat ?? ''; this.pCatEn = p?.catEn ?? '';
    this.pPrice = p?.price ?? ''; this.pPriceEn = p?.priceEn ?? '';
    this.pDesc = p?.d ?? ''; this.pDescEn = p?.dEn ?? '';
    this.pColor = p?.color ?? '#2347E6'; this.pIco = p?.ico ?? '📦';
    this.open.set(true);
  }

  openRealisation(r?: Realisation) {
    this.mode.set('realisation');
    this.editRealId.set(r?.id ?? null);
    this.title.set(r ? `Modifier — ${r.fr}` : 'Ajouter une réalisation');
    this.rFr = r?.fr ?? ''; this.rEn = r?.en ?? '';
    this.rCat = r?.cat ?? 'Impression'; this.rYear = r?.year ?? '2025';
    this.rColor = r?.color ?? '#2347E6';
    this.open.set(true);
  }

  openContenu(c: Contenu) {
    this.mode.set('contenu');
    this.contenuItem.set(c);
    this.title.set(`Modifier — ${c.title}`);
    if (typeof c.body === 'object') {
      const b = c.body as ContactBody;
      this.cEmail = b.email ?? ''; this.cPhone = b.phone ?? '';
      this.cAddress = b.address ?? ''; this.cWhatsapp = b.whatsapp ?? '';
    } else {
      this.cBody = c.body as string;
    }
    this.open.set(true);
  }

  saveProduct() {
    if (!this.pFr) { this.store.toast(this.store.t().nameRequired); return; }
    const data = { fr: this.pFr, en: this.pEn, cat: this.pCat, catEn: this.pCatEn, price: this.pPrice, priceEn: this.pPriceEn, d: this.pDesc, dEn: this.pDescEn, color: this.pColor, ico: this.pIco };
    const id = this.editProductId();
    if (id) this.store.updateProduct(id, data);
    else this.store.addProduct({ ...data, avantages: [] });
    this.close();
  }

  saveRealisation() {
    if (!this.rFr) { this.store.toast(this.store.t().titleRequired); return; }
    const data = { fr: this.rFr, en: this.rEn, cat: this.rCat, year: this.rYear, color: this.rColor };
    const id = this.editRealId();
    if (id) this.store.updateRealisation(id, data);
    else this.store.addRealisation(data);
    this.close();
  }

  saveContenu() {
    const c = this.contenuItem();
    if (!c) { this.close(); return; }
    const body = c.id === 'contact'
      ? { email: this.cEmail, phone: this.cPhone, address: this.cAddress, whatsapp: this.cWhatsapp }
      : this.cBody;
    this.store.updateContenu(c.id, body);
    this.close();
  }

  close() { this.open.set(false); this.mode.set(null); }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close();
  }
}
