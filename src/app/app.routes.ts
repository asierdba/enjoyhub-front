import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'auth/register',
    redirectTo: '',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/user-profile/user-profile.component').then(m => m.UserProfileComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
