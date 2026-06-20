import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'catalogue', loadComponent: () => import('./features/catalogue/catalogue.component').then(m => m.CatalogueComponent) },
  { path: 'catalogue/:id', loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'devis', loadComponent: () => import('./features/devis/devis.component').then(m => m.DevisComponent) },
  { path: 'realisations', loadComponent: () => import('./features/realisations/realisations.component').then(m => m.RealisationsComponent) },
  { path: 'admin', loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
  { path: '**', redirectTo: '' },
];
