import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/integration/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="glass-card login-card">
        <div class="brand">
          <div class="logo">A</div>
          <h1>Agenda Service</h1>
          <p>Entre para gerenciar seus agendamentos</p>
        </div>

        <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" formControlName="email" placeholder="seu@email.com">
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" formControlName="password" placeholder="••••••••">
          </div>

          <button type="submit" class="btn-primary login-btn" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div style="text-align: right; margin-top: 0.5rem; font-size: 0.875rem;">
          <a routerLink="/forgot-password">Esqueceu sua senha?</a>
        </div>

        <p class="register-link">
          Não tem uma conta? <a routerLink="/signup">Cadastre-se</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, var(--bg-secondary), var(--bg-primary));
      padding: 1.5rem;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
    }
    .brand {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo {
      width: 48px;
      height: 48px;
      background: var(--accent-primary);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0 auto 1rem;
      box-shadow: var(--shadow-glow);
    }
    .brand h1 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .brand p {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    .login-btn {
      width: 100%;
      margin-top: 1rem;
    }
    .register-link {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMsg = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMsg = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          if (this.authService.hasRole('ADMIN')) {
            this.router.navigate(['/admin/dashboard']);
          } else if (this.authService.hasRole('CLIENTE')) {
            this.router.navigate(['/user/agendamentos']);
          } else {
            this.router.navigate(['/appointments']);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMsg = 'Credenciais inválidas ou erro no servidor.';
        }
      });
    }
  }
}
