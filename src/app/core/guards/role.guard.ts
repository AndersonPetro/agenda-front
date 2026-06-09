import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../integration/auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check authentication first
  if (!authService.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  // Get required role from route configuration data
  const requiredRole = route.data?.['role'] as string;
  if (!requiredRole) {
    return true; // No specific role required
  }

  // Check if user has the required role
  if (authService.hasRole(requiredRole)) {
    return true;
  }

  // Redirect to access-denied page
  return router.parseUrl('/access-denied');
};
