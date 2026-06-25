import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb         = inject(SupabaseService);
  private router     = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isLoggedIn  = signal(false);
  displayName = signal('Administrateur');
  userEmail   = signal('');
  initials    = computed(() => {
    const parts = this.displayName().trim().split(' ').filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'A';
  });

  private sessionTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly SESSION_MS = 30 * 60 * 1000;
  private boundReset = () => this.resetSessionTimer();

  private startSessionTimer() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.clearSessionTimer();
    document.addEventListener('mousemove', this.boundReset);
    document.addEventListener('keydown',   this.boundReset);
    document.addEventListener('click',     this.boundReset);
    this.resetSessionTimer();
  }

  private resetSessionTimer() {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    this.sessionTimer = setTimeout(async () => {
      await this.logout();
      this.router.navigate(['/']);
    }, this.SESSION_MS);
  }

  private clearSessionTimer() {
    if (this.sessionTimer) { clearTimeout(this.sessionTimer); this.sessionTimer = null; }
    if (!isPlatformBrowser(this.platformId)) return;
    document.removeEventListener('mousemove', this.boundReset);
    document.removeEventListener('keydown',   this.boundReset);
    document.removeEventListener('click',     this.boundReset);
  }

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
      this.startSessionTimer();
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
    this.startSessionTimer();
    return true;
  }

  async updateName(name: string) {
    this.displayName.set(name);
    await this.sb.updateUserMeta({ display_name: name });
  }

  async updateEmail(email: string): Promise<{ error: string | null }> {
    const { error } = await this.sb.updateUser({ email });
    if (!error) this.userEmail.set(email);
    return { error: error?.message ?? null };
  }

  async updatePassword(password: string): Promise<{ error: string | null }> {
    const { error } = await this.sb.updateUser({ password });
    return { error: error?.message ?? null };
  }

  async logout() {
    this.clearSessionTimer();
    await this.sb.signOut();
    this.isLoggedIn.set(false);
    this.displayName.set('Administrateur');
    this.userEmail.set('');
  }
}
