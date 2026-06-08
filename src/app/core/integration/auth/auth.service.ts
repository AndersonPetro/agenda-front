import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { AuthRequest, AuthResponse } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authServiceApi = inject(AuthenticationService);

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
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
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
