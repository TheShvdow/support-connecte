import { Injectable, signal, computed } from '@angular/core';
import { STR, PRODUCTS_BASE, REAL_BASE, DEMANDES_BASE, CONTENUS_BASE, QR_CODES_BASE } from '../data/data';
import {
  Product, Realisation, Demande, Contenu, QrCode,
  ImpressionForm, QrForm, DigitalForm, ContactForm,
  DevisType, AdminTab, Lang
} from '../models/types';

@Injectable({ providedIn: 'root' })
export class StoreService {
  lang = signal<Lang>('fr');
  heroVariant = signal(0);
  catFilter = signal('Tous');
  realFilter = signal('Tous');

  devisType = signal<DevisType>(null);
  devisStep = signal(0);
  submitted = signal(false);
  devisRef = signal('');

  impression = signal<ImpressionForm>({ produit: '', largeur: '', hauteur: '', quantite: '1', support: '', finitions: [] });
  qr = signal<QrForm>({ type: '', usage: '', url: '', users: '' });
  digital = signal<DigitalForm>({ prestation: '', secteur: '', besoin: '', budget: '' });
  contact = signal<ContactForm>({ nom: '', entreprise: '', email: '', tel: '' });
  files = signal<string[]>([]);

  adminTab = signal<AdminTab>('demandes');
  adminSearch = signal('');

  products = signal<Product[]>(PRODUCTS_BASE.map(p => ({ ...p, avantages: [...p.avantages] })));
  realisations = signal<Realisation[]>(REAL_BASE.map(r => ({ ...r })));
  demandes = signal<Demande[]>(DEMANDES_BASE.map(d => ({ ...d })));
  contenus = signal<Contenu[]>(CONTENUS_BASE.map(c => ({ ...c })));
  qrCodes = signal<QrCode[]>(this.loadQrCodes());

  panelOpen = signal(false);
  modalOpen = signal(false);
  toastMsg = signal('');
  toastVisible = signal(false);

  t = computed(() => STR[this.lang() as keyof typeof STR]);

  toggleLang() {
    this.lang.set(this.lang() === 'fr' ? 'en' : 'fr');
    this.catFilter.set(this.lang() === 'fr' ? 'Tous' : 'All');
    this.realFilter.set(this.lang() === 'fr' ? 'Tous' : 'All');
  }

  setHeroVariant(v: number) { this.heroVariant.set(v); }
  setCatFilter(f: string) { this.catFilter.set(f); }
  setRealFilter(f: string) { this.realFilter.set(f); }
  setAdminTab(t: AdminTab) { this.adminTab.set(t); this.adminSearch.set(''); }
  setAdminSearch(s: string) { this.adminSearch.set(s); }

  setDevisType(t: DevisType) { this.devisType.set(t); }
  setDevisStep(s: number) { this.devisStep.set(s); }

  updateImpression(patch: Partial<ImpressionForm>) {
    this.impression.set({ ...this.impression(), ...patch });
  }
  toggleFinition(v: string) {
    const fins = [...this.impression().finitions];
    const i = fins.indexOf(v);
    i > -1 ? fins.splice(i, 1) : fins.push(v);
    this.impression.set({ ...this.impression(), finitions: fins });
  }
  updateQr(patch: Partial<QrForm>) { this.qr.set({ ...this.qr(), ...patch }); }
  updateDigital(patch: Partial<DigitalForm>) { this.digital.set({ ...this.digital(), ...patch }); }
  updateContact(patch: Partial<ContactForm>) { this.contact.set({ ...this.contact(), ...patch }); }
  addFile(name: string) { this.files.set([...this.files(), name]); }
  removeFile(i: number) { const f = [...this.files()]; f.splice(i, 1); this.files.set(f); }

