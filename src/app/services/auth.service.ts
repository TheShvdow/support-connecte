import { Injectable, signal, computed, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb = inject(SupabaseService);

  isLoggedIn  = signal(false);
  displayName = signal('Administrateur');
  userEmail   = signal('');
  initials    = computed(() => {
    const parts = this.displayName().trim().split(' ').filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'A';
  });

  async init() {
    const { data: { session } } = await this.sb.getSession();
    if (session?.user) {
      this.isLoggedIn.set(true);
      this.userEmail.set(session.user.email ?? '');
      this.displayName.set(
        session.user.user_metadata?.['display_name'] ||
        session.user.email?.split('@')[0] ||
        'Administrateur'
      );
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    const { data, error } = await this.sb.signIn(email, password);
    if (error || !data.user) return false;
    this.isLoggedIn.set(true);
    this.userEmail.set(data.user.email ?? '');
    this.displayName.set(
      data.user.user_metadata?.['display_name'] ||
      data.user.email?.split('@')[0] ||
      'Administrateur'
    );
    return true;
  }

  async updateName(name: string) {
    this.displayName.set(name);
    await this.sb.updateUserMeta({ display_name: name });
  }

  async logout() {
    await this.sb.signOut();
    this.isLoggedIn.set(false);
    this.displayName.set('Administrateur');
    this.userEmail.set('');
  }
}
