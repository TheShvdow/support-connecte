import { Injectable, signal } from '@angular/core';

const CREDENTIALS = { username: 'admin', password: 'admin2024' };
const STORAGE_KEY = 'sc_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal(!!sessionStorage.getItem(STORAGE_KEY));

  login(username: string, password: string): boolean {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      this.isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    this.isLoggedIn.set(false);
  }
}
