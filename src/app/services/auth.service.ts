import { Injectable, signal, computed } from '@angular/core';

const CREDENTIALS = { username: 'admin', password: 'admin2024' };
const STORAGE_KEY  = 'sc_auth';
const NAME_KEY     = 'sc_name';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn   = signal(!!sessionStorage.getItem(STORAGE_KEY));
  displayName  = signal(sessionStorage.getItem(NAME_KEY) || 'Administrateur');
  initials     = computed(() => {
    const parts = this.displayName().trim().split(' ');
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  });

  login(username: string, password: string): boolean {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      this.isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  updateName(name: string) {
    this.displayName.set(name);
    sessionStorage.setItem(NAME_KEY, name);
  }

  logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    this.isLoggedIn.set(false);
  }
}
