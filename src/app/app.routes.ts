import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AccessDeniedComponent } from './auth/access-denied/access-denied.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./auth/login/about-agenda/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('./core/integration/services/service-list/service-list.component').then(m => m.ServiceListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'appointments',
    loadComponent: () => import('./appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'book',
    loadComponent: () => import('./appointments/appointment-booking/appointment-booking.component').then(m => m.AppointmentBookingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [roleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'cliente/agendamentos',
    loadComponent: () => import('./features/cliente/agendamentos/cliente-agendamentos.component').then(m => m.ClienteAgendamentosComponent),
    canActivate: [roleGuard],
    data: { role: 'CLIENTE' }
  },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '', redirectTo: '/appointments', pathMatch: 'full' },
  { path: '**', redirectTo: '/appointments' }
];