  submitDevis() {
    const ref = '#DV-' + (1000 + this.demandes().length + 1);
    const c = this.contact();
    const newD: Demande = {
      id: Date.now(), ref,
      client: c.nom + (c.entreprise ? ' — ' + c.entreprise : ''),
      detail: this.devisType() || '',
      type: this.devisType() === 'impression' ? 'Impression' : this.devisType() === 'qr' ? 'QR Code' : 'Digital',
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      statut: 'Nouveau', notes: '', email: c.email, tel: c.tel
    };
    this.demandes.set([newD, ...this.demandes()]);
    this.devisRef.set(ref);
    this.submitted.set(true);
  }

  resetDevis() {
    this.submitted.set(false);
    this.devisStep.set(0);
    this.devisType.set(null);
    this.devisRef.set('');
    this.impression.set({ produit: '', largeur: '', hauteur: '', quantite: '1', support: '', finitions: [] });
    this.qr.set({ type: '', usage: '', url: '', users: '' });
    this.digital.set({ prestation: '', secteur: '', besoin: '', budget: '' });
    this.contact.set({ nom: '', entreprise: '', email: '', tel: '' });
    this.files.set([]);
  }

  saveDemande(id: number, statut: string, notes: string) {
    this.demandes.set(this.demandes().map(d => d.id === id ? { ...d, statut, notes } : d));
    this.toast(this.t().toastSaved);
  }

  addProduct(p: Omit<Product, 'id'>) {
    const product = { ...p, id: 'prod-' + Date.now(), avantages: [] };
    this.products.set([...this.products(), product]);
    this.toast(this.t().toastAdded);
  }

  updateProduct(id: string, patch: Partial<Product>) {
    this.products.set(this.products().map(p => p.id === id ? { ...p, ...patch } : p));
    this.toast(this.t().toastSaved);
  }

  deleteProduct(id: string) {
    this.products.set(this.products().filter(p => p.id !== id));
    this.toast(this.t().toastDeleted);
  }

  addRealisation(r: Omit<Realisation, 'id'>) {
    this.realisations.set([...this.realisations(), { ...r, id: Date.now() }]);
    this.toast(this.t().toastAdded);
  }

  updateRealisation(id: number, patch: Partial<Realisation>) {
    this.realisations.set(this.realisations().map(r => r.id === id ? { ...r, ...patch } : r));
    this.toast(this.t().toastSaved);
  }

  deleteRealisation(id: number) {
    this.realisations.set(this.realisations().filter(r => r.id !== id));
    this.toast(this.t().toastDeleted);
  }

  updateContenu(id: string, body: string) {
    this.contenus.set(this.contenus().map(c => c.id === id ? { ...c, body } : c));
    this.toast(this.t().toastSaved);
  }

  private loadQrCodes(): QrCode[] {
    try {
      const saved = localStorage.getItem('sc_qr_codes');
      return saved ? JSON.parse(saved) : QR_CODES_BASE.map(q => ({ ...q }));
    } catch { return QR_CODES_BASE.map(q => ({ ...q })); }
  }

  private persistQr() {
    localStorage.setItem('sc_qr_codes', JSON.stringify(this.qrCodes()));
  }

  createQrCode(data: Omit<QrCode, 'id' | 'createdAt' | 'scans'>): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const id = 'SC-' + rand;
    const qr: QrCode = { ...data, id, createdAt: new Date().toISOString().split('T')[0], scans: 0 };
    this.qrCodes.set([qr, ...this.qrCodes()]);
    this.persistQr();
    this.toast('QR créé ✓');
    return id;
  }

  toggleQrCode(id: string) {
    this.qrCodes.set(this.qrCodes().map(q => q.id === id ? { ...q, active: !q.active } : q));
    this.persistQr();
    this.toast(this.t().toastSaved);
  }

  updateQrCode(id: string, patch: Partial<QrCode>) {
    this.qrCodes.set(this.qrCodes().map(q => q.id === id ? { ...q, ...patch } : q));
    this.persistQr();
    this.toast(this.t().toastSaved);
  }

  deleteQrCode(id: string) {
    this.qrCodes.set(this.qrCodes().filter(q => q.id !== id));
    this.persistQr();
    this.toast(this.t().toastDeleted);
  }

  toast(msg: string) {
    this.toastMsg.set(msg);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 2500);
  }
}
