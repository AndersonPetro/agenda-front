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
      username: credentials.email,
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
    if (authResult.accessToken) {
      localStorage.setItem('token', authResult.accessToken);
    }
    if (authResult.user) {
      localStorage.setItem('user', JSON.stringify(authResult.user));
      // Save user id or email as the userId
      const userId = (authResult.user as any).id || authResult.user.email;
      localStorage.setItem('userId', userId);
    }
  }

  logout() {
    localStorage.removeItem('token');
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
