import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthRequest, AuthResponse, RecoveryPassword, RecoveryConfirm, RecoveryResponse } from './auth.model';
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

  passwordRecovery(request: RecoveryPassword): Observable<RecoveryResponse> {
    return this.http.post<RecoveryResponse>(`${this.apiUrl}/recovery`, request);
  }

  confirmPasswordRecovery(request: RecoveryConfirm): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recovery/confirm`, request);
  }

  refresh(refreshToken: string): Observable<AuthResponse> {
    // Caso a API suporte
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken });
  }
}
