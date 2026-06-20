import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import type { Database } from '../models/database.types';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient<Database>;

  constructor() {
    this.client = createClient<Database>(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        global: {
          headers: { 'X-Client-Info': 'support-connecte' },
        },
        auth: { persistSession: true },
      }
    );
  }

  // ── Products
  async getProducts()    { return this.client.from('products').select('*').order('created_at'); }
  async upsertProduct(p: any)  { return this.client.from('products').upsert(p); }
  async deleteProduct(id: string) { return this.client.from('products').delete().eq('id', id); }

  // ── Demandes
  async getDemandes()    { return this.client.from('demandes').select('*').order('created_at', { ascending: false }); }
  async upsertDemande(d: any)  { return this.client.from('demandes').upsert(d); }
  async updateDemande(id: number, statut: string, notes: string) {
    return this.client
      .from('demandes')
      .update({ statut, notes })
      .eq('id', id);
  }
  async deleteDemande(id: number) { return this.client.from('demandes').delete().eq('id', id); }

  // ── Réalisations
  async getRealisations() { return this.client.from('realisations').select('*').order('created_at'); }
  async upsertRealisation(r: any) { return this.client.from('realisations').upsert(r); }
  async deleteRealisation(id: number) { return this.client.from('realisations').delete().eq('id', id); }

  // ── Contenus
  async getContenus()    { return this.client.from('contenus').select('*'); }
  async upsertContenu(c: any)  { return this.client.from('contenus').upsert(c); }

  // ── Auth
  async signIn(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }
  async signOut()    { return this.client.auth.signOut(); }
  async getSession() { return this.client.auth.getSession(); }
  async updateUserMeta(meta: { display_name?: string }) {
    return this.client.auth.updateUser({ data: meta });
  }
  async updateUser(data: { email?: string; password?: string }) {
    return this.client.auth.updateUser(data);
  }

  // ── QR Codes
  async getQrCodes()     { return this.client.from('qr_codes').select('*').order('created_at', { ascending: false }); }
  async upsertQrCode(q: any)   { return this.client.from('qr_codes').upsert(q); }
  async deleteQrCode(id: string) { return this.client.from('qr_codes').delete().eq('id', id); }
  async incrementScans(id: string) {
    return this.client.rpc('increment_qr_scans' as any, { qr_id: id } as any);
  }
}
