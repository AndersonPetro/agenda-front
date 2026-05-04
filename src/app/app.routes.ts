import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { authGuard } from './core/guards/auth.guard';

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
  { path: '', redirectTo: '/appointments', pathMatch: 'full' },
  { path: '**', redirectTo: '/appointments' }
];
