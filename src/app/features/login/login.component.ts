import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <a class="logo" routerLink="/" style="justify-content:center;margin-bottom:28px">
          <div class="logo-icon"><div class="logo-ring"></div><div class="logo-dot"></div></div>
          <div class="logo-text">Support<span>Connecté</span></div>
        </a>
        <h1 class="login-title">Espace admin</h1>
        <p class="login-sub">Connectez-vous pour accéder au tableau de bord.</p>

        <div class="field-group" style="gap:14px">
          <div>
            <label class="field-label-sm">Email</label>
            <input class="field-input" type="email" [(ngModel)]="email" placeholder="admin@exemple.com" (keyup.enter)="submit()">
          </div>
          <div>
            <label class="field-label-sm">Mot de passe</label>
            <input class="field-input" type="password" [(ngModel)]="password" placeholder="••••••••" (keyup.enter)="submit()">
          </div>
        </div>

        @if (error()) {
          <div class="login-error">Identifiant ou mot de passe incorrect.</div>
        }

        <button class="cta-primary login-btn" (click)="submit()" [disabled]="loading()">
          {{ loading() ? 'Connexion…' : 'Se connecter →' }}
        </button>

        <a class="login-back" routerLink="/">← Retour au site</a>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 24px; background: var(--cream);
    }
    .login-card {
      background: #fff; border: 1px solid rgba(15,23,41,.08); border-radius: 24px;
      padding: clamp(32px,5vw,52px); width: 100%; max-width: 420px;
      display: flex; flex-direction: column;
    }
    .login-title {
      font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700;
      font-size: 26px; letter-spacing: -.02em; margin: 0 0 8px; text-align: center;
    }
    .login-sub { font-size: 15px; color: var(--body); margin: 0 0 28px; text-align: center; }
    .login-error {
      margin-top: 14px; padding: 11px 14px; border-radius: 10px;
      background: rgba(255,91,53,.08); color: var(--coral); font-size: 14px; font-weight: 600;
    }
    .login-btn { width: 100%; justify-content: center; margin-top: 20px; padding: 14px; }
    .login-back {
      display: block; text-align: center; margin-top: 18px; font-size: 14px;
      color: var(--body); font-weight: 600; transition: .15s;
    }
    .login-back:hover { color: var(--ink); }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email    = '';
  password = '';
  error    = signal(false);
  loading  = signal(false);

  async submit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(false);
    const ok = await this.auth.login(this.email, this.password);
    this.loading.set(false);
    if (ok) {
      this.router.navigate(['/admin']);
    } else {
      this.error.set(true);
    }
  }
}
