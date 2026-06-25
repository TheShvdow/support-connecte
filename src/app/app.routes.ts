import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'catalogue', loadComponent: () => import('./features/catalogue/catalogue.component').then(m => m.CatalogueComponent) },
  { path: 'catalogue/:id', loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'devis', loadComponent: () => import('./features/devis/devis.component').then(m => m.DevisComponent) },
  { path: 'realisations', loadComponent: () => import('./features/realisations/realisations.component').then(m => m.RealisationsComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'qr', canActivate: [authGuard], loadComponent: () => import('./features/qr-generator/qr-generator.component').then(m => m.QrGeneratorComponent) },
  { path: 'r/:id', loadComponent: () => import('./features/qr-redirect/qr-redirect.component').then(m => m.QrRedirectComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'admin', canActivate: [authGuard], loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
  { path: '**', redirectTo: '' },
];
