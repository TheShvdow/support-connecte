export interface Product {
  id: string;
  cat: string;
  catEn: string;
  fr: string;
  en: string;
  price: string;
  priceEn: string;
  d: string;
  dEn: string;
  color: string;
  ico: string;
  avantages: string[];
  img?: string;
}

export interface Realisation {
  id: number;
  fr: string;
  en: string;
  cat: string;
  color: string;
  year: string;
  img?: string;
}

export interface Demande {
  id: number;
  ref: string;
  client: string;
  detail: string;
  type: string;
  date: string;
  statut: string;
  notes: string;
  email: string;
  tel: string;
}

export interface Contenu {
  id: string;
  title: string;
  body: string;
}

export interface ImpressionForm {
  produit: string;
  largeur: string;
  hauteur: string;
  quantite: string;
  support: string;
  finitions: string[];
}

export interface QrForm {
  type: string;
  usage: string;
  url: string;
  users: string;
}

export interface DigitalForm {
  prestation: string;
  secteur: string;
  besoin: string;
  budget: string;
}

export interface ContactForm {
  nom: string;
  entreprise: string;
  email: string;
  tel: string;
}

export type DevisType = 'impression' | 'qr' | 'digital' | null;
export type AdminTab = 'demandes' | 'catalogue' | 'realisations' | 'contenus';
export type Lang = 'fr' | 'en';
