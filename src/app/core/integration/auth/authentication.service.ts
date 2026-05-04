import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthRequest, AuthResponse, RecoveryPassword } from './auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  auth(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, authRequest);
  }

  // Se precisar de signup com AuthRequest ou SignupRequest, basta mapear aqui
  signup(request: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, request);
  }

  passwordRecovery(request: RecoveryPassword): Observable<void> {
    // Caso ainda não exista na API real, mantivemos a base URL
    return this.http.post<void>(`${this.apiUrl}/recovery`, request);
  }

  refresh(refreshToken: string): Observable<AuthResponse> {
    // Caso a API suporte
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken });
  }
}
