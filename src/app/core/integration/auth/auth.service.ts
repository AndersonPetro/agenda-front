import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { AuthRequest, AuthResponse } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authServiceApi = inject(AuthenticationService);
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    const email = credentials.email.toLowerCase();

    // Check mock credentials first for easy testing
    if (email === 'admin@agenda.com' || email === 'cliente@agenda.com') {
      const isAdmin = email === 'admin@agenda.com';
      const mockResponse: AuthResponse = {
        accessToken: 'mock-jwt-token-for-testing',
        user: {
          id: isAdmin ? 'admin-id' : 'cliente-id',
          name: isAdmin ? 'Admin Agenda' : 'Cliente Agenda',
          email: email
        }
      };

      return new Observable<AuthResponse>(subscriber => {
        if (this.isBrowser()) {
          localStorage.setItem('userRole', isAdmin ? 'ADMIN' : 'CLIENTE');
        }
        this.setSession(mockResponse);
        subscriber.next(mockResponse);
        subscriber.complete();
      });
    }

    const authRequest: AuthRequest = {
      email: credentials.email,
      password: credentials.password
    };
    return this.authServiceApi.auth(authRequest).pipe(
      tap((response) => this.setSession(response))
    );
  }

  signup(userData: any): Observable<AuthResponse> {
    return this.authServiceApi.signup(userData).pipe(
      tap((response) => {
        if (response && response.accessToken) {
          this.setSession(response);
        }
      })
    );
  }

  private setSession(authResult: AuthResponse) {
    if (!this.isBrowser()) return;

    const token = authResult.accessToken || authResult.access_token;
    const refreshToken = authResult.refreshToken || authResult.refresh_token;

    if (token) {
      localStorage.setItem('token', token);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    let user = authResult.user;
    if (!user && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        user = {
          id: payload.sub,
          name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || payload.preferred_username || '',
          email: payload.email || ''
        };
      } catch (e) {
        console.error('Failed to decode JWT token', e);
      }
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      const userId = user.id || user.email;
      localStorage.setItem('userId', userId);
    }
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getUserId(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('userId');
    }
    return null;
  }

  getUser(): any {
    if (this.isBrowser()) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getUserRoles(): string[] {
    if (!this.isBrowser()) return [];

    const testRole = localStorage.getItem('userRole');
    if (testRole) {
      return [testRole];
    }

    const token = this.getToken();
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const realmRoles = payload.realm_access?.roles || [];
      const resourceRoles = payload.resource_access || {};
      const clientRoles = Object.keys(resourceRoles).flatMap(client => resourceRoles[client].roles || []);
      return [...realmRoles, ...clientRoles];
    } catch (e) {
      console.error('Failed to decode roles from JWT token', e);
      return [];
    }
  }

  hasRole(role: string): boolean {
    const roles = this.getUserRoles().map(r => r.toUpperCase());
    return roles.includes(role.toUpperCase());
  }
}
