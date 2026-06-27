import { Injectable, signal, computed, inject } from '@angular/core';
import { STR } from '../data/data';
import { SupabaseService } from './supabase.service';
import {
  Product, Realisation, Demande, Contenu, QrCode, Contact, Banner, BannerPosition,
  ImpressionForm, QrForm, DigitalForm, ContactForm,
  DevisType, AdminTab, Lang, ContactBody
} from '../models/types';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private sb = inject(SupabaseService);

  // ── UI state
  lang          = signal<Lang>('fr');
  heroVariant   = signal(0);
  catFilter     = signal('Tous');
  realFilter    = signal('Tous');
  devisType     = signal<DevisType>(null);
  devisStep     = signal(0);
  submitted     = signal(false);
  devisRef      = signal('');
  adminTab      = signal<AdminTab>('demandes');
  adminSearch   = signal('');
  panelOpen     = signal(false);
  modalOpen     = signal(false);
  toastMsg      = signal('');
  toastVisible  = signal(false);
  loading       = signal(false);

  // ── Forms
  impression = signal<ImpressionForm>({ produit: '', largeur: '', hauteur: '', quantite: '1', support: '', finitions: [] });
  qr         = signal<QrForm>({ type: '', usage: '', url: '', users: '' });
  digital    = signal<DigitalForm>({ prestation: '', secteur: '', besoin: '', budget: '' });
  contact    = signal<ContactForm>({ nom: '', entreprise: '', email: '', tel: '' });
  files      = signal<string[]>([]);

  // ── Data — source unique : Supabase
  products      = signal<Product[]>([]);
  realisations  = signal<Realisation[]>([]);
  demandes      = signal<Demande[]>([]);
  contacts      = signal<Contact[]>([]);
  contenus      = signal<Contenu[]>([]);
  qrCodes       = signal<QrCode[]>([]);
  banners       = signal<Banner[]>([]);

  t = computed(() => STR[this.lang() as keyof typeof STR]);

  // Bannières actives pour un emplacement donné (utilisé par les slots)
  bannersFor(pos: BannerPosition): Banner[] {
    return this.banners().filter(b => b.active && b.position === pos);
  }

  // ────────────────────────────────────────────────────────────
  // INIT — charge tout depuis Supabase au démarrage
  // ────────────────────────────────────────────────────────────
  async init() {
    this.loading.set(true);
    try {
      const [p, r, d, ct, c, q, b] = await Promise.all([
        this.sb.getProducts(),
        this.sb.getRealisations(),
        this.sb.getDemandes(),
        this.sb.getContacts(),
        this.sb.getContenus(),
        this.sb.getQrCodes(),
        this.sb.getBanners(),
      ]);

      if (p.error) console.error('[Supabase] products:', p.error.message);
      else { console.log(`[Supabase] products: ${p.data?.length ?? 0} ligne(s)`); if (p.data?.length) this.products.set(p.data.map(this.mapProduct)); }

      if (r.error) console.error('[Supabase] realisations:', r.error.message);
      else { console.log(`[Supabase] realisations: ${r.data?.length ?? 0} ligne(s)`); if (r.data?.length) this.realisations.set(r.data.map(this.mapRealisation)); }

      if (d.error) console.error('[Supabase] demandes:', d.error.message);
      else { console.log(`[Supabase] demandes: ${d.data?.length ?? 0} ligne(s)`); if (d.data?.length) this.demandes.set(d.data.map(this.mapDemande)); }

      if (ct.error) console.error('[Supabase] contacts:', ct.error.message);
      else { console.log(`[Supabase] contacts: ${ct.data?.length ?? 0} ligne(s)`); if (ct.data?.length) this.contacts.set(ct.data.map(this.mapContact)); }

      if (c.error) console.error('[Supabase] contenus:', c.error.message);
      else { console.log(`[Supabase] contenus: ${c.data?.length ?? 0} ligne(s)`); if (c.data?.length) this.contenus.set(c.data.map(this.mapContenu)); }

      if (q.error) console.error('[Supabase] qr_codes:', q.error.message);
      else { console.log(`[Supabase] qr_codes: ${q.data?.length ?? 0} ligne(s)`); if (q.data?.length) this.qrCodes.set(q.data.map(this.mapQrCode)); }

      if (b.error) console.error('[Supabase] banners:', b.error.message);
      else { console.log(`[Supabase] banners: ${b.data?.length ?? 0} ligne(s)`); if (b.data?.length) this.banners.set(b.data.map(this.mapBanner)); }

    } catch (e) {
      console.error('[Supabase] init failed:', e);
    } finally {
      this.loading.set(false);
    }
  }

  private async dbWrite(op: Promise<{ data: any; error: any }>, label: string) {
    const { error } = await op;
    if (error) console.error(`[Supabase] ${label}:`, error.message);
  }

  // ── Mappers DB → modèle app
  private mapProduct = (p: any): Product => ({
    id: p.id, cat: p.cat, catEn: p.cat_en, fr: p.fr, en: p.en,
    price: p.price, priceEn: p.price_en, d: p.d, dEn: p.d_en,
    color: p.color, ico: p.ico, img: p.img ?? undefined,
    avantages: p.avantages ?? [],
  });

  private mapRealisation = (r: any): Realisation => ({
    id: r.id, fr: r.fr, en: r.en, cat: r.cat,
    color: r.color, year: r.year, img: r.img ?? undefined,
  });

  private mapDemande = (d: any): Demande => ({
    id: d.id, ref: d.ref, client: d.client, detail: d.detail,
    type: d.type, date: d.date, statut: d.statut,
    notes: d.notes ?? '', email: d.email ?? '', tel: d.tel ?? '',
  });

  private mapContact = (c: any): Contact => ({
    id: c.id, nom: c.nom, email: c.email, tel: c.tel ?? '',
    message: c.message, createdAt: c.created_at, lu: c.lu ?? false,
  });

  private mapContenu = (c: any): Contenu => ({ id: c.id, title: c.title, body: c.body });

  private mapQrCode = (q: any): QrCode => ({
    id: q.id, name: q.name, destination: q.destination, active: q.active,
    expiresAt: q.expires_at, createdAt: q.created_at, scans: q.scans,
    maxScans: q.max_scans ?? null,
    style: q.style ?? {},
  });

  private mapBanner = (b: any): Banner => ({
    id: b.id, title: b.title, imageUrl: b.image_url, link: b.link ?? '',
    position: b.position, active: b.active, createdAt: b.created_at,
  });

  private toDbBanner(b: Banner) {
    return {
      id: b.id, title: b.title, image_url: b.imageUrl, link: b.link,
      position: b.position, active: b.active,
    };
  }

  // ────────────────────────────────────────────────────────────
  // LANGUAGE
  // ────────────────────────────────────────────────────────────
  toggleLang() {
    this.lang.set(this.lang() === 'fr' ? 'en' : 'fr');
    this.catFilter.set(this.lang() === 'fr' ? 'Tous' : 'All');
    this.realFilter.set(this.lang() === 'fr' ? 'Tous' : 'All');
  }

  setHeroVariant(v: number)  { this.heroVariant.set(v); }
  setCatFilter(f: string)    { this.catFilter.set(f); }
  setRealFilter(f: string)   { this.realFilter.set(f); }
  setAdminTab(t: AdminTab)   { this.adminTab.set(t); this.adminSearch.set(''); }
  setAdminSearch(s: string)  { this.adminSearch.set(s); }
  setDevisType(t: DevisType) { this.devisType.set(t); }
  setDevisStep(s: number)    { this.devisStep.set(s); }

  // ────────────────────────────────────────────────────────────
  // DEVIS
  // ────────────────────────────────────────────────────────────
  updateImpression(patch: Partial<ImpressionForm>) { this.impression.set({ ...this.impression(), ...patch }); }
  toggleFinition(v: string) {
    const fins = [...this.impression().finitions];
    const i = fins.indexOf(v);
    i > -1 ? fins.splice(i, 1) : fins.push(v);
    this.impression.set({ ...this.impression(), finitions: fins });
  }
  updateQr(patch: Partial<QrForm>)         { this.qr.set({ ...this.qr(), ...patch }); }
  updateDigital(patch: Partial<DigitalForm>) { this.digital.set({ ...this.digital(), ...patch }); }
  updateContact(patch: Partial<ContactForm>) { this.contact.set({ ...this.contact(), ...patch }); }
  addFile(name: string)  { this.files.set([...this.files(), name]); }
  removeFile(i: number)  { const f = [...this.files()]; f.splice(i, 1); this.files.set(f); }

  async submitDevis() {
    const ref = '#DV-' + (1000 + this.demandes().length + 1);
    const c   = this.contact();
    const newD: Demande = {
      id: Date.now(), ref,
      client: c.nom + (c.entreprise ? ' — ' + c.entreprise : ''),
      detail: this.devisType() || '',
      type: this.devisType() === 'impression' ? 'Impression' : this.devisType() === 'qr' ? 'QR Code' : 'Digital',
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      statut: 'Nouveau', notes: '', email: c.email, tel: c.tel,
    };
    this.demandes.set([newD, ...this.demandes()]);
    this.devisRef.set(ref);
    this.submitted.set(true);
    await this.dbWrite(this.sb.upsertDemande({
      ref: newD.ref, client: newD.client, detail: newD.detail, type: newD.type,
      date: newD.date, statut: newD.statut, notes: newD.notes,
      email: newD.email, tel: newD.tel,
    }), 'submitDevis');
  }

  resetDevis() {
    this.submitted.set(false); this.devisStep.set(0); this.devisType.set(null); this.devisRef.set('');
    this.impression.set({ produit: '', largeur: '', hauteur: '', quantite: '1', support: '', finitions: [] });
    this.qr.set({ type: '', usage: '', url: '', users: '' });
    this.digital.set({ prestation: '', secteur: '', besoin: '', budget: '' });
    this.contact.set({ nom: '', entreprise: '', email: '', tel: '' });
    this.files.set([]);
  }

  // ────────────────────────────────────────────────────────────
  // DEMANDES
  // ────────────────────────────────────────────────────────────
  async saveDemande(id: number, statut: string, notes: string) {
    this.demandes.set(this.demandes().map(d => d.id === id ? { ...d, statut, notes } : d));
    await this.dbWrite(this.sb.updateDemande(id, statut, notes), 'saveDemande');
    this.toast(this.t().toastSaved);
  }

  // ────────────────────────────────────────────────────────────
  // CONTACTS
  // ────────────────────────────────────────────────────────────
  async submitContact(nom: string, email: string, tel: string, message: string) {
    const newC: Contact = {
      id: Date.now(), nom, email, tel, message,
      createdAt: new Date().toISOString(), lu: false,
    };
    this.contacts.set([newC, ...this.contacts()]);
    await this.dbWrite(this.sb.insertContact({ nom, email, tel, message }), 'submitContact');
  }

  async markContactLu(id: number) {
    this.contacts.set(this.contacts().map(c => c.id === id ? { ...c, lu: true } : c));
    await this.dbWrite(this.sb.markContactLu(id), 'markContactLu');
  }

  async deleteContact(id: number) {
    this.contacts.set(this.contacts().filter(c => c.id !== id));
    await this.dbWrite(this.sb.deleteContact(id), 'deleteContact');
    this.toast(this.t().toastDeleted);
  }

  // ────────────────────────────────────────────────────────────
  // PRODUCTS
  // ────────────────────────────────────────────────────────────
  async addProduct(p: Omit<Product, 'id'>) {
    const product: Product = { ...p, id: 'prod-' + Date.now(), avantages: [] };
    this.products.set([...this.products(), product]);
    await this.dbWrite(this.sb.upsertProduct(this.toDbProduct(product)), 'addProduct');
    this.toast(this.t().toastAdded);
  }

  async updateProduct(id: string, patch: Partial<Product>) {
    this.products.set(this.products().map(p => p.id === id ? { ...p, ...patch } : p));
    const updated = this.products().find(p => p.id === id)!;
    await this.dbWrite(this.sb.upsertProduct(this.toDbProduct(updated)), 'updateProduct');
    this.toast(this.t().toastSaved);
  }

  async deleteProduct(id: string) {
    this.products.set(this.products().filter(p => p.id !== id));
    await this.dbWrite(this.sb.deleteProduct(id), 'deleteProduct');
    this.toast(this.t().toastDeleted);
  }

  private toDbProduct(p: Product) {
    return {
      id: p.id, cat: p.cat, cat_en: p.catEn, fr: p.fr, en: p.en,
      price: p.price, price_en: p.priceEn, d: p.d, d_en: p.dEn,
      color: p.color, ico: p.ico, img: p.img ?? null, avantages: p.avantages,
    };
  }

  // ────────────────────────────────────────────────────────────
  // RÉALISATIONS
  // ────────────────────────────────────────────────────────────
  async addRealisation(r: Omit<Realisation, 'id'>) {
    const real: Realisation = { ...r, id: Date.now() };
    this.realisations.set([...this.realisations(), real]);
    await this.dbWrite(this.sb.upsertRealisation({ fr: r.fr, en: r.en, cat: r.cat, color: r.color, year: r.year, img: r.img ?? null }), 'addRealisation');
    this.toast(this.t().toastAdded);
  }

  async updateRealisation(id: number, patch: Partial<Realisation>) {
    this.realisations.set(this.realisations().map(r => r.id === id ? { ...r, ...patch } : r));
    const updated = this.realisations().find(r => r.id === id)!;
    await this.dbWrite(this.sb.upsertRealisation({ id: updated.id, fr: updated.fr, en: updated.en, cat: updated.cat, color: updated.color, year: updated.year, img: updated.img ?? null }), 'updateRealisation');
    this.toast(this.t().toastSaved);
  }

  async deleteRealisation(id: number) {
    this.realisations.set(this.realisations().filter(r => r.id !== id));
    await this.dbWrite(this.sb.deleteRealisation(id), 'deleteRealisation');
    this.toast(this.t().toastDeleted);
  }

  // ────────────────────────────────────────────────────────────
  // CONTENUS
  // ────────────────────────────────────────────────────────────
  async updateContenu(id: string, body: string | ContactBody) {
    this.contenus.set(this.contenus().map(c => c.id === id ? { ...c, body } : c));
    const updated = this.contenus().find(c => c.id === id)!;
    await this.dbWrite(this.sb.upsertContenu(updated), 'updateContenu');
    this.toast(this.t().toastSaved);
  }

  // ────────────────────────────────────────────────────────────
  // QR CODES
  // ────────────────────────────────────────────────────────────
  async createQrCode(data: Omit<QrCode, 'id' | 'createdAt' | 'scans'>): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const rand  = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const id    = 'SC-' + rand;
    const qr: QrCode = { ...data, id, createdAt: new Date().toISOString().split('T')[0], scans: 0 };
    this.qrCodes.set([qr, ...this.qrCodes()]);
    await this.dbWrite(this.sb.upsertQrCode({
      id: qr.id, name: qr.name, destination: qr.destination,
      active: qr.active, expires_at: qr.expiresAt, max_scans: qr.maxScans ?? null, style: qr.style,
    }), 'createQrCode');
    this.toast('QR créé ✓');
    return id;
  }

  async toggleQrCode(id: string) {
    const qr = this.qrCodes().find(q => q.id === id);
    if (!qr) return;
    const next = { ...qr, active: !qr.active };
    this.qrCodes.set(this.qrCodes().map(q => q.id === id ? next : q));
    await this.dbWrite(this.sb.upsertQrCode({ id, active: next.active }), 'toggleQrCode');
    this.toast(this.t().toastSaved);
  }

  async updateQrCode(id: string, patch: Partial<QrCode>) {
    this.qrCodes.set(this.qrCodes().map(q => q.id === id ? { ...q, ...patch } : q));
    await this.dbWrite(this.sb.upsertQrCode({
      id, name: patch.name, destination: patch.destination,
      expires_at: patch.expiresAt ?? null,
      max_scans: patch.maxScans !== undefined ? patch.maxScans : undefined,
    }), 'updateQrCode');
    this.toast(this.t().toastSaved);
  }

  async deleteQrCode(id: string) {
    this.qrCodes.set(this.qrCodes().filter(q => q.id !== id));
    await this.dbWrite(this.sb.deleteQrCode(id), 'deleteQrCode');
    this.toast(this.t().toastDeleted);
  }

  async incrementQrScans(id: string) {
    const updated = this.qrCodes().map(q => q.id === id ? { ...q, scans: q.scans + 1 } : q);
    this.qrCodes.set(updated);
    await this.sb.incrementScans(id);
    const qr = updated.find(q => q.id === id);
    if (qr && qr.maxScans !== null && qr.scans >= qr.maxScans) {
      await this.toggleQrCode(id);
    }
  }

  // ────────────────────────────────────────────────────────────
  // BANNIÈRES
  // ────────────────────────────────────────────────────────────
  async addBanner(b: Omit<Banner, 'id' | 'createdAt'>) {
    const banner: Banner = { ...b, id: 'ban-' + Date.now(), createdAt: new Date().toISOString() };
    this.banners.set([banner, ...this.banners()]);
    await this.dbWrite(this.sb.upsertBanner(this.toDbBanner(banner)), 'addBanner');
    this.toast(this.t().toastAdded);
  }

  async updateBanner(id: string, patch: Partial<Banner>) {
    this.banners.set(this.banners().map(b => b.id === id ? { ...b, ...patch } : b));
    const updated = this.banners().find(b => b.id === id)!;
    await this.dbWrite(this.sb.upsertBanner(this.toDbBanner(updated)), 'updateBanner');
    this.toast(this.t().toastSaved);
  }

  async toggleBanner(id: string) {
    const banner = this.banners().find(b => b.id === id);
    if (!banner) return;
    const next = { ...banner, active: !banner.active };
    this.banners.set(this.banners().map(b => b.id === id ? next : b));
    await this.dbWrite(this.sb.upsertBanner(this.toDbBanner(next)), 'toggleBanner');
    this.toast(this.t().toastSaved);
  }

  async deleteBanner(id: string) {
    this.banners.set(this.banners().filter(b => b.id !== id));
    await this.dbWrite(this.sb.deleteBanner(id), 'deleteBanner');
    this.toast(this.t().toastDeleted);
  }

  // ────────────────────────────────────────────────────────────
  // TOAST
  // ────────────────────────────────────────────────────────────
  toast(msg: string) {
    this.toastMsg.set(msg);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 2500);
  }
}
