import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ============================================================
  // PUBLIC STRANICE - sa header-om i footer-om
  // ============================================================
  {
    path: '',
    loadComponent: () =>
      import('./shared/layouts/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
        title: 'Stolarska radnja Šikanjić — Namještaj po mjeri od 2000.',
      },
      {
        path: 'o-nama',
        loadComponent: () =>
          import('./pages/about/about.component').then((m) => m.AboutComponent),
        title: 'O nama — Stolarska radnja Šikanjić',
      },
      {
        path: 'usluge',
        loadComponent: () =>
          import('./pages/services/services.component').then((m) => m.ServicesComponent),
        title: 'Usluge — Stolarska radnja Šikanjić',
      },
      {
        path: 'galerija',
        loadComponent: () =>
          import('./pages/gallery/gallery.component').then((m) => m.GalleryComponent),
        title: 'Galerija radova — Stolarska radnja Šikanjić',
      },
      {
        path: 'kontakt',
        loadComponent: () =>
          import('./pages/contact/contact.component').then((m) => m.ContactComponent),
        title: 'Kontakt — Stolarska radnja Šikanjić',
      },
    ],
  },

  // ============================================================
  // LOGIN - bez layouta, redirect ako je vec ulogovan
  // ============================================================
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./admin/login/login.component').then((m) => m.LoginComponent),
    title: 'Prijava — Admin',
  },

  // ============================================================
  // ADMIN PANEL - zahtjeva login
  // ============================================================
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'Dashboard — Admin',
      },
      {
        path: 'galerija',
        loadComponent: () =>
          import('./admin/gallery-admin/gallery-admin.component').then((m) => m.GalleryAdminComponent),
        title: 'Galerija — Admin',
      },
      {
        path: 'upiti',
        loadComponent: () =>
          import('./admin/contact-admin/contact-admin.component').then((m) => m.ContactAdminComponent),
        title: 'Upiti — Admin',
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
