import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../services/store.service';
import { SupabaseService } from '../../../services/supabase.service';
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
            <!-- Photo -->
            <div class="img-upload-zone" (click)="pFileInput.click()">
              @if (pImgPreview()) {
                <img [src]="pImgPreview()" class="img-preview" alt="aperçu">
                <span class="img-change">Changer la photo</span>
              } @else {
                <span class="img-placeholder">📷 Cliquer pour ajouter une photo</span>
              }
            </div>
            <input #pFileInput type="file" accept="image/*" style="display:none" (change)="onPImgChange($event)">
            @if (imgUploading()) { <span class="img-uploading">Upload en cours…</span> }

            <!-- Nom + Catégorie -->
            <div class="field-group"><label class="field-label-sm">Nom *</label><input class="field-input" [(ngModel)]="pFr" placeholder="Nom du produit"></div>
            <div class="field-row">
              <div class="field-group"><label class="field-label-sm">Catégorie</label><input class="field-input" [(ngModel)]="pCat" placeholder="Impression…"></div>
              <div class="field-group"><label class="field-label-sm">Prix</label><input class="field-input" [(ngModel)]="pPrice" placeholder="15 000 FCFA"></div>
            </div>
            <div class="field-group"><label class="field-label-sm">Description</label><textarea class="field-input" rows="2" [(ngModel)]="pDesc" placeholder="Courte description…"></textarea></div>
            <div class="field-row">
              <div class="field-group"><label class="field-label-sm">Couleur</label><input type="color" [(ngModel)]="pColor" class="field-input" style="height:40px;padding:2px 6px"></div>
              <div class="field-group"><label class="field-label-sm">Icône</label><input class="field-input" [(ngModel)]="pIco" placeholder="📦"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="panel-cancel" (click)="close()">{{ store.t().cancel }}</button>
            <button class="panel-save" (click)="saveProduct()" [disabled]="imgUploading()">{{ store.t().save }}</button>
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
  `,
  styles: [`
    .img-upload-zone {
      border: 2px dashed rgba(15,23,41,.15); border-radius: 12px;
      padding: 16px; cursor: pointer; text-align: center;
      transition: border-color .15s; min-height: 80px;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      &:hover { border-color: var(--cobalt, #3b6fd4); }
    }
    .img-preview { height: 64px; width: auto; border-radius: 8px; object-fit: cover; }
    .img-change  { font-size: 13px; color: var(--body); font-weight: 500; }
    .img-placeholder { font-size: 14px; color: var(--muted); }
    .img-uploading { font-size: 13px; color: var(--cobalt, #3b6fd4); margin-top: 6px; display: block; }
  `]
})
export class ModalComponent {
  store     = inject(StoreService);
  private sb = inject(SupabaseService);
  open  = signal(false);
  mode  = signal<ModalMode>(null);
  title = signal('');

  imgUploading = signal(false);

  // Product fields
  editProductId = signal<string | null>(null);
  pFr = ''; pEn = ''; pCat = ''; pCatEn = ''; pPrice = ''; pPriceEn = '';
  pDesc = ''; pDescEn = ''; pColor = '#C41A1A'; pIco = '📦';
  pImg     = '';
  pImgFile = signal<File | null>(null);
  pImgPreview = signal<string>('');

  // Realisation fields
  editRealId = signal<number | null>(null);
  rFr = ''; rEn = ''; rCat = 'Impression'; rYear = '2025'; rColor = '#C41A1A';
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
    this.pColor = p?.color ?? '#C41A1A'; this.pIco = p?.ico ?? '📦';
    this.pImg = p?.img ?? '';
    this.pImgFile.set(null);
    this.pImgPreview.set(p?.img ?? '');
    this.open.set(true);
  }

  onPImgChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.pImgFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.pImgPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  openRealisation(r?: Realisation) {
    this.mode.set('realisation');
    this.editRealId.set(r?.id ?? null);
    this.title.set(r ? `Modifier — ${r.fr}` : 'Ajouter une réalisation');
    this.rFr = r?.fr ?? ''; this.rEn = r?.en ?? '';
    this.rCat = r?.cat ?? 'Impression'; this.rYear = r?.year ?? '2025';
    this.rColor = r?.color ?? '#C41A1A';
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

  async saveProduct() {
    if (!this.pFr) { this.store.toast(this.store.t().nameRequired); return; }
    let imgUrl = this.pImg;
    const file = this.pImgFile();
    if (file) {
      this.imgUploading.set(true);
      const ext  = file.name.split('.').pop();
      const path = `products/${Date.now()}.${ext}`;
      const url  = await this.sb.uploadImage('images', path, file);
      this.imgUploading.set(false);
      if (url) imgUrl = url;
    }
    const data = { fr: this.pFr, en: this.pEn, cat: this.pCat, catEn: this.pCatEn, price: this.pPrice, priceEn: this.pPriceEn, d: this.pDesc, dEn: this.pDescEn, color: this.pColor, ico: this.pIco, img: imgUrl };
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
